# Demo Data Specification

**Status**: ✅ Implemented  
**Document**: Demo Data for ACA 13  
**Source**: `sample_data/aca-13.pdf`  
**Location**: `apps/web/src/lib/demo-data.ts`  
**Code**: `apps/web/src/lib/demo-data.ts`  
**Last Updated**: 2025-01-31

## Overview

This specification documents the demo data created from ACA 13 (Assembly Constitutional Amendment No. 13 - "Protect and Retain the Majority Vote Act"). This data serves as the foundation for developing and testing the measure summary view UI before the full ingestion pipeline is operational.

## Source Document

- **File**: `sample_data/aca-13.pdf`
- **Type**: Assembly Constitutional Amendment
- **Number**: ACA 13
- **Title**: Protect and Retain the Majority Vote Act
- **Adopted**: September 14, 2023
- **Filed**: November 2, 2023
- **Pages**: 6

## Data Structure

### File Location
```
apps/web/src/lib/demo-data.ts
```

### Exported Types

```typescript
// Citation - References to specific text in the official document
interface Citation {
  textSpan: string;        // Exact quoted text
  startOffset: number;     // Character position in fullText
  endOffset: number;       // Character position in fullText
  context?: string;        // Optional: description of context
}

// Insight - AI-generated analysis with citations
interface Insight {
  _id: string;
  measureId: string;
  type: "summary" | "fiscal" | "legal_changes" | "affected_groups" | "conflicts";
  content: string;
  confidence: "high" | "medium" | "low";
  uncertaintyFlags?: string[];
  citations: Citation[];
  generatedAt: number;
  model: string;
  promptVersion: string;
}

// Measure - The ballot measure itself
interface Measure {
  _id: string;
  measureNumber: string;
  title: string;
  jurisdiction: {
    type: "state" | "county" | "city";
    name: string;
    fipsCode?: string;
  };
  status: "upcoming" | "active" | "passed" | "failed";
  measureType: "Bond Measure" | "Statute" | "Constitutional Amendment" | "Referendum";
  estimatedCost?: {
    amount: number;
    unit: string;
    timeframe: string;
  };
  officialTextUrl: string;
  fullText: string;
  pages: string[];
  metadata: {
    title?: string;
    subject?: string;
    keywords?: string;
    producer?: string;
    creationDate?: string;
    modificationDate?: string;
    pdfVersion?: string;
  };
  stats: {
    pageCount: number;
    wordCount: number;
    charCount: number;
  };
  textHash: string;
  sourceUrl: string;
  sourceType: "ca-sos" | "santa-clara-county";
  firstSeenAt: number;
  lastUpdatedAt: number;
  scrapedAt: number;
}

// Election - The election this measure appears on
interface Election {
  _id: string;
  date: number;
  type: "primary" | "general" | "special";
  year: number;
  jurisdictions: string[];
}
```

## Demo Data Content

### 1. Measure Data (`demoMeasure`)

**ACA 13 - Protect and Retain the Majority Vote Act**

| Field | Value |
|-------|-------|
| measureNumber | ACA 13 |
| title | Protect and Retain the Majority Vote Act |
| jurisdiction.type | state |
| jurisdiction.name | California |
| jurisdiction.fipsCode | 06 |
| status | upcoming |
| measureType | Constitutional Amendment |
| officialTextUrl | /sample_data/aca-13.pdf |
| sourceUrl | https://www.sos.ca.gov/elections/ballot-measures/qualified-ballot-measures |
| sourceType | ca-sos |

**Metadata (from PDF)**:
- PDF Producer: Adobe Acrobat Pro (32-bit) 23 Paper Capture Plug-in
- Creation Date: November 2, 2023
- PDF Version: 1.6
- Page Count: 6
- Keywords: "Assembly Constitutional Amendment No. 13"

**Statistics**:
- Character count: ~4,800
- Word count: ~750
- Page count: 6

### 2. Full Text Extraction

The full text was extracted from the PDF using page-by-page parsing, preserving:
- Page breaks (marked with `--- Page Break ---`)
- Section headers
- Legislative formatting
- Resolution structure

The text is stored in `fullText` with individual pages in the `pages` array for citation mapping.

### 3. Insights (`demoInsights`)

Five insights have been generated based on the measure text:

#### Summary Insight
**Type**: summary  
**Content**: ACA 13 would amend the California Constitution to require that any future ballot initiative seeking to increase voting thresholds (such as requiring a two-thirds majority instead of simple majority) must itself be approved by that same higher threshold. The measure also authorizes local governments to hold advisory votes on governance issues.

**Citations**:
1. Section 10.5(b) - The threshold-matching requirement
2. Section 7.8 - Advisory vote authorization

**Confidence**: high

#### Fiscal Impact Insight
**Type**: fiscal  
**Content**: ACA 13 has no direct fiscal impact on state or local government. It does not allocate any funds, create new taxes, or require additional spending. Local governments may incur minimal administrative costs if they choose to conduct advisory votes.

**Citations**:
1. Section 7.8 - Non-binding nature of advisory votes

**Confidence**: high  
**Uncertainty Flags**: ["Actual costs for advisory votes would depend on frequency chosen by local governments"]

#### Legal Changes Insight
**Type**: legal_changes  
**Content**: ACA 13 makes three constitutional changes: (1) Amends Article II, Section 10; (2) Adds Article II, Section 10.5 with threshold rules; (3) Adds Article XI, Section 7.8 for advisory votes. Applies to initiatives on or after January 1, 2024.

