# UX/UI Design Specification

## Design Philosophy

**News-like, trustworthy, mobile-first.** The interface prioritizes clarity and credibility over visual flourish. Content hierarchy guides users from plain-language summaries to detailed analysis, with verifiable citations throughout.

**Genius.com inversion**: Instead of annotations on a large text block, we present explainers/insights as primary content, with the ability to link back to source text when needed.

## Design System

- **Framework**: shadcn/ui components
- **Theme**: System preference (light/dark mode)
- **Aesthetic**: News publication (NYT, Guardian, ProPublica influence)
- **Typography**: Serif for measure titles (trust), sans-serif for UI and body (clarity)
- **Spacing**: Generous whitespace, clear section separation

## Layout Architecture

### Responsive Breakpoints

| Breakpoint | Width | Layout Mode |
|------------|-------|-------------|
| Mobile | < 640px | Single column, accordions |
| Tablet | 640px - 1024px | Single column, slide-out panel |
| Desktop | > 1024px | Two-column when needed |

### Global Layout

```
┌─────────────────────────────────────────────────────┐
│  Header                                             │
│  ┌────────┬──────────────────────┬────────────────┐ │
│  │ Logo   │ Location (ZIP/City)  │ [Auth State]   │ │
│  └────────┴──────────────────────┴────────────────┘ │
├─────────────────────────────────────────────────────┤
│  Main Content                                       │
│  (Single column default, two-column for comparison) │
├─────────────────────────────────────────────────────┤
│  Footer                                             │
└─────────────────────────────────────────────────────┘
```

## Navigation Patterns

### Header

```
┌────────────────────────────────────────────────────────┐
│  Before the Ballot    📍 San Francisco, CA    [Sign In]│
└────────────────────────────────────────────────────────┘
```

- **Logo**: Left-aligned, links to home
- **Location**: Shows current ZIP/city, clickable to change
- **Auth**: Shows "Sign In" or user menu

### Election Navigation

**Mobile**: Horizontal scrollable tabs or dropdown
**Desktop**: Horizontal tab bar above measure list

```
┌─────────────────────────────────────────────────────────┐
│  2024 General  │  2024 Primary  │  2022 General  │ ... │
└─────────────────────────────────────────────────────────┘
```

### Measure List

Card-based list with essential info:

```
┌─────────────────────────────────────────────────────────┐
│ Proposition 1                                           │
│ Housing Bond Measure                                    │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                │
│ Plain language summary preview...                       │
│ [Expand for analysis]                      [Save ▼]     │
└─────────────────────────────────────────────────────────┘
```

## Measure Detail View

### Default View: Explainers First

```
┌─────────────────────────────────────────────────────────┐
│ ← Back to measures                                      │
├─────────────────────────────────────────────────────────┤
│ Proposition 1                                  [Share]  │
│ Housing Bond Measure                                    │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 📋 SUMMARY                                          │ │
│ │ This measure authorizes $10 billion in bonds for    │ │
│ │ affordable housing projects statewide...            │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 💰 FISCAL IMPACT                           [Expand] │ │
│ │ Estimated cost to taxpayers...                      │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ ⚖️ LEGAL CHANGES                           [Expand] │ │
│ │ Modifies Health and Safety Code Section...          │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 👥 AFFECTED GROUPS                         [Expand] │ │
│ │ Low-income renters, housing developers...           │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ ⚠️ POTENTIAL CONFLICTS                     [Expand] │ │
│ │ May conflict with local zoning laws...              │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ [💾 Save Stance]  [💬 Ask a Question]  [📄 View Text]   │
└─────────────────────────────────────────────────────────┘
```

### Expanded Insight Card (Inline)

When user clicks "Expand" on mobile/narrow viewport:

