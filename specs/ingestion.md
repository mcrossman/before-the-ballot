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
    │                ├── Extract text ("use node")
    │                ├── Calculate SHA256 hash
    │                ├── Check if exists in DB
    │                │       ├── Yes + hash matches → Skip
    │                │       ├── Yes + hash differs → Update (rare)
    │                │       └── No → Insert new measure
    │                │
    │                └── Log result (success/fail)
    │
    └── Failure ────► Retry tomorrow (exp backoff if repeated)
```

## Convex Functions

### Scheduled Jobs

```typescript
// packages/backend/convex/crons.ts
import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// CA SoS scraper - runs daily at 6:00 AM PT
crons.cron(
  "scrape-ca-sos",
  "0 9 * * *", // 9 AM UTC = 6 AM PT (winter) / 2 AM PT (summer)
  internal.jobs.index.scrapeCaSos,
  {}
);

// Santa Clara scraper - runs daily at 6:05 AM PT
crons.cron(
  "scrape-santa-clara",
  "5 9 * * *",
  internal.jobs.index.scrapeSantaClara,
  {}
);

export default crons;
```

### Scraping Actions

Uses `internalAction` (not `action`) so cron jobs can reference them:

```typescript
// convex/jobs/scrapeCaSos.ts
import { internalAction } from "../_generated/server";

export const scrapeCaSos = internalAction({
  args: {},
  handler: async (ctx): Promise<ScrapeResult> => {
    const jobId = await ctx.runMutation(api.ingestionJobs.create, {
      source: "ca-sos",
      status: "running",
      startedAt: Date.now(),
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
          await processCaMeasure(ctx, link, jobId);
          results.processed++;
        } catch (err) {
          results.failed.push(link.url);
          console.error(`Failed to process measure ${link.url}:`, err);
        }
      }

      await ctx.runMutation(api.ingestionJobs.complete, {
        jobId,
        status: "completed",
        completedAt: Date.now(),
        measuresProcessed: results.processed,
        measuresNew: results.new,
        measuresUpdated: results.updated,
        measuresFailed: results.failed,
      });

      return results;
    } catch (err) {
      await ctx.runMutation(api.ingestionJobs.complete, {
        jobId,
        status: "failed",
        completedAt: Date.now(),
        error: String(err),
      });
      throw err;
    }
  },
});
```

## Data Extraction

### CA SoS Parsing

Handles both qualified propositions and pending legislative measures (SCA, ACA, SB, AB).

```typescript
interface CaMeasureLink {
  url: string;           // PDF URL
  measureNumber: string; // "Proposition 1" or "SCA 1" or "ACA 13"
  title: string;         // From page text
  electionDate?: string; // Extract from context
}

