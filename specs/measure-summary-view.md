# Measure Summary View Specification

**Status**: ✅ Phase 1 Implemented  
**Based on**: [UX/UI Design Specification](./ux-ui.md), [Concept](./concept.md), [Ingestion](./ingestion.md)  
**Code Location**: `apps/web/src/routes/measures/$measureSlug.tsx`  
**Last Updated**: 2025-01-31 (Phase 1 Complete - Demo Data)  

## Overview

Implement the detailed measure view that appears when clicking a measure from the list. This view presents AI-generated insights about a ballot measure in an article-style scrollable layout, with the plain language summary always visible and additional insights in expandable accordion sections. Every insight includes verifiable citations to the original measure text.

## URL Structure

```
/measures/{jurisdiction-type}/{jurisdiction-name}/{measure-slug}

Examples:
- /measures/state/prop-1
- /measures/county/santa-clara/measure-a
- /measures/city/san-jose/measure-b
```

**Slug Generation**: Derived from `measureNumber` field by:
1. Lowercasing
2. Replacing spaces with hyphens
3. Removing special characters
4. Appending jurisdiction identifier when needed for uniqueness

Example: "Proposition 1" → `prop-1`, "Measure A" (Santa Clara County) → `measure-a-santa-clara`

**Lookup Strategy**: Query by `measureNumber` directly (indexed lookup) rather than storing a separate slug field. The slug is for URL aesthetics only.

## Layout

### Article-Style Scroll Layout (Default)

```
┌─────────────────────────────────────────────────────────┐
│  Header                                                 │
│  [Home]    [Location: San Francisco, CA]    [Sign In]   │
├─────────────────────────────────────────────────────────┤
│  ← All Measures                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Proposition 1                              [Share]     │
│  Housing Bond Measure                                   │
│  State of California • November 2024 General Election   │
│                                                         │
│  ┌─────────────────────────────────────────────────────┐│
│  │ 📋 SUMMARY                                          ││
│  │                                                     ││
│  │ This measure authorizes $10 billion in general      ││
│  │ obligation bonds for affordable housing projects    ││
│  │ statewide. The bonds would be repaid over 30 years  ││
│  │ through state taxes.                                ││
│  │                                                     ││
│  │ [View in official text]                             ││
│  └─────────────────────────────────────────────────────┘│
│                                                         │
│  QUICK FACTS                                            │
│  ━━━━━━━━━━━━━                                          │
│  • Status: Upcoming                                     │
│  • Type: Bond Measure                                   │
│  • Estimated Cost: $171 million/year                    │
│  • Voting Deadline: November 5, 2024                    │
│                                                         │
│  ┌─────────────────────────────────────────────────────┐│
│  │ 💰 FISCAL IMPACT                           [Expand] ││
│  │ This measure creates long-term debt obligations...  ││
│  └─────────────────────────────────────────────────────┘│
│                                                         │
│  ┌─────────────────────────────────────────────────────┐│
│  │ ⚖️ LEGAL CHANGES                           [Expand] ││
│  │ Modifies Health and Safety Code Section 53570...    ││
│  └─────────────────────────────────────────────────────┘│
│                                                         │
│  ┌─────────────────────────────────────────────────────┐│
│  │ 👥 AFFECTED GROUPS                         [Expand] ││
│  │ Low-income renters, housing developers...           ││
│  └─────────────────────────────────────────────────────┘│
│                                                         │
│  ┌─────────────────────────────────────────────────────┐│
│  │ ⚠️ POTENTIAL CONFLICTS                     [Expand] ││
│  │ May conflict with local zoning laws...              ││
│  └─────────────────────────────────────────────────────┘│
│                                                         │
│  [💾 Save Your Position]  [💬 Ask a Question]           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Expanded Insight Section

When user clicks [Expand], the section reveals:

```
┌─────────────────────────────────────────────────────────┐
│ 💰 FISCAL IMPACT                               [Collapse]│
├─────────────────────────────────────────────────────────┤
│                                                         │
│ This measure authorizes $10 billion in general          │
│ obligation bonds. The bonds will be repaid over 30      │
│ years with estimated annual debt service of             │
│ $171 million.                                           │
│                                                         │
│ 📚 CITATIONS                                            │
│ ━━━━━━━━━━━━                                            │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ SECTION 3, LINE 45                                  │ │
│ │                                                     │ │
│ │ "The sum of ten billion dollars                     │ │
│ │ ($10,000,000,000) is hereby appropriated..."        │ │
│ │                                                     │ │
│ │ [View in context]                                   │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ SECTION 4, LINE 12                                  │ │
│ │                                                     │ │
│ │ "annual debt service of approximately               │ │
│ │ $171 million..."                                    │ │
│ │                                                     │ │
│ │ [View in context]                                   │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ 📊 Confidence: High  ⚠️ Uncertainties: None             │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Historical Measure View (Passed/Failed)

