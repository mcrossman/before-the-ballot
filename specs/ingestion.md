# Data Ingestion Specification

## Overview

Automated scraping pipeline using Convex scheduled functions to pull ballot measure data from California Secretary of State and Santa Clara County websites.

## Data Sources

### California Secretary of State
- **URL**: https://www.sos.ca.gov/elections/ballot-measures/qualified-ballot-measures
- **Format**: HTML listing → Individual measure PDFs
- **Scope**: Statewide ballot measures (Propositions)
- **Frequency**: Daily at 6 AM PT

### Santa Clara County
- **URL**: https://vote.santaclaracounty.gov/list-local-measures-2
- **Format**: HTML listing → Individual measure PDFs
- **Scope**: County and city measures within Santa Clara County
- **Frequency**: Daily at 6:05 AM PT (5 min delay after CA)

## Scraping Architecture

```
Scheduled Function (Daily)
    │
    ▼
Fetch Listing Page
    │
    ├── Success ───┬─── Parse HTML for measure links
    │                │
    │                ▼
    │           For each measure link:
    │                │
    │                ├── Download PDF
    │                ├── Extract text
    │                ├── Calculate textHash (SHA256)
    │                ├── Check if exists in DB
    │                │       ├── Yes + hash matches → Skip
    │                │       ├── Yes + hash differs → Update (unlikely)
    │                │       └── No → Insert new measure
    │                │
    │                └── Log result (success/fail)
    │
    └── Failure ────► Retry tomorrow (exp backoff if repeated)
```

## Convex Functions

### Scheduled Jobs

```typescript
// convex/jobs/scrape.ts
import { cron } from "convex/server";

// CA SoS scraper - runs daily at 6:00 AM PT
cron({
  name: "scrape-ca-sos",
  schedule: "0 9 * * *", // 9 AM UTC = 6 AM PT (winter) / 2 AM PT (summer)
  handler: async (ctx) => {
    await ctx.runAction(api.jobs.scrapeCaSos, {});
  },
});

// Santa Clara scraper - runs daily at 6:05 AM PT
cron({
  name: "scrape-santa-clara",
  schedule: "5 9 * * *",
  handler: async (ctx) => {
    await ctx.runAction(api.jobs.scrapeSantaClara, {});
  },
});
```

### Scraping Actions

```typescript
// convex/jobs/scrapeCaSos.ts
export const scrapeCaSos = action({
  args: {},
  handler: async (ctx): Promise<ScrapeResult> => {
    const jobId = await ctx.runMutation(api.jobs.createJob, {
      source: "ca-sos",
      status: "running",
    });

    try {
      // Fetch listing page
      const listingHtml = await fetchWithRetry(
        "https://www.sos.ca.gov/elections/ballot-measures/qualified-ballot-measures"
      );

      // Parse measure links
      const measureLinks = parseCaSosListing(listingHtml);
      
      const results = {
        processed: 0,
        new: 0,
        updated: 0,
        failed: [] as string[],
      };

      // Process each measure
      for (const link of measureLinks) {
        try {
          await processCaMeasure(ctx, link);
          results.processed++;
        } catch (err) {
          results.failed.push(link.url);
          console.error(`Failed to process measure ${link.url}:`, err);
        }
      }

      await ctx.runMutation(api.jobs.completeJob, {
        jobId,
        status: "completed",
        results,
      });

      return results;
    } catch (err) {
      await ctx.runMutation(api.jobs.completeJob, {
        jobId,
        status: "failed",
        error: String(err),
      });
      throw err;
    }
  },
});
```

## Data Extraction

### CA SoS Parsing