function parseCaSosListing(html: string): CaMeasureLink[] {
  const measures: CaMeasureLink[] = [];
  const foundUrls = new Set<string>();

  // Pattern 1: Look for "Proposition N" followed by title and PDF link
  const propositionPattern =
    /Proposition\s+(\d+)[\s\S]*?([^\n]+)[\s\S]*?href="([^"]+\.pdf)"/gi;

  let match;
  while ((match = propositionPattern.exec(html)) !== null) {
    const measureNumber = `Proposition ${match[1]}`;
    const title = cleanTitle(match[2]);
    const url = normalizeCaUrl(match[3]);

    if (!foundUrls.has(url)) {
      foundUrls.add(url);
      measures.push({ url, measureNumber, title });
    }
  }

  // Pattern 2: Look for ballot-measures PDF links
  // URLs like: elections.cdn.sos.ca.gov/ballot-measures/pdf/sca-1-24.pdf
  const pdfLinkPattern = /href="([^"]*ballot-measures[^"]*\.pdf)"/gi;

  while ((match = pdfLinkPattern.exec(html)) !== null) {
    const url = normalizeCaUrl(match[1]);
    if (!foundUrls.has(url)) {
      foundUrls.add(url);
      
      // Extract measure identifier from URL
      // sca-1-24.pdf -> SCA 1, aca-13.pdf -> ACA 13, sb-42.pdf -> SB 42
      const urlMatch = url.match(/\/([^\/]+)\.pdf$/);
      if (urlMatch) {
        const fileName = urlMatch[1];
        const measureMatch = fileName.match(/^(sca|aca|sb|ab|prop)[-_]?(\d+)/i);
        if (measureMatch) {
          const type = measureMatch[1].toUpperCase();
          const number = measureMatch[2];
          const measureNumber = type === "PROP" 
            ? `Proposition ${number}` 
            : `${type} ${number}`;
          const title = extractTitleNearLink(html, match.index);
          
          measures.push({ url, measureNumber, title });
        }
      }
    }
  }

  return measures;
}
```

**Supported Measure Types:**
- `Proposition N` - Qualified ballot measures
- `SCA N` - Senate Constitutional Amendments
- `ACA N` - Assembly Constitutional Amendments  
- `SB N` - Senate Bills
- `AB N` - Assembly Bills

async function processCaMeasure(ctx: any, link: CaMeasureLink, jobId: string) {
  // Call PDF extraction action (runs in Node.js via "use node")
  const { text, textHash } = await ctx.runAction(
    internal.lib.pdfExtraction.extractPdfText,
    { url: link.url }
  );
  
  // Check existing by source URL
  const existing = await ctx.runQuery(api.measures.findBySourceUrl, { 
    sourceUrl: link.url 
  });
  
  if (existing) {
    if (existing.textHash === textHash) {
      // No change, skip
      return { action: 'unchanged' };
    } else {
      // Update text and hash (rare)
      await ctx.runMutation(api.measures.update, {
        id: existing._id,
        officialText: text,
        textHash,
        lastUpdatedAt: Date.now(),
      });
      return { action: 'updated' };
    }
  } else {
    // New measure - store extracted text and hash
    await ctx.runMutation(api.measures.create, {
      measureNumber: link.measureNumber,
      title: link.title,
      officialText: text,
      textHash,
      officialTextUrl: link.url,
      sourceUrl: link.url,
      sourceType: 'ca-sos',
      jurisdiction: { type: 'state', name: 'California' },
      status: 'upcoming',
      firstSeenAt: Date.now(),
      lastUpdatedAt: Date.now(),
      scrapedAt: Date.now(),
      scrapeJobId: jobId,
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

## Full Document Extraction with "use node"

PDF text extraction requires Node.js APIs (crypto, fs, Buffer) that are not available in Convex's default V8 isolate runtime. We use the `"use node"` directive in an `internalAction` to enable full document parsing with comprehensive text extraction.

### Architecture

```
Scraper Action (internalAction - V8 isolate)
    │
    ├── Runs in V8 isolate (default)
    │
    └── Calls ctx.runAction() ──► PDF Extraction Action ("use node")
                                      │
                                      ├── Runs in Node.js runtime
                                      ├── pdf-parse (Node.js)
                                      ├── crypto (Node.js)
                                      └── Returns FullExtractionResult
```

### Full Document Extraction Action

**File:** `convex/lib/pdfExtraction.ts`

Extracts comprehensive document content including:
- **Full text**: Complete document text with preserved structure
- **Pages**: Page-by-page text array for precise citation mapping
- **Metadata**: PDF properties (title, author, creation date, PDF version)
- **Statistics**: Page count, word count, character count
- **Structure hints**: Detected sections and headers

```typescript
"use node";

import { internalAction } from "../_generated/server";
import { v } from "convex/values";
import crypto from "crypto";

interface PdfMetadata {
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string;
  creator?: string;
  producer?: string;
  creationDate?: string;
  modificationDate?: string;
  pdfVersion?: string;
}

interface ExtractionStats {
  pageCount: number;
  wordCount: number;
  charCount: number;
}

interface FullExtractionResult {
  // Complete concatenated text
  fullText: string;
  // Page-by-page breakdown for citation mapping
  pages: string[];
  // Document metadata
  metadata: PdfMetadata;
  // Extraction statistics
  stats: ExtractionStats;
  // SHA256 hash of full text for change detection
  textHash: string;
}

/**
 * Extract all text content from PDF with full structure preservation
 * Called by scrapers to comprehensively process PDF content
 */