For historical measures with `outcome` data:

```
┌─────────────────────────────────────────────────────────┐
│  Proposition 1                                          │
│  Housing Bond Measure                                   │
│  State of California • November 2022 General Election   │
│                                                         │
│  ┌─────────────────────────────────────────────────────┐│
│  │ RESULT                                              ││
│  │ ✅ PASSED — 56.3% Yes / 43.7% No                    ││
│  │ 8,245,123 votes for • 6,394,219 votes against       ││
│  └─────────────────────────────────────────────────────┘│
│                                                         │
│  📋 SUMMARY (AI Analysis from October 2022)             │
│  ...                                                    │
│                                                         │
│  [✅ Prediction: Correct] The AI predicted this would   │
│  pass based on polling trends and historical patterns.  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Content Structure

### Header Section

- **← All Measures** link - navigates back to `/measures`
- **Measure Number** - `measureNumber` field (e.g., "Proposition 1")
- **Title** - `title` field
- **Jurisdiction** - `jurisdiction.name` + election info
- **Share Button** - copies "{Measure Title} - beforetheballot.com/measures/{slug}" to clipboard

### Summary Section (Always Visible)

- **Content** - Insight with `type: "summary"` from insights table
- **Citation Links** - Inline "[View in official text]" links that open citation blocks
- **Quick Facts** - Structured fields in measures table:
  - Status: `measures.status`
  - Type: `measures.measureType` (new field: "Bond Measure", "Statute", "Constitutional Amendment", etc.)
  - Estimated Cost: `measures.estimatedCost` (new field, extracted during ingestion)
  - Voting Deadline: From `elections.date`

### Expandable Insight Sections

In fixed order (per UX spec):

1. **💰 Fiscal Impact** (`type: "fiscal"`)
2. **⚖️ Legal Changes** (`type: "legal_changes"`)
3. **👥 Affected Groups** (`type: "affected_groups"`)
4. **⚠️ Potential Conflicts** (`type: "conflicts"`)

Each section shows:
- **Preview text** - First 1-2 sentences of insight content
- **Expand/Collapse toggle**
- When expanded:
  - Full insight content
  - Citation blocks with original measure text
  - Confidence level and uncertainty flags

### Citation Blocks

Each citation displays:
- **Location** - Section/line reference (derived from `citations.startOffset` + context)
- **Quoted Text** - `citations.textSpan` (exact excerpt from insight generation)
- **Context Button** - Opens modal with LLM-generated text view

**Citation Data Structure** (from schema):
```typescript
{
  textSpan: string,      // Exact quoted text
  startOffset: number,   // Character position in official text
  endOffset: number,     // Character position in official text
  context?: string       // Optional: minimal surrounding context
}
```

**Text View Modal**: Clicking "[View in context]" opens a modal displaying LLM-generated structured markup of the official measure text (not raw PDF):

```
┌─────────────────────────────────────────────────────────┐
│  Official Text: Proposition 1                  [✕ Close]│
├─────────────────────────────────────────────────────────┤
│                                                         │
│  SECTION 3. Appropriation                               │
│                                                         │
│  [Read earlier ↑]                                      │
│                                                         │
│     ...preceding context would appear here...          │
│                                                         │
│  ╔══════════════════════════════════════════════════╗  │
│  ║ "The sum of ten billion dollars                  ║  │
│  ║ ($10,000,000,000) is hereby appropriated..."     ║  │
│  ╚══════════════════════════════════════════════════╝  │
│                                                         │
│     ...following context would appear here...          │
│                                                         │
│  [Read later ↓]                                        │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  Section 3 of 12    [← Previous] [Next →]               │
└─────────────────────────────────────────────────────────┘
```

The modal shows:
- The cited section with minimal surrounding context by default
- **"Read earlier"** / **"Read later"** buttons to expand more context incrementally
- Section navigation (previous/next)
- Highlighted cited text

**Context Expansion Logic**:
```typescript
// Default: Show 200 chars before and after citation
const DEFAULT_CONTEXT_SIZE = 200;
// Each "Read earlier/later" click expands by 500 more chars
const EXPANSION_INCREMENT = 500;