```
┌─────────────────────────────────────────────────────────┐
│ 💰 FISCAL IMPACT                             [Collapse] │
├─────────────────────────────────────────────────────────┤
│ This measure authorizes $10 billion in general          │
│ obligation bonds, repaid through state taxes over       │
│ 30 years. Estimated cost: $171 million annually.        │
│                                                         │
│ Sources:                                                │
│ • "The sum of ten billion dollars" [§3, Line 45]        │
│ • "annual debt service of approximately $171 million"   │
│   [§4, Line 12]                                         │
│                                                         │
│ [View in full text]                                     │
└─────────────────────────────────────────────────────────┘
```

### Desktop: Slide-Out Panel

On wide viewports, expanding an insight slides out a panel from the right:

```
┌────────────────────────────────┬────────────────────────┐
│                                │                        │
│  Proposition 1                 │  💰 FISCAL IMPACT      │
│  Housing Bond Measure          │                        │
│                                │  This measure          │
│  📋 SUMMARY                    │  authorizes $10        │
│  This measure authorizes...    │  billion in general    │
│                                │  obligation bonds...   │
│  💰 FISCAL IMPACT     [→]      │                        │
│  (collapsed preview)           │  Sources:              │
│                                │  • "The sum..."        │
│  ⚖️ LEGAL CHANGES     [→]      │  • "annual debt..."    │
│  (collapsed preview)           │                        │
│                                │  [View in full text]   │
│  👥 AFFECTED GROUPS   [→]      │                        │
│  (collapsed preview)           │                        │
│                                │                        │
│                                │                        │
└────────────────────────────────┴────────────────────────┘
```

## Text View (Secondary)

When user wants to read the actual measure text:

```
┌─────────────────────────────────────────────────────────┐
│ ← Back to explainers                                    │
├─────────────────────────────────────────────────────────┤
│ Proposition 1 - Official Text                           │
│                                                         │
│ SECTION 1. Title. This act shall be known and may be    │
│ cited as the Affordable Housing Bond Act of 2024.       │
│                                                         │
│ SECTION 2. The Health and Safety Code is amended        │
│ by adding Part 7 (commencing with Section 53570)        │
│ to Division 31, to read:                                │
│                                                         │
│    PART 7. Affordable Housing Finance                   │
│                                                         │
│    53570. (a) The sum of ten billion dollars           │
│    ═══════════════════════════════════════              │
│    ($10,000,000,000) is hereby appropriated...         │
│                                                         │
│ [Highlighted text shows source of fiscal impact claim]  │
└─────────────────────────────────────────────────────────┘
```

**Citation Highlights**: 
- Underlined text with tooltip on hover
- Click citation to see which insight it supports
- Multiple highlights may be disconnected (hence no side-by-side)

## Chat Interface

**Mobile**: Inline at bottom of measure view, expandable
**Desktop**: Floating action button (FAB) opens side panel

### Mobile Inline Chat