**Citations**:
1. First Amendment - Section 10 modification
2. Second Amendment - Section 10.5 creation
3. Third Amendment - Section 7.8 creation
4. Section 10.5(c) - Effective date
5. Fourth - Severability clause

**Confidence**: high

#### Affected Groups Insight
**Type**: affected_groups  
**Content**: Directly affects: (1) Voters and organizations seeking to pass threshold-increasing initiatives; (2) Local governments and residents regarding advisory votes; (3) Interest groups involved in future initiatives. Explicitly protects pre-2024 constitutional provisions including Proposition 13.

**Citations**:
1. WHEREAS clause - Grandfathering of existing provisions
2. Section 7.8 - Local government authority

**Confidence**: medium  
**Uncertainty Flags**: ["Indirect effects on future initiative campaigns cannot be fully predicted"]

#### Conflicts Insight
**Type**: conflicts  
**Content**: Potential conflicts: (1) Overrides Article XVIII, Section 4; (2) Advisory votes are permissive not mandatory, avoiding direct conflict; (3) Courts may need to interpret borderline cases of "increasing voter approval requirement."

**Citations**:
1. Section 10.5(b) - "Notwithstanding Section 4 of Article XVIII"
2. Section 7.8 - Non-binding results

**Confidence**: medium

### 4. Election Data (`demoElection`)

| Field | Value |
|-------|-------|
| \_id | demo-election-2024-march |
| date | March 5, 2024 |
| type | primary |
| year | 2024 |
| jurisdictions | ["California"] |

## Helper Functions

The demo data module exports helper functions for working with the data:

```typescript
// Get insight by type
getInsightByType(type: Insight['type']): Insight | undefined

// Get all insights for a specific measure
getInsightsForMeasure(measureId: string): Insight[]

// Find which page contains a citation (1-indexed)
findCitationPage(citation: Citation): number
```

## Citation Mapping

Each citation includes character offsets into `fullText`. Page mapping is calculated by:

1. Iterating through `pages` array
2. Tracking cumulative character count
3. Comparing citation offset to page ranges
4. Returning 1-indexed page number

Example:
```typescript
const citation = {
  startOffset: 2450,
  endOffset: 2520,
  textSpan: "annual debt service..."
};
const page = findCitationPage(citation); // Returns 5
```

## Alignment with Specs

This demo data follows the specifications defined in:

### Ingestion Spec
- ✅ Full text extraction with page breaks preserved
- ✅ Page-by-page text array for citation mapping
- ✅ PDF metadata extraction (producer, dates, version)
- ✅ Statistics (word count, char count, page count)
- ✅ SHA256 hash placeholder (`textHash`)
- ✅ Source URL and type tracking
- ✅ Timestamp fields (firstSeenAt, lastUpdatedAt, scrapedAt)

### Measure Summary View Spec
- ✅ Complete `Measure` interface matching schema
- ✅ `Insight` interface with type, content, citations
- ✅ `Citation` interface with text spans and offsets
- ✅ Multiple insight types (summary, fiscal, legal_changes, affected_groups, conflicts)
- ✅ Confidence levels (high/medium/low)
- ✅ Uncertainty flags for caveats
- ✅ Generation metadata (model, timestamp, prompt version)

## Usage

Import and use in route components:

```typescript
import { demoMeasure, demoInsights, demoElection } from '@/lib/demo-data';

// In a route component
function MeasureSummaryPage() {
  const useDemo = import.meta.env.VITE_USE_DEMO_DATA === 'true';
  
  if (useDemo) {
    return (
      <MeasureSummary 
        measure={demoMeasure}
        insights={demoInsights}
        election={demoElection}
      />
    );
  }
  
  // ... real data fetching
}
```

## Environment Variable

```bash
# .env.local
VITE_USE_DEMO_DATA=true
```

## Convex Deployment

### Seeding ACA 13 to Convex

The `seedAca13` action in `packages/backend/convex/jobs/seedAca13.ts` will:
1. Parse the PDF from `sample_data/aca-13.pdf`
2. Store extracted text as a Convex file (via `ctx.storage`)
3. Create the measure record with file reference
4. Create 5 insights in the `insights` table

**To run the seeder:**

```bash
cd packages/backend
npx convex dev  # Start dev server (handles Node runtime)
# Then in another terminal:
npx convex run jobs/seedAca13
```

**Note**: The Convex bundler has issues with pdf-parse during `codegen`, but `convex dev` and `convex deploy` properly handle the "use node" runtime. The seeder uses:
- Dynamic import for pdf-parse
- Convex file storage for extracted text
- Database mutations for measure and insights

### Data Storage

**Text File Storage:**
- Location: Convex `_storage` table
- Reference: `measures.textFileId` (v.id("_storage"))
- Size: ~5KB for ACA 13
- Type: text/plain

**Insights Table:**
- 5 insights per measure (summary, fiscal, legal_changes, affected_groups, conflicts)
- Each insight has citations with offsets
- Query via: `internal.insights.getByMeasure`

## Future Updates

When the real ingestion pipeline is ready:
1. Remove `VITE_USE_DEMO_DATA` environment variable
2. Import types from Convex generated files
3. Replace demo data with real Convex queries
4. Keep file as reference/example for data structure

## Related Documents

- [Measure Summary View](./measure-summary-view.md) - UI specification using this data
- [Ingestion](./ingestion.md) - Data extraction and storage pipeline
- [Concept](./concept.md) - Original product concept and insight types
