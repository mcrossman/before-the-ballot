# Measure Summary View Specification

**Status**: Draft  
**Based on**: [UX/UI Design Specification](./ux-ui.md), [Concept](./concept.md), [Ingestion](./ingestion.md)  
**Code Location**: `apps/web/src/routes/measures/$measureSlug.tsx`  

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
- **Share Button** - copies permalink to clipboard

### Summary Section (Always Visible)

- **Content** - Insight with `type: "summary"` from insights table
- **Citation Links** - Inline "[View in official text]" links that open citation blocks
- **Quick Facts** - Derived from measure metadata:
  - Status: `measures.status`
  - Type: Inferred from content or `fiscalImpactText` presence
  - Estimated Cost: Extracted from fiscal insight or `fiscalImpactText`
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
- **Context Button** - Opens PDF viewer with highlighted location

**Citation Data Structure** (from schema):
```typescript
{
  textSpan: string,      // Exact quoted text
  startOffset: number,   // Character position in official text
  endOffset: number,     // Character position in official text
  context?: string       // Optional surrounding context
}
```

**PDF Viewing**: Uses `pdf.js` in the browser to render `measures.officialTextUrl`. Character offsets from citations are used to scroll/highlight the relevant section in the PDF viewer.

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

**insights table**:
- `measureId` - Links to measure
- `type` - summary, fiscal, legal_changes, affected_groups, conflicts
- `content` - AI-generated plain language explanation
- `citations` - Array of text spans with offsets
- `confidence` - high, medium, low
- `uncertaintyFlags` - Array of vague language warnings
- `generatedAt` - Timestamp for AI generation
- `predictionAccuracy` - For historical measures (correct, partial, incorrect)

**elections table**:
- `date` - For voting deadline display
- `type` - primary, general, special

**userStances table** (if authenticated):
- `stance` - support, oppose, undecided
- `personalNotes` - Optional user notes

### Queries Needed

```typescript
// Get measure with insights
const measure = await ctx.db
  .query("measures")
  .withIndex("by_slug", q => q.eq("slug", slug)) // Need to add slug index
  .unique();

const insights = await ctx.db
  .query("insights")
  .withIndex("by_measure", q => q.eq("measureId", measure._id))
  .collect();

const election = measure.electionId 
  ? await ctx.db.get(measure.electionId)
  : null;

const userStance = userId
  ? await ctx.db
      .query("userStances")
      .withIndex("by_user_measure", q => 
        q.eq("userId", userId).eq("measureId", measure._id))
      .unique()
  : null;
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

```typescript
// apps/web/src/routes/measures/$measureSlug.tsx
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/measures/$measureSlug')({
  component: MeasureSummaryPage,
  loader: async ({ params }) => {
    // Fetch measure by slug
    const measure = await fetchMeasureBySlug(params.measureSlug);
    const insights = await fetchInsightsForMeasure(measure.id);
    const election = measure.electionId 
      ? await fetchElection(measure.electionId)
      : null;
    return { measure, insights, election };
  },
});
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
│       ├── HistoricalOutcome.tsx      # Results for passed/failed
│       └── PositionBar.tsx            # Support/Oppose/Undecided
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

This may take 10-20 seconds. You can read the 
full text below while analysis is in progress.

[📄 Read Official Text]
```

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

## Open Questions / Dependencies

1. **Official Text Display**: For citation "[View in context]" links, do we:
   - Open a modal with the PDF/text?
   - Navigate to a separate `/measures/{slug}/text` route?
   - Use a drawer/sheet component?

2. **Quick Facts Data Source**: Should Quick Facts be:
   - Extracted from insights content via regex?
   - Stored as structured fields in measures table?
   - Generated by a separate AI prompt?

3. **Insight Generation Timing**: Are insights pre-generated at ingestion time, or generated on-demand when first viewed? Schema has `generatedAt` field suggesting pre-generation.

4. **Citation Context**: The schema has `citations.context` as optional. Should we always populate this with surrounding sentences for better user experience?

5. **Share Functionality**: What should the share button copy?
   - Current URL only?
   - Generated summary text + URL?
   - Pre-formatted social media post?

6. **PDF.js Implementation**: 
   - Should we render the full PDF or extract text-only?
   - How do we handle character offset mapping to PDF pages/locations?
   - Do we need a fallback for browsers without PDF support?

## Related Specifications

- [UX/UI Design](./ux-ui.md) - Visual design system and accordion patterns
- [Concept](./concept.md) - AI insight types and citation philosophy
- [Ingestion](./ingestion.md) - Data source and measure schema
- [Initial UI](./initial-ui.md) - Navigation and header patterns