```
┌─────────────────────────────────────────────────────────┐
│ [Insight Cards...]                                      │
├─────────────────────────────────────────────────────────┤
│ 💬 Ask about this measure                               │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ What does this mean for renters?                    │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ AI: This measure could increase affordable housing  │ │
│ │ supply, but won't directly impact existing renters' │ │
│ │ rent costs. [§2, Line 15]                           │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## Stance Selection

Appears as a sticky bar at bottom or inline section:

```
┌─────────────────────────────────────────────────────────┐
│ What's your position on Proposition 1?                  │
│                                                         │
│  [👍 Support]  [👎 Oppose]  [🤔 Undecided]              │
│                                                         │
│  [Optional: Add personal notes...              ]        │
│                                                         │
│  💡 Sign in to save your positions across devices       │
└─────────────────────────────────────────────────────────┘
```

**States**:
- Unselected: All buttons neutral
- Selected: Active button highlighted, saved to localStorage
- Signed-in: Syncs to Convex, removes "Sign in" prompt

## First-Time User Flow

### Step 1: Landing

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                                                         │
│              Before the Ballot                          │
│                                                         │
│      Understand California ballot measures              │
│                                                         │
│                                                         │
│      ┌─────────────────────────────────────┐            │
│      │ Enter your ZIP code                 │            │
│      └─────────────────────────────────────┘            │
│                                                         │
│      [Find My Measures]                                 │
│                                                         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Step 2: Results

After entering ZIP, show:
- "Measures for San Francisco, CA"
- List of applicable measures
- Banner: "Sign in to save your positions and get updates"

## Comparison View (Side-by-Side)

Only when user explicitly selects measures to compare:

```
┌─────────────────────────────────────────────────────────┐
│ Compare Measures                           [✕ Close]    │
├─────────────────────────────────────────────────────────┤
│ ┌───────────────────────┬─────────────────────────────┐ │
│ │ Proposition 1         │ Proposition 2               │ │
│ │ Housing Bonds         │ Rent Control                │ │
│ ├───────────────────────┼─────────────────────────────┤ │
│ │ 📋 SUMMARY            │ 📋 SUMMARY                  │ │
│ │ Authorizes $10B...    │ Expands local authority...  │ │
│ ├───────────────────────┼─────────────────────────────┤ │
│ │ 💰 FISCAL             │ 💰 FISCAL                   │ │
│ │ $171M/year            │ Varies by locality          │ │
│ └───────────────────────┴─────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## Component Library

### shadcn/ui Base Components

- `Accordion` - Insight cards (mobile)
- `Sheet` - Slide-out panels (desktop)
- `Card` - Measure list items, insight containers
- `Button` - All actions
- `Tabs` - Election selection, view toggles
- `Dialog` - Text view pop-out, citations
- `Tooltip` - Citation previews
- `Skeleton` - Loading states
- `Toast` - Save confirmations

### Custom Components

**MeasureCard**
```typescript
interface MeasureCardProps {
  measure: Measure;
  insights: Insight[]; // Preview only
  userStance?: Stance;
  onExpand: () => void;
  onSaveStance: (stance: Stance) => void;
}
```

**InsightCard**
```typescript
interface InsightCardProps {
  insight: Insight;
  isExpanded: boolean;
  onToggle: () => void;
  layout: 'accordion' | 'sidebar';
}
```

**CitationLink**
```typescript
interface CitationLinkProps {
  citation: Citation;
  onClick: () => void; // Opens text view, scrolled to location
}
```

**LocationSelector**
```typescript
interface LocationSelectorProps {
  currentZip?: string;
  onChange: (zip: string) => void;
}
```

## Loading States

### Insight Loading

Skeleton cards while AI generates:

```
┌─────────────────────────────────────────────────────────┐
│ 📋 SUMMARY                                              │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                    │
│ ━━━━━━━━━━━━━━━━━━━━━━                                  │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                    │
└─────────────────────────────────────────────────────────┘
```

### Chat Loading

Streaming response indicator:

```
┌─────────────────────────────────────────────────────────┐
│ AI is analyzing this measure...                         │
│ ● ● ●                                                   │
└─────────────────────────────────────────────────────────┘
```

## Empty States

### No Measures for Location

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                  📭                                     │
│                                                         │
│         No measures found                               │
│                                                         │
│   We couldn't find any ballot measures for              │
│   ZIP code 90210. Try a nearby ZIP or check             │
│   back closer to election day.                          │
│                                                         │
│         [Change Location]                               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### No Insights Yet