```typescript
interface CaMeasureLink {
  url: string;           // PDF URL
  measureNumber: string; // "Proposition 1"
  title: string;         // From page text
  electionDate?: string; // Extract from context
}

function parseCaSosListing(html: string): CaMeasureLink[] {
  // Use cheerio or similar to parse HTML
  // Look for:
  // - Links ending in .pdf
  // - Text containing "Proposition N" pattern
  // - Associated title text
  
  // Example structure:
  // <div class="measure">
  //   <h3>Proposition 1</h3>
  //   <p>Housing Bond Measure</p>
  //   <a href="/path/to/prop1.pdf">Text</a>
  // </div>
}

async function processCaMeasure(ctx: ActionCtx, link: CaMeasureLink) {
  // Download PDF
  const pdfBuffer = await fetchWithRetry(link.url);
  
  // Extract text
  const text = await extractPdfText(pdfBuffer);
  
  // Calculate hash
  const textHash = crypto.createHash('sha256').update(text).digest('hex');
  
  // Check existing
  const existing = await ctx.runQuery(api.measures.findByUrl, { url: link.url });
  
  if (existing) {
    if (existing.textHash === textHash) {
      // No change, skip
      return { action: 'unchanged' };
    } else {
      // Update (rare, but handle it)
      await ctx.runMutation(api.measures.updateMeasure, {
        id: existing._id,
        officialText: text,
        textHash,
        lastUpdatedAt: Date.now(),
      });
      return { action: 'updated' };
    }
  } else {
    // New measure
    await ctx.runMutation(api.measures.createMeasure, {
      measureNumber: link.measureNumber,
      title: link.title,
      officialText: text,
      textHash,
      sourceUrl: link.url,
      jurisdiction: { type: 'state', name: 'California' },
      firstSeenAt: Date.now(),
      lastUpdatedAt: Date.now(),
      // Election date parsed from context or left null
    });
    return { action: 'created' };
  }
}
```

### Santa Clara County Parsing

Similar approach, adapted to their HTML structure:

```typescript
interface LocalMeasureLink {
  url: string;
  measureNumber: string; // "Measure A", "Measure B", etc.
  title: string;
  jurisdiction: {
    type: 'county' | 'city';
    name: string; // "Santa Clara County" or city name
  };
}

function parseSantaClaraListing(html: string): LocalMeasureLink[] {
  // Parse https://vote.santaclaracounty.gov/list-local-measures-2
  // Look for measure listings with:
  // - Measure letter/number
  // - Title
  // - PDF link
  // - Jurisdiction indicator (county vs city)
}
```

## PDF Text Extraction

### Implementation Options

**Option A: pdf-parse (Node.js)**
```typescript
import pdfParse from 'pdf-parse';

async function extractPdfText(buffer: Buffer): Promise<string> {
  const data = await pdfParse(buffer);
  return data.text;
}
```

**Option B: pdf2json**
```typescript
import PDFParser from 'pdf2json';

async function extractPdfText(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const parser = new PDFParser();
    parser.on('pdfParser_dataReady', (pdfData) => {
      resolve(pdfData.RawTextContent);
    });
    parser.on('pdfParser_dataError', reject);
    parser.parseBuffer(buffer);
  });
}
```

**Recommendation**: Start with `pdf-parse` (simpler API), fallback to `pdf2json` if formatting issues.

### Text Cleaning

```typescript
function cleanMeasureText(rawText: string): string {
  return rawText
    .replace(/\n{3,}/g, '\n\n')     // Normalize multiple newlines
    .replace(/\f/g, '\n')           // Replace form feeds with newlines
    .replace(/\s+/g, ' ')           // Normalize whitespace (optional)
    .trim();
}
```

## Error Handling

### Retry Logic

```typescript
async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  maxRetries = 3
): Promise<Response> {
  let lastError: Error;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;
      throw new Error(`HTTP ${response.status}`);
    } catch (err) {
      lastError = err as Error;
      
      if (attempt < maxRetries - 1) {
        // Exponential backoff: 1s, 2s, 4s
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(r => setTimeout(r, delay));
      }
    }
  }
  
  throw lastError;
}
```

### Failure Types

| Failure | Action |
|---------|--------|
| Individual measure PDF fails | Log, continue to next measure |
| Listing page fails | Fail entire job, retry tomorrow |
| HTML structure changed | Fail job, notify admins |
| PDF extraction fails | Log specific measure, continue |

### Admin Notifications

```typescript
// Notify on structural changes or repeated failures
async function notifyAdmins(message: string) {
  // Send email via SendGrid/AWS SES
  // Or post to Slack webhook
  console.error(`ADMIN ALERT: ${message}`);
}

// Usage in error handler:
if (isStructuralError(err)) {
  await notifyAdmins(`CA SoS scraper structure changed: ${err.message}`);
}
```