// State management
const [contextRange, setContextRange] = useState({
  startOffset: Math.max(0, citation.startOffset - DEFAULT_CONTEXT_SIZE),
  endOffset: Math.min(textMarkup.length, citation.endOffset + DEFAULT_CONTEXT_SIZE)
});

const handleReadEarlier = () => {
  setContextRange(prev => ({
    ...prev,
    startOffset: Math.max(0, prev.startOffset - EXPANSION_INCREMENT)
  }));
};

const handleReadLater = () => {
  setContextRange(prev => ({
    ...prev,
    endOffset: Math.min(textMarkup.length, prev.endOffset + EXPANSION_INCREMENT)
  }));
};
```

**Implementation Note**: Initially use demo data for a specific PDF. The LLM-generated markup will be produced during ingestion phase (see Dependencies).

### Position/Actions Bar

Sticky at bottom on mobile, inline on desktop:
- **Save Your Position** - Support / Oppose / Undecided (saves to `userStances`)
- **Ask a Question** - Opens chat interface (per Chat spec)

## Data Dependencies

### Required Tables/Fields

**measures table**:
- `measureNumber` - For display and slug generation
- `title` - Full measure title
- `jurisdiction` - Type, name, FIPS code
- `electionId` - Links to elections table
- `status` - upcoming, active, passed, failed
- `outcome` - For historical measures (passed, yesVotes, noVotes, percentYes)
- `officialTextUrl` - PDF URL for citation context
- `fiscalImpactText` - Optional official fiscal analysis
- `measureType` - "Bond Measure", "Statute", "Constitutional Amendment", etc. *(new)*
- `estimatedCost` - Structured cost data (amount, timeframe, unit) *(new)*
- `textMarkup` - LLM-generated structured HTML/markdown of official text *(new)*

**insights table** (Pre-generated at ingestion time):
- `measureId` - Links to measure
- `type` - summary, fiscal, legal_changes, affected_groups, conflicts
- `content` - AI-generated plain language explanation
- `citations` - Array of text spans with offsets
- `confidence` - high, medium, low
- `uncertaintyFlags` - Array of vague language warnings
- `generatedAt` - Timestamp for AI generation
- `predictionAccuracy` - For historical measures (correct, partial, incorrect)

**Note**: Insights are generated in batch after measure ingestion, not on-demand. The ingestion process will trigger LLM analysis for all measures nightly.

**elections table**:
- `date` - For voting deadline display
- `type` - primary, general, special

**userStances table** (if authenticated):
- `stance` - support, oppose, undecided
- `personalNotes` - Optional user notes

### Convex Queries

**File**: `packages/backend/convex/measures.ts`

```typescript
// Get measure by slug (measure number)
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    // Convert slug to measure number pattern
    // e.g., "prop-1" -> "Proposition 1"
    const measureNumber = slugToMeasureNumber(args.slug);
    
    return await ctx.db
      .query("measures")
      .withIndex("by_measure_number", q => q.eq("measureNumber", measureNumber))
      .unique();
  },
});

// Get all insights for a measure
export const getInsights = query({
  args: { measureId: v.id("measures") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("insights")
      .withIndex("by_measure", q => q.eq("measureId", args.measureId))
      .collect();
  },
});

// Get measure with related data (single query)
export const getMeasureWithInsights = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const measureNumber = slugToMeasureNumber(args.slug);
    const measure = await ctx.db
      .query("measures")
      .withIndex("by_measure_number", q => q.eq("measureNumber", measureNumber))
      .unique();
    
    if (!measure) return null;
    
    const [insights, election] = await Promise.all([
      ctx.db.query("insights")
        .withIndex("by_measure", q => q.eq("measureId", measure._id))
        .collect(),
      measure.electionId ? ctx.db.get(measure.electionId) : null
    ]);
    
    return { measure, insights, election };
  },
});