export const extractPdfFull = internalAction({
  args: {
    url: v.string(),
  },
  handler: async (_ctx, args): Promise<FullExtractionResult> => {
    // Fetch PDF
    const response = await fetch(args.url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: HTTP ${response.status}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    const pdfParse = await import("pdf-parse");
    
    // Extract with page callback to get per-page text
    const pages: string[] = [];
    const data = await pdfParse.default(buffer, {
      pagerender: (pageData: any) => {
        return pageData.getTextContent()
          .then((textContent: any) => {
            const text = textContent.items
              .map((item: any) => item.str)
              .join(" ");
            pages.push(cleanPageText(text));
            return text;
          });
      }
    });

    // Build full text from pages (ensures consistency)
    const fullText = pages.join("\n\n--- Page Break ---\n\n");
    
    // Calculate hash from full text
    const textHash = crypto.createHash("sha256").update(fullText).digest("hex");

    // Extract metadata
    const metadata: PdfMetadata = {
      title: data.info?.Title,
      author: data.info?.Author,
      subject: data.info?.Subject,
      keywords: data.info?.Keywords,
      creator: data.info?.Creator,
      producer: data.info?.Producer,
      creationDate: data.info?.CreationDate,
      modificationDate: data.info?.ModDate,
      pdfVersion: data.version,
    };

    // Calculate statistics
    const stats: ExtractionStats = {
      pageCount: data.numpages || pages.length,
      wordCount: fullText.split(/\s+/).filter(w => w.length > 0).length,
      charCount: fullText.length,
    };

    return {
      fullText,
      pages,
      metadata,
      stats,
      textHash,
    };
  },
});

/**
 * Clean individual page text
 */
function cleanPageText(text: string): string {
  return text
    .replace(/\r\n/g, "\n")        // Normalize line endings
    .replace(/\r/g, "\n")
    .replace(/\n{3,}/g, "\n\n")    // Normalize multiple newlines
    .replace(/\f/g, "")            // Remove form feeds
    .trim();
}
```

### Usage in Scrapers

```typescript
// convex/jobs/scrapeCaSos.ts
import { internal } from "../_generated/api";

async function processCaMeasure(ctx: any, link: CaMeasureLink, jobId: string) {
  // Extract full document content (runs in Node.js via "use node")
  const extraction = await ctx.runAction(
    internal.lib.pdfExtraction.extractPdfFull, 
    { url: link.url }
  );
  
  // Check existing by hash
  const existing = await ctx.runQuery(api.measures.findBySourceUrl, { 
    sourceUrl: link.url 
  });
  
  if (existing) {
    if (existing.textHash === extraction.textHash) {
      return "unchanged";
    } else {
      await ctx.runMutation(api.measures.updateFull, {
        id: existing._id,
        fullText: extraction.fullText,
        pages: extraction.pages,
        metadata: extraction.metadata,
        stats: extraction.stats,
        textHash: extraction.textHash,
        lastUpdatedAt: Date.now(),
      });
      return "updated";
    }
  } else {
    await ctx.runMutation(api.measures.createFull, {
      measureNumber: link.measureNumber,
      title: link.title,
      fullText: extraction.fullText,
      pages: extraction.pages,
      metadata: extraction.metadata,
      stats: extraction.stats,
      textHash: extraction.textHash,
      officialTextUrl: link.url,
      sourceUrl: link.url,
      sourceType: "ca-sos",
      jurisdiction: { type: "state", name: "California" },
      status: "upcoming",
      firstSeenAt: Date.now(),
      lastUpdatedAt: Date.now(),
      scrapedAt: Date.now(),
      scrapeJobId: jobId,
    });
    return "created";
  }
}
```

### Benefits of Full Extraction

**Page-Level Citations**: The `pages` array enables precise citations with page numbers:
```typescript
// Find which page contains a citation
const citationPage = measure.pages.findIndex(page => 
  page.includes(citationText)
) + 1; // 1-indexed page number
```

**Metadata Preservation**: PDF metadata reveals document source and authenticity:
- `producer`: Software that created PDF (e.g., "Adobe PDF Library")
- `creationDate`: When the official document was published
- `creator`: Original authoring tool

**Structure Preservation**: Page breaks are explicitly marked with `--- Page Break ---` allowing reconstruction of document layout.

**Statistics**: Word and character counts help assess document complexity and support AI context window planning.

### Legacy Support

The original `extractPdfText` action remains available for backward compatibility:

```typescript
// Simple text extraction (legacy)
export const extractPdfText = internalAction({
  args: { url: v.string() },
  handler: async (_ctx, args) => {
    const result = await extractPdfFull.handler(_ctx, args);
    return {
      text: result.fullText,
      textHash: result.textHash,
    };
  },
});
```
Scraper Action (internalAction - V8 isolate)
    │
    ├── Runs in V8 isolate (default)
    │
    └── Calls ctx.runAction() ──► PDF Extraction Action ("use node")
                                      │
                                      ├── Runs in Node.js runtime
                                      ├── pdf-parse (Node.js)
                                      ├── crypto (Node.js)
                                      └── Returns { text, textHash }
```

### PDF Extraction Action

**File:** `convex/lib/pdfExtraction.ts`

```typescript
"use node";

import { internalAction } from "../_generated/server";
import { v } from "convex/values";
import crypto from "crypto";

/**
 * Extract text from PDF and calculate hash
 * Called by scrapers via ctx.runAction()
 */
export const extractPdfText = internalAction({
  args: {
    url: v.string(),
  },
  handler: async (_ctx, args): Promise<{ text: string; textHash: string }> => {
    // Fetch PDF
    const response = await fetch(args.url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: HTTP ${response.status}`);
    }

    // Extract text using pdf-parse (Node.js library)
    const buffer = Buffer.from(await response.arrayBuffer());
    const pdfParse = await import("pdf-parse");
    const data = await pdfParse.default(buffer);
    const text = cleanMeasureText(data.text);
    
    // Calculate SHA256 hash for deduplication
    const textHash = crypto.createHash("sha256").update(text).digest("hex");

    return { text, textHash };
  },
});
```

### Usage in Scrapers

```typescript
// convex/jobs/scrapeCaSos.ts
import { internal } from "../_generated/api";