```
┌─────────────────────────────────────────────────────────┐
│ 💰 FISCAL IMPACT                                        │
│                                                         │
│   Analysis not yet available.                           │
│                                                         │
│   We're reviewing this measure. Check back soon         │
│   or read the full text below.                          │
│                                                         │
│         [📄 Read Full Text]                             │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Accessibility (WCAG 2.1 AA)

### Requirements

1. **Keyboard Navigation**
   - All interactive elements focusable
   - Logical tab order
   - Escape closes modals/panels

2. **Screen Readers**
   - Proper heading hierarchy (h1 → h2 → h3)
   - ARIA labels on icon buttons
   - Live regions for chat updates
   - "Summary", "Analysis" labels clearly announced

3. **Color Contrast**
   - Minimum 4.5:1 for normal text
   - Minimum 3:1 for large text/UI components
   - Don't rely on color alone for meaning

4. **Motion**
   - Respect `prefers-reduced-motion`
   - No auto-playing animations

5. **Touch Targets**
   - Minimum 44x44px for mobile
   - Adequate spacing between buttons

## Internationalization (Paraglide)

### Setup

```typescript
// lib/i18n.ts
import * as m from '../paraglide/messages';

// Usage
<h1>{m.app_title()}</h1>
<p>{m.summary_label()}</p>
```

### Initial Languages

- English (en) - Primary
- Spanish (es) - Phase 2 (CA has significant Spanish-speaking population)

### i18n Keys Structure

```
app.title
app.tagline
measure.summary_label
measure.fiscal_label
measure.legal_label
measure.groups_label
measure.conflicts_label
ui.expand
ui.collapse
ui.save_stance
ui.view_text
ui.chat_prompt
errors.no_measures
errors.insight_unavailable
```

## Future: Hyperspell Integration

**Potential use case**: Advanced text highlighting and annotation system

**Considerations**:
- Heavy text manipulation library
- Evaluate performance impact on mobile
- Assess against native browser selection API

## File Structure

```
app/
├── components/
│   ├── ui/                    # shadcn components
│   │   ├── accordion.tsx
│   │   ├── sheet.tsx
│   │   └── ...
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── LocationSelector.tsx
│   ├── measure/
│   │   ├── MeasureCard.tsx
│   │   ├── MeasureList.tsx
│   │   ├── MeasureDetail.tsx
│   │   └── MeasureComparison.tsx
│   ├── insights/
│   │   ├── InsightCard.tsx
│   │   ├── InsightAccordion.tsx
│   │   ├── InsightSidebar.tsx
│   │   └── CitationLink.tsx
│   ├── text/
│   │   ├── TextView.tsx
│   │   ├── TextHighlighter.tsx
│   │   └── CitationTooltip.tsx
│   ├── chat/
│   │   ├── ChatInterface.tsx
│   │   ├── ChatMessage.tsx
│   │   └── ChatInput.tsx
│   └── stance/
│       ├── StanceSelector.tsx
│       └── StanceBar.tsx
├── hooks/
│   ├── useMeasure.ts
│   ├── useInsights.ts
│   ├── useViewport.ts       # Mobile/desktop detection
│   └── useLocalStorage.ts
├── lib/
│   ├── utils.ts
│   ├── i18n.ts              # Paraglide setup
│   └── citations.ts
└── routes/
    ├── index.tsx            # Landing (ZIP entry)
    ├── measures/
    │   ├── index.tsx        # List view
    │   └── $measureId.tsx   # Detail view
    └── compare.tsx          # Side-by-side comparison
```

## Key Interactions Summary

| Action | Mobile | Desktop |
|--------|--------|---------|
| View insight details | Accordion expands inline | Panel slides from right |
| Read source text | Modal/pop-up | Side panel or modal |
| Compare measures | Full-screen toggle | Two-column layout |
| Ask question | Inline chat at bottom | Floating panel |
| Save stance | Bottom sticky bar | Inline section |
| Navigate elections | Dropdown or scroll | Horizontal tabs |

## Open Questions

1. **Insight ordering**: Fixed order (summary → fiscal → legal → groups → conflicts) or customizable?
2. **Chat context**: Should chat history persist across measures or reset per measure?
3. **Citation display**: Show exact quote or paraphrase in insight card?
4. **Share functionality**: What gets shared? (Link to measure, specific insight, or generated summary?)
5. **Print styles**: Should measures be printable? How do insights appear in print?