// Helper: Convert slug to measure number
function slugToMeasureNumber(slug: string): string {
  // Convert "prop-1" to "Proposition 1"
  // Convert "measure-a-santa-clara" to "Measure A"
  const parts = slug.split('-');
  const base = parts[0];
  const number = parts[1];
  
  const typeMap: Record<string, string> = {
    'prop': 'Proposition',
    'measure': 'Measure',
    'initiative': 'Initiative'
  };
  
  const type = typeMap[base] || base;
  const num = number.toUpperCase();
  
  return `${type} ${num}`;
}
```

**Schema Index Addition**:
```typescript
// Add to packages/backend/convex/schema.ts
measures: defineTable({
  // ... existing fields ...
})
  .index("by_measure_number", ["measureNumber"]) // Add this
  .index("by_election", ["electionId"])
  // ... other indexes ...
```

## Responsive Behavior

### Mobile (< 640px)

- Single column layout
- Accordion sections stack vertically
- "All Measures" link prominent at top
- Position bar sticky at bottom
- Citations shown inline within accordions
- Share button in header

### Desktop (> 1024px)

- Centered content column (max-width: 768px)
- Larger typography
- Position bar inline below content
- Optional: Citations could appear in side panel (future enhancement)

## URL Routing

### TanStack Start Route

**File**: `apps/web/src/routes/measures/$measureSlug.tsx`

```typescript
import { createFileRoute, useLoaderData } from '@tanstack/react-router';
import { useQuery } from 'convex/react';
import { api } from '@repo/backend/convex/_generated/api';
import { MeasureSummary } from '@/components/measure/MeasureSummary';
import { MeasureNotFound } from '@/components/measure/MeasureNotFound';

export const Route = createFileRoute('/measures/$measureSlug')({
  component: MeasureSummaryPage,
  loader: async ({ params }) => {
    // Return params only - actual data fetching happens in component
    // This allows for client-side caching and reactivity
    return { slug: params.measureSlug };
  },
});

function MeasureSummaryPage() {
  const { slug } = useLoaderData({ from: '/measures/$measureSlug' });
  
  // Demo mode: use hardcoded data
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
  
  // Real data mode
  const data = useQuery(api.measures.getMeasureWithInsights, { slug });
  
  if (data === undefined) {
    return <MeasureSummarySkeleton />;
  }
  
  if (data === null) {
    return <MeasureNotFound />;
  }
  
  return (
    <MeasureSummary 
      measure={data.measure}
      insights={data.insights}
      election={data.election}
    />
  );
}
```

**Environment Variable**:
```bash
# .env.local
VITE_USE_DEMO_DATA=true  # Set to false when connecting to real Convex backend
```

### Slug Resolution

Slug is generated at query time from `measureNumber`:

```typescript
function generateSlug(measure: Doc<"measures">): string {
  const base = measure.measureNumber
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
  
  // Add jurisdiction disambiguation if needed
  if (measure.jurisdiction.type !== 'state') {
    const jurisdictionSlug = measure.jurisdiction.name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    return `${base}-${jurisdictionSlug}`;
  }
  
  return base;
}

// Route loader queries by measureNumber directly
const measure = await ctx.db
  .query("measures")
  .withIndex("by_measure_number", q => q.eq("measureNumber", measureNumberFromSlug))
  .unique();
```

## Component Structure

```
apps/web/src/
├── routes/
│   └── measures/
│       └── $measureSlug.tsx          # Main route component
├── components/
│   └── measure/
│       ├── MeasureSummary.tsx         # Main layout
│       ├── MeasureHeader.tsx          # Title, jurisdiction, share
│       ├── QuickFacts.tsx             # Status, cost, deadline
│       ├── InsightAccordion.tsx       # Expandable insight sections
│       ├── InsightCard.tsx            # Individual insight display
│       ├── CitationBlock.tsx          # Quoted text with context
│       ├── TextViewModal.tsx          # LLM-generated text with context expansion
│       ├── HistoricalOutcome.tsx      # Results for passed/failed
│       └── PositionBar.tsx            # Support/Oppose/Undecided
```

### Component Props

```typescript
// MeasureHeader.tsx
interface MeasureHeaderProps {
  measureNumber: string;
  title: string;
  jurisdiction: { type: string; name: string };
  election?: { date: number; type: string };
  onShare: () => void;
}