async function processCaMeasure(ctx: any, link: CaMeasureLink, jobId: string) {
  // Call PDF extraction action (runs in Node.js via "use node")
  const { text, textHash } = await ctx.runAction(
    internal.lib.pdfExtraction.extractPdfText, 
    { url: link.url }
  );
  
  // Check existing by hash
  const existing = await ctx.runQuery(api.measures.findBySourceUrl, { 
    sourceUrl: link.url 
  });
  
  if (existing) {
    if (existing.textHash === textHash) {
      return "unchanged";
    } else {
      await ctx.runMutation(api.measures.update, {
        id: existing._id,
        officialText: text,
        textHash,
        lastUpdatedAt: Date.now(),
      });
      return "updated";
    }
  } else {
    await ctx.runMutation(api.measures.create, {
      measureNumber: link.measureNumber,
      title: link.title,
      officialText: text,
      textHash,
      officialTextUrl: link.url,
      sourceUrl: link.url,
      sourceType: "ca-sos",
      jurisdiction: { type: "state", name: "California" },
      status: "upcoming",
      firstSeenAt: Date.now(),
      lastUpdatedAt: Date.now(),
      scrapedAt: Date.now(),
      scrapeJobId: jobId,
    });
    return "created";
  }
}
```
Scraper Action (internalAction)
    │
    ├── Runs in V8 isolate (default)
    │
    └── Calls PDF extraction function ──► "use node" runtime
                                              │
                                              ├── pdf-parse (Node.js)
                                              ├── crypto (Node.js)
                                              └── Returns { text, textHash }
```

### PDF Extraction Module

**File:** `convex/lib/pdfExtraction.ts`

```typescript
"use node";

import crypto from "crypto";

/**
 * Extract text from PDF using pdf-parse
 */
export async function extractPdfText(buffer: Buffer): Promise<string> {
  const pdfParse = await import("pdf-parse");
  const data = await pdfParse.default(buffer);
  return cleanMeasureText(data.text);
}

/**
 * Calculate SHA256 hash for deduplication
 */
export function calculateTextHash(text: string): string {
  return crypto.createHash("sha256").update(text).digest("hex");
}

/**
 * Fetch PDF and extract in one operation
 */
export async function fetchAndExtractPdf(url: string): Promise<{
  text: string;
  textHash: string;
}> {
  const response = await fetch(url);
  const buffer = Buffer.from(await response.arrayBuffer());
  const text = await extractPdfText(buffer);
  const textHash = calculateTextHash(text);
  
  return { text, textHash };
}
```

### Usage in Scrapers

```typescript
// convex/jobs/scrapeCaSos.ts
import { fetchAndExtractPdf } from "../lib/pdfExtraction";

async function processCaMeasure(ctx: any, link: CaMeasureLink, jobId: string) {
  // Download and extract PDF text (transparently uses "use node")
  const { text, textHash } = await fetchAndExtractPdf(link.url);
  
  // Check existing by hash
  const existing = await ctx.runQuery(api.measures.findBySourceUrl, { 
    sourceUrl: link.url 
  });
  
  if (existing) {
    if (existing.textHash === textHash) {
      return "unchanged";
    } else {
      await ctx.runMutation(api.measures.update, {
        id: existing._id,
        officialText: text,
        textHash,
        lastUpdatedAt: Date.now(),
      });
      return "updated";
    }
  } else {
    await ctx.runMutation(api.measures.create, {
      measureNumber: link.measureNumber,
      title: link.title,
      officialText: text,
      textHash,
      officialTextUrl: link.url,
      sourceUrl: link.url,
      sourceType: "ca-sos",
      jurisdiction: { type: "state", name: "California" },
      status: "upcoming",
      firstSeenAt: Date.now(),
      lastUpdatedAt: Date.now(),
      scrapedAt: Date.now(),
      scrapeJobId: jobId,
    });
    return "created";
  }
}
```

