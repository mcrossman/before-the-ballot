# Initial UI Implementation

**Status**: Ready for implementation  
**Based on**: [UX/UI Design Specification](./ux-ui.md)

## Overview

Implement the initial user interface with a clean navbar and two primary views: a ZIP code entry landing page and a placeholder measures list page. No logos, minimal branding, functional navigation flow.

## Navbar Specification

### Layout
```
┌─────────────────────────────────────────────────────────┐
│  [Home]        [Location: San Francisco]    [Sign In]   │
└─────────────────────────────────────────────────────────┘
```

### Structure
- **Left**: "Home" link (text only, no logo)
- **Center**: Location selector showing current ZIP/city, clickable to change
- **Right**: Auth state - "Sign In" button or user menu when authenticated
- **Mobile**: Stack vertically or collapse location/auth into menu

### Components Needed
- `Header.tsx` - Main navbar component
- `LocationSelector.tsx` - Dropdown/modal for ZIP entry
- `AuthButton.tsx` - Sign in / user menu toggle

### Behavior
- Location persists in localStorage
- Auth state managed via WorkOS AuthKit (deferred to later phase)
- Active route highlighted in nav

## Landing Page (/) - ZIP Entry

### Layout
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                                                         │
│           Before the Ballot                             │
│                                                         │
│      Understand California ballot measures              │
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

### Content
- **Title**: "Before the Ballot"
- **Tagline**: "Understand California ballot measures"
- **Input**: ZIP code field with validation
- **Button**: "Find My Measures" (primary CTA)

### Validation
- Accept 5-digit California ZIP codes
- Show error state for invalid/unsupported ZIPs
- Button disabled until valid ZIP entered

### Routing
- On submit: Navigate to `/measures`
- Store ZIP in localStorage for persistence
- Update navbar location display

## Measures List Page (/measures)

### Layout (Placeholder)
```
┌─────────────────────────────────────────────────────────┐
│  [Home]        [Location: San Francisco]    [Sign In]   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│         Measures for San Francisco, CA                  │
│                                                         │
│    ┌─────────────────────────────────────────┐          │
│    │ 📋 Proposition 1                        │          │
│    │ Housing Bond Measure                    │          │
│    │ Summary preview...                      │          │
│    └─────────────────────────────────────────┘          │
│                                                         │
│    ┌─────────────────────────────────────────┐          │
│    │ 📋 Proposition 2                        │          │
│    │ Rent Control Initiative                 │          │
│    │ Summary preview...                      │          │
│    └─────────────────────────────────────────┘          │
│                                                         │
│    [Change Location]                                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Content (Placeholder)
- **Header**: "Measures for [Location Name]"
- **Cards**: 2-3 placeholder measure cards
- **Footer**: "Change Location" link returns to landing

### Data
- Mock data for now (real data ingestion in later phase)
- Show loading skeleton while "fetching"
- Empty state: "No measures found for this location"

## File Structure

```
apps/web/src/
├── components/
│   ├── layout/
│   │   ├── Header.tsx              # Main navbar
│   │   ├── LocationSelector.tsx    # ZIP input modal/dropdown
│   │   └── AuthButton.tsx          # Sign in button (placeholder)
│   └── measure/
│       ├── MeasureCard.tsx         # Individual measure card
│       └── MeasureList.tsx         # List container
├── hooks/
│   ├── useLocation.ts              # ZIP/localStorage management
│   └── useMeasures.ts              # Mock data fetching
├── lib/
│   └── zipCodes.ts                 # CA ZIP validation utilities
└── routes/
    ├── index.tsx                   # Landing page (ZIP entry)
    └── measures/
        └── index.tsx               # Measures list
```

## Component Specifications

### Header.tsx
```typescript
interface HeaderProps {
  currentZip?: string;
  onLocationClick: () => void;
  isAuthenticated: boolean;
}

// Layout: flex row, space-between
// Home link left, location center, auth right
// Border-bottom separator
// Mobile: Stack or hamburger menu
```

### LocationSelector.tsx
```typescript
interface LocationSelectorProps {
  currentZip?: string;
  onZipChange: (zip: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

// Modal or dropdown with ZIP input
// Validate CA ZIP codes only
// Show city name when ZIP resolved
// Save to localStorage on confirm
```

### LandingPage (routes/index.tsx)
```typescript
// No props needed - self-contained
// State: zipInput, isValid, isSubmitting
// Validates 5-digit numeric input
// On submit: save to localStorage, navigate to /measures
// Centered layout using flexbox/grid
```

### MeasuresPage (routes/measures/index.tsx)
```typescript
// Fetches location from localStorage on mount
// Loads mock measures based on ZIP
// Shows loading skeleton initially
// Renders MeasureCard components
// "Change Location" button clears storage, navigates home
```

## Routing Configuration

```typescript
// router.tsx additions
const routes = [
  { path: '/', component: LandingPage },
  { path: '/measures', component: MeasuresPage },
]
```

## Styling Guidelines

- Use shadcn/ui components: Button, Input, Card, Dialog
- Follow existing color system in index.css
- Mobile-first responsive design
- Generous whitespace on landing page
- Card-based layout for measures list
- Keep dark mode as-is (system preference)

## Implementation Order

1. **Header.tsx** - Basic navbar structure
2. **LandingPage** - ZIP entry form with validation
3. **useLocation hook** - localStorage persistence
4. **MeasuresPage** - Placeholder with mock data
5. **LocationSelector** - Modal for changing ZIP
6. **AuthButton** - Placeholder sign-in button

## Acceptance Criteria

- [ ] Navbar shows Home, Location, Auth buttons
- [ ] Landing page centers ZIP entry form
- [ ] Entering valid ZIP navigates to measures
- [ ] Measures page shows placeholder cards
- [ ] Location persists across page reloads
- [ ] Mobile layout stacks appropriately
- [ ] No console errors, clean TypeScript

## Open Questions

1. Should ZIP validation check against a list of valid CA ZIPs or just 5-digit format?
2. What city name display format? ("San Francisco, CA" or just "San Francisco")
3. How many placeholder measures to show initially?
4. Should the measures page URL include the ZIP? (/measures/94102 vs /measures)

## Related Specs

- [UX/UI Design Specification](./ux-ui.md) - Full design system
- [Tech Architecture](./tech-architecture.md) - Stack details