// QuickFacts.tsx
interface QuickFactsProps {
  status: 'upcoming' | 'active' | 'passed' | 'failed';
  measureType?: string;
  estimatedCost?: { amount: number; unit: string; timeframe: string };
  votingDeadline?: number;
}

// InsightAccordion.tsx
interface InsightAccordionProps {
  insights: Insight[];
  expandedInsightId: string | null;
  onToggle: (insightId: string) => void;
  onViewContext: (citation: Citation) => void;
}

// CitationBlock.tsx
interface CitationBlockProps {
  citation: Citation;
  onViewContext: () => void;
}

// TextViewModal.tsx
interface TextViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  textMarkup: string;
  highlightedOffset: { start: number; end: number };
  onReadEarlier: () => void;
  onReadLater: () => void;
  sectionInfo: { current: number; total: number };
}

// PositionBar.tsx
interface PositionBarProps {
  currentStance?: 'support' | 'oppose' | 'undecided';
  onStanceChange: (stance: 'support' | 'oppose' | 'undecided') => void;
  onAskQuestion: () => void;
  isAuthenticated: boolean;
}
```

## Loading States

### Initial Load

Show skeleton for:
- Header with placeholder title
- Summary section with 3-4 lines of skeleton text
- 4 collapsed accordion placeholders
- Quick facts with skeleton values

### Insight Loading (if not pre-generated)

If insights don't exist yet (measure just ingested):

```
💰 FISCAL IMPACT                               [Generating...]
━━━━━━━━━━━━━━━━━━━━
Analyzing official text...

This may take 10-20 seconds. Analysis is running 
in the background and will appear automatically.

[📄 Read Official Text]
```

**Note**: The "Read Official Text" button opens the text modal with raw extracted text (if available) while waiting for LLM markup and insights to be generated.

## Error States

### Measure Not Found

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                    ❌ 404                               │
│                                                         │
│         Measure not found                               │
│                                                         │
│   We couldn't find a measure at this URL.               │
│   It may have been moved or removed.                    │
│                                                         │
│         [← All Measures]                                │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Insights Unavailable

If insights haven't been generated:

```
┌─────────────────────────────────────────────────────────┐
│ 💰 FISCAL IMPACT                               [Expand] │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   Analysis not yet available                            │
│                                                         │
│   We're reviewing this measure. Check back soon or      │
│   read the official text below.                         │
│                                                         │
│   [📄 Read Official Text]                               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Styling Guidelines

### Tailwind Classes

**Container**:
```
max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8
```

**Typography**:
```
/* Measure title */
text-3xl sm:text-4xl font-serif font-bold text-foreground

/* Section labels */
text-lg font-semibold text-foreground flex items-center gap-2

/* Body text */
text-base text-muted-foreground leading-relaxed
```

**Cards/Accordions**:
```
rounded-lg border bg-card text-card-foreground shadow-sm
hover:border-primary/50 transition-colors
```

**Buttons**:
```
/* Primary */
bg-primary text-primary-foreground hover:bg-primary/90

/* Secondary/Ghost */
bg-secondary text-secondary-foreground hover:bg-secondary/80

/* Icon buttons */
inline-flex items-center justify-center rounded-md text-sm font-medium
h-10 w-10 hover:bg-accent hover:text-accent-foreground
```

**Quick Facts**:
```
grid grid-cols-2 sm:grid-cols-4 gap-4
py-4 border-y border-border
```

### Animations

**Accordion Expand/Collapse**:
- Duration: 200ms
- Easing: `ease-out`
- Height transition from 0 to auto (use CSS grid trick or max-height)
- Chevron icon rotates 180deg

**Modal Open/Close**:
- Backdrop fade: 150ms
- Content scale: 95% → 100%, opacity 0 → 1
- Easing: `cubic-bezier(0.16, 1, 0.3, 1)`

**Loading Skeleton**:
- Pulse animation: 2s infinite
- Gradient: `bg-gradient-to-r from-muted via-muted/50 to-muted`

## Accessibility

- **Heading Hierarchy**: h1 (measure title) → h2 (section labels) → h3 (citations)
- **Accordion Pattern**: Use native `<details>`/`<summary>` or proper ARIA
- **Keyboard Navigation**: 
  - Tab through all interactive elements
  - Enter/Space to expand accordions
  - Escape to close any modals