### Why "use node"?

**Advantages:**
- Full PDF text extraction and storage
- SHA256 hashing for reliable change detection
- Database-searchable measure content
- No client-side PDF parsing needed

**Trade-offs:**
- Slightly slower cold starts for Node.js functions
- Higher memory usage during PDF processing
- Requires separate file with `"use node"` directive

**Implementation Notes:**
- Only the PDF extraction file needs `"use node"`
- Scrapers remain as `internalAction` (V8 isolate)
- Convex automatically handles the runtime transition
- pdf-parse and pdf2json work out of the box

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

### Measures with Full Document Extraction:

```typescript
// convex/schema.ts
measures: defineTable({
  // Identification
  measureNumber: v.string(),
  electionId: v.optional(v.id("elections")),
  jurisdiction: v.object({
    type: v.union(v.literal("state"), v.literal("county"), v.literal("city")),
    name: v.string(),
    fipsCode: v.optional(v.string()),
  }),

  // Full Content Extraction
  title: v.string(),
  officialText: v.string(),                    // Legacy: full concatenated text
  fullText: v.string(),                        // Complete document text with page breaks
  pages: v.array(v.string()),                  // Page-by-page text array for citations
  
  // PDF Metadata
  metadata: v.object({
    title: v.optional(v.string()),
    author: v.optional(v.string()),
    subject: v.optional(v.string()),
    keywords: v.optional(v.string()),
    creator: v.optional(v.string()),
    producer: v.optional(v.string()),
    creationDate: v.optional(v.string()),
    modificationDate: v.optional(v.string()),
    pdfVersion: v.optional(v.string()),
  }),
  
  // Extraction Statistics
  stats: v.object({
    pageCount: v.number(),
    wordCount: v.number(),
    charCount: v.number(),
  }),
  
  // Change Detection
  textHash: v.string(),                        // SHA256 of fullText for deduplication
  
  // Source References
  officialTextUrl: v.optional(v.string()),     // Source PDF URL
  fiscalImpactText: v.optional(v.string()),
  sourceUrl: v.string(),
  sourceType: v.union(
    v.literal('ca-sos'),
    v.literal('santa-clara-county')
  ),

  // Status
  status: v.union(
    v.literal('upcoming'),
    v.literal('active'),
    v.literal('passed'),
    v.literal('failed'),
    v.literal('withdrawn')
  ),
  outcome: v.optional(
    v.object({
      passed: v.boolean(),
      yesVotes: v.number(),
      noVotes: v.number(),
      percentYes: v.number(),
    })
  ),

  // Scraping Metadata
  firstSeenAt: v.number(),
  lastUpdatedAt: v.number(),
  electionDate: v.optional(v.number()),
  scrapedAt: v.number(),
  scrapeJobId: v.id("ingestionJobs"),
})
  .index("by_election", ["electionId"])
  .index("by_jurisdiction", ["jurisdiction.name"])
  .index("by_status", ["status"])
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
packages/backend/convex/
├── jobs/
│   ├── index.ts               # Exports all job actions
│   ├── scrapeCaSos.ts         # CA SoS scraper (internalAction)
│   └── scrapeSantaClara.ts    # Santa Clara scraper (internalAction)
├── lib/
│   ├── pdfExtraction.ts       # PDF text extraction ("use node")
│   ├── fetch.ts               # Retry logic
│   └── parsers.ts             # HTML parsing utilities
├── schema.ts                  # Measures with full extraction fields
├── measures.ts                # Measure mutations/queries (createFull/updateFull)
├── ingestionJobs.ts           # Job tracking
└── crons.ts                   # Scheduled job definitions
```

### Convex Code Generation

After adding new files in `convex/lib/` or modifying internal actions, regenerate the Convex API:

```bash
npx convex codegen
# or during development:
npx convex dev
```

This generates `_generated/api.d.ts` which includes the `internal.lib` path for calling `extractPdfFull`.

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
    "pdf2json": "^4.0.2",
    "cheerio": "^1.0.0-rc.12"
  }
}
```

**Note:** PDF extraction libraries require the `"use node"` directive. They are isolated to `lib/pdfExtraction.ts` so the rest of the app runs in the default V8 isolate runtime.