## Database Schema Updates

### Add source tracking to measures:

```typescript
// convex/schema.ts
measures: defineTable({
  // ... existing fields ...
  
  // Source tracking
  sourceUrl: v.string(),
  sourceType: v.union(
    v.literal('ca-sos'),
    v.literal('santa-clara-county')
  ),
  
  // Scraping metadata
  scrapedAt: v.number(),
  scrapeJobId: v.id("ingestionJobs"),
})
  .index("by_source_url", ["sourceUrl"])
  .index("by_source_type", ["sourceType"]),
```

### Job tracking table:

```typescript
ingestionJobs: defineTable({
  source: v.union(v.literal('ca-sos'), v.literal('santa-clara')),
  status: v.union(v.literal('running'), v.literal('completed'), v.literal('failed')),
  startedAt: v.number(),
  completedAt: v.optional(v.number()),
  
  // Results
  measuresProcessed: v.number(),
  measuresNew: v.number(),
  measuresUpdated: v.number(),
  measuresFailed: v.array(v.string()), // URLs that failed
  
  // Error info
  error: v.optional(v.string()),
  errorType: v.optional(v.union(
    v.literal('network'),
    v.literal('parsing'),
    v.literal('structure'),
    v.literal('unknown')
  )),
})
  .index("by_source_started", ["source", "startedAt"])
  .index("by_status", ["status"]),
```

## Historical Backfill

### 4-Year Lookback Strategy

```typescript
// convex/jobs/backfillHistorical.ts
export const backfillHistorical = internalAction({
  args: {
    source: v.union(v.literal('ca-sos'), v.literal('santa-clara')),
    years: v.array(v.number()), // [2024, 2022, 2020, 2018]
  },
  handler: async (ctx, args) => {
    // Manual backfill job
    // Look for archive pages or historical listings
    // CA SoS: https://www.sos.ca.gov/elections/prior-elections
    
    for (const year of args.years) {
      try {
        const archiveUrl = getArchiveUrl(args.source, year);
        // Scrape archive page for that year's measures
        // Process each measure
      } catch (err) {
        console.error(`Failed to backfill ${year}:`, err);
        // Continue to next year
      }
    }
  },
});
```

**Note**: Historical data availability varies. Some years may not have the same PDF format.

## File Structure

```
convex/
├── jobs/
│   ├── scrapeCaSos.ts         # CA SoS scraper action
│   ├── scrapeSantaClara.ts    # Santa Clara scraper action
│   ├── backfillHistorical.ts  # Manual backfill action
│   └── lib.ts                 # Shared scraping utilities
├── lib/
│   ├── pdf.ts                 # PDF text extraction
│   ├── fetch.ts               # Retry logic
│   └── parsers.ts             # HTML parsing utilities
├── schema.ts                  # Updated with source tracking
├── measures.ts                # Measure mutations/queries
└── ingestionJobs.ts           # Job tracking
```

## Monitoring

### Dashboard Queries

```typescript
// Recent job status
export const getRecentJobs = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("ingestionJobs")
      .order("desc")
      .take(args.limit ?? 10);
  },
});

// Measures by source
export const getMeasuresBySource = query({
  args: { sourceType: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("measures")
      .withIndex("by_source_type", q => q.eq("sourceType", args.sourceType))
      .collect();
  },
});
```

## Environment Variables

```bash
# Add to Convex environment
ADMIN_EMAIL=admin@beforetheballot.com
SLACK_WEBHOOK_URL=...  # Optional, for notifications
```

## Dependencies

```json
{
  "dependencies": {
    "pdf-parse": "^1.1.1",
    "cheerio": "^1.0.0-rc.12"
  }
}
```

## Open Questions

1. **Election date extraction**: How to reliably determine which election a measure belongs to?
2. **Fiscal impact extraction**: Some measures have separate fiscal analysis PDFs—do we fetch those?
3. **Measure withdrawal**: How do we detect if a measure is removed from the qualified list?
4. **PDF formatting**: Some PDFs may be scanned images (not text)—need OCR fallback?