- **Screen Readers**:
  - Announce "Expanded" / "Collapsed" on accordion toggle
  - Label citation blocks with section references
  - Mark confidence levels for pronunciation
- **Focus Management**: Return focus to trigger after closing citation modal
- **Reduced Motion**: Respect `prefers-reduced-motion` media query

## Dependencies on Ingestion Specification

This implementation requires the following from the ingestion/data processing pipeline:

### 1. LLM-Generated Text Markup
Instead of displaying raw PDFs, the system needs LLM-generated structured markup of official measure text:

**New Field Required**: `measures.textMarkup` - HTML or Markdown representation of the official text with:
- Section headers parsed and labeled
- Paragraph/line structure preserved
- Character offset mapping aligned with citation offsets
- Clean formatting (no PDF artifacts)

**Generation Process** (to be defined in ingestion spec):
1. Download PDF from `officialTextUrl`
2. Extract text (server-side with "use node" or external service)
3. Use LLM to structure into sections with semantic markup
4. Store in `textMarkup` field
5. Ensure character offsets align with `insights.citations` references

**Initial Phase**: Use hardcoded demo data for one specific measure (e.g., a recent California Proposition) to build the UI before ingestion pipeline is complete.

### 2. Structured Quick Facts Fields
Add to measures schema:
- `measureType`: string enum ("Bond Measure", "Statute", "Constitutional Amendment", "Referendum")
- `estimatedCost`: object with `{ amount: number, unit: string, timeframe: string }`

**Extraction**: During ingestion, use LLM or regex to extract from official text or fiscal analysis.

### 3. Insight Generation Pipeline
Insights must be pre-generated after measure ingestion:

**Process** (to be defined in ingestion spec):
1. After storing new measure, trigger insight generation job
2. For each insight type (summary, fiscal, legal_changes, affected_groups, conflicts):
   - Call LLM with measure text + specific prompt
   - Parse response for content + citations
   - Store in `insights` table with confidence scores
3. Handle failures gracefully (retry queue)
4. Update `generatedAt` timestamp

### 4. Citation Offset Alignment
Critical: Character offsets in `insights.citations` must align with the character positions in `measures.textMarkup`.

**Strategy**: Generate both text markup and insights in the same ingestion job to ensure alignment.

## Schema Changes Required

Add to `packages/backend/convex/schema.ts`:

```typescript
measures: defineTable({
  // ... existing fields ...
  
  // Quick Facts (structured data)
  measureType: v.optional(v.union(
    v.literal("Bond Measure"),
    v.literal("Statute"), 
    v.literal("Constitutional Amendment"),
    v.literal("Referendum")
  )),
  estimatedCost: v.optional(v.object({
    amount: v.number(),
    unit: v.string(), // "dollars", "million", "billion"
    timeframe: v.string(), // "annually", "one-time", "over 30 years"
  })),
  
  // LLM-generated structured text
  textMarkup: v.optional(v.string()), // HTML/Markdown
  textMarkupGeneratedAt: v.optional(v.number()),
})
```

## Demo Data Structure (Phase 1)

Use this hardcoded mock data for California Proposition 1 (March 2024):

```typescript
// lib/demo-data.ts
export const demoMeasure = {
  _id: "demo-prop-1" as Id<"measures">,
  measureNumber: "Proposition 1",
  title: "Bonds for Mental Health Treatment and Housing",
  jurisdiction: {
    type: "state" as const,
    name: "California",
    fipsCode: "06"
  },
  status: "upcoming" as const,
  measureType: "Bond Measure" as const,
  estimatedCost: {
    amount: 6.38,
    unit: "billion",
    timeframe: "over 30 years"
  },
  electionId: "demo-election-2024-march" as Id<"elections">,
  officialTextUrl: "https://www.sos.ca.gov/.../prop1.pdf",
  textMarkup: `<section id="sec-1">
<h2>SECTION 1. Title</h2>
<p>This act shall be known and may be cited as the "Behavioral Health Infrastructure Bond Act of 2024."</p>
</section>
<section id="sec-2">
<h2>SECTION 2. Findings and Declarations</h2>
<p>The Legislature finds and declares all of the following:</p>
<p>(a) California faces a behavioral health crisis...</p>
</section>
<!-- ... more sections ... -->`,
  firstSeenAt: Date.now(),
  lastUpdatedAt: Date.now(),
  scrapedAt: Date.now(),
  scrapeJobId: "demo-job" as Id<"ingestionJobs">,
  sourceUrl: "https://www.sos.ca.gov/elections/...",
  sourceType: "ca-sos" as const
};

export const demoInsights = [
  {
    _id: "demo-insight-summary" as Id<"insights">,
    measureId: "demo-prop-1" as Id<"measures">,
    type: "summary" as const,
    content: "Proposition 1 authorizes $6.38 billion in bonds to fund mental health treatment facilities, supportive housing, and residential treatment facilities for veterans. The measure also changes how existing mental health funds are allocated, requiring counties to spend 30% on housing and treatment rather than traditional services.",
    confidence: "high" as const,
    citations: [
      {
        textSpan: "The sum of six billion three hundred eighty million dollars ($6,380,000,000)",
        startOffset: 1245,
        endOffset: 1320,
        context: "SECTION 3. Appropriation. The sum of six billion..."
      }
    ],
    generatedAt: Date.now(),
    model: "gpt-4",
    promptVersion: "1.0"
  },
  {
    _id: "demo-insight-fiscal" as Id<"insights">,
    measureId: "demo-prop-1" as Id<"measures">,
    type: "fiscal" as const,
    content: "The bond will cost approximately $310 million annually over 30 years to repay. This adds roughly $10 per year for the average California household. The measure also redirects $140 million annually from existing mental health funds to housing and treatment.",
    confidence: "high" as const,
    uncertaintyFlags: ["Exact cost may vary based on interest rates at time of sale"],
    citations: [
      {
        textSpan: "annual debt service of approximately three hundred ten million dollars",
        startOffset: 2450,
        endOffset: 2520,
        context: "The bonds shall be repaid over a period not to exceed 30 years..."
      }
    ],
    generatedAt: Date.now(),
    model: "gpt-4",
    promptVersion: "1.0"
  }
  // ... fiscal, legal_changes, affected_groups, conflicts
];

export const demoElection = {
  _id: "demo-election-2024-march" as Id<"elections">,
  date: new Date("2024-03-05").getTime(),
  type: "primary" as const,
  year: 2024,
  jurisdictions: ["California"]
};
```

## Implementation Phases

### Phase 1: Demo Data (Immediate) ✅ COMPLETED
- [x] Create `lib/demo-data.ts` with hardcoded mock data for ACA 13
- [x] Create route file `$measureSlug.tsx` with demo data
- [x] Build `MeasureHeader` component (title, jurisdiction, share button)
- [x] Build `QuickFacts` component (status, type, cost, deadline)
- [x] Build `InsightAccordion` component with expand/collapse
- [x] Build `CitationBlock` component (quote display)
- [x] Build `PositionBar` component (Support/Oppose/Undecided)
- [ ] Build `TextViewModal` with "read earlier/later" expansion (Phase 3)

### Phase 2: Real Data (Blocked on Ingestion)
- [ ] Implement Convex queries (`getMeasureWithInsights`)
- [ ] Connect route to real data
- [ ] Display real insights from database
- [ ] Show LLM-generated text markup in modal
- [ ] Handle loading states for insight generation

### Phase 3: Polish
- [ ] Add accordion animations (expand/collapse)
- [ ] Add modal animations (fade/scale)
- [ ] Implement share functionality (copy to clipboard)
- [ ] Add section navigation within text modal
- [ ] Add loading skeletons
- [ ] Add error states (404, no insights)
- [ ] Test responsive behavior (mobile/desktop)
- [ ] Verify accessibility (keyboard nav, screen readers)
- [ ] Add copy-to-clipboard for individual citations

## Implementation Checklist Summary

**Day 1**: Setup & Demo Data
- Schema index, demo data file, environment variable, route file

**Days 2-3**: Core Components
- All 8 components with demo data

**Day 4**: Integration
- Convex queries, loading states, error handling

**Day 5**: Polish
- Animations, accessibility, testing

## Related Specifications

- [UX/UI Design](./ux-ui.md) - Visual design system and accordion patterns
- [Concept](./concept.md) - AI insight types and citation philosophy
- [Ingestion](./ingestion.md) - Data source and measure schema
- [Initial UI](./initial-ui.md) - Navigation and header patterns
