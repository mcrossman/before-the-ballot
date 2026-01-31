# Technical Architecture

## Stack Overview

| Layer | Technology |
|-------|------------|
| Framework | TanStack Start + React |
| Hosting | Cloudflare Workers |
| AI/LLM | Vercel AI SDK |
| Database | Convex |
| Auth | WorkOS AuthKit |
| Data Ingestion | Convex functions (automated scraping) |

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Cloudflare Workers                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ TanStack     │  │ API Routes   │  │ WorkOS AuthKit   │  │
│  │ Start (React)│  │ (SSR/Edge)   │  │ (Auth middleware)│  │
│  └──────┬───────┘  └──────┬───────┘  └──────────────────┘  │
└─────────┼─────────────────┼────────────────────────────────┘
          │                 │
          │                 ▼
          │         ┌──────────────┐
          │         │ Vercel AI    │
          │         │ SDK          │
          │         └──────┬───────┘
          │                │
          ▼                ▼
┌────────────────────────────────┐
│           Convex               │
│  ┌──────────┐  ┌────────────┐ │
│  │ Measures │  │ Insights   │ │
│  │ (text)   │  │ (AI output)│ │
│  └──────────┘  └────────────┘ │
│  ┌──────────┐  ┌────────────┐ │
│  │ Users    │  │ Jobs       │ │
│  │ (stances)│  │ (scraping) │ │
│  └──────────┘  └────────────┘ │
└────────────────────────────────┘
          ▲
          │
┌─────────┴──────────────────────┐
│   CA Secretary of State        │
│   (scraping via Convex jobs)   │
└────────────────────────────────┘
```

## Data Model

### Measures
```typescript
interface Measure {
  _id: string;
  
  // Identification
  measureNumber: string;           // "Proposition 1", "Measure A"
  electionId: string;              // Reference to election
  jurisdiction: {
    type: 'state' | 'county' | 'city';
    name: string;
    fipsCode?: string;             // For geographic matching
  };
  
  // Content (immutable once published)
  title: string;
  officialText: string;            // Full official text
  textHash: string;                // SHA256 for change detection
  fiscalImpactText?: string;       // Official fiscal analysis
  
  // Metadata
  status: 'upcoming' | 'active' | 'passed' | 'failed' | 'withdrawn';
  outcome?: {
    passed: boolean;
    yesVotes: number;
    noVotes: number;
    percentYes: number;
  };
  
  // Timestamps
  firstSeenAt: number;
  lastUpdatedAt: number;
  electionDate: number;
}
```

### Insights
```typescript
interface Insight {
  _id: string;
  measureId: string;
  
  // Generation metadata
  generatedAt: number;
  model: string;                   // "gpt-4", "claude-3", etc.
  promptVersion: string;           // For tracking changes
  
  // Content (one per insight type)
  type: 'summary' | 'fiscal' | 'legal_changes' | 'affected_groups' | 'conflicts';
  content: string;                 // AI-generated plain text
  confidence: 'high' | 'medium' | 'low';
  uncertaintyFlags?: string[];     // ["uses vague language in section 3"]
  
  // Citations (array for multiple sources)
  citations: Array<{
    textSpan: string;              // Exact quoted text
    startOffset: number;           // Character position in officialText
    endOffset: number;
    context?: string;              // Surrounding sentence for display
  }>;
  
  // For historical measures
  actualOutcome?: string;          // What actually happened
  predictionAccuracy?: 'correct' | 'partial' | 'incorrect';
}
```

### User Stances
```typescript
interface UserStance {
  _id: string;                     // Convex ID
  userId: string;                  // WorkOS user ID
  
  measureId: string;
  stance: 'support' | 'oppose' | 'undecided';
  
  // Optional notes
  personalNotes?: string;
  
  updatedAt: number;
}
```

### Elections
```typescript
interface Election {
  _id: string;
  
  date: number;
  type: 'primary' | 'general' | 'special';
  year: number;
  
  // Coverage
  jurisdictions: string[];         // ['CA', 'Los Angeles County', ...]
}
```

## Data Flow

### 1. Ingestion Pipeline (Convex Jobs)

```
Scheduled Job (hourly/daily)
    │
    ▼
Scrape CA SoS Website
    │
    ▼
Parse HTML → Extract measures
    │
    ▼
Compare against existing (textHash)
    │
    ├── New measure → Insert
    ├── Changed text → Update + flag for re-analysis
    └── Unchanged → Skip
```

**Implementation:** Convex scheduled functions triggered via cron

### 2. Insight Generation

**Phase 1 (MVP): On-Demand**
```
User views measure
    │
    ▼
Check: Insights exist? 
    │
    ├── Yes → Return cached
    └── No → Generate via Vercel AI SDK
              │
              ▼
         LLM call with measure text
              │
              ▼
         Parse JSON response
              │
              ▼
         Store in Convex
              │
              ▼
         Return to user
```

**Phase 2: Pre-computation**
- Background Convex action generates insights for all new measures
- User always gets cached result (faster, cheaper)

### 3. Citation System

Insights store character offsets into the official text. For display:

```typescript
// Render text with highlights
function renderTextWithHighlights(
  officialText: string,
  citations: Citation[]
) {
  // Sort by startOffset
  // Build segments: [text][highlight][text][highlight]...
  // Render React components with click-to-scroll
}
```

**Handling text changes:** If measure text changes, invalidate insights (set `invalidatedAt` timestamp) and regenerate.

## API Routes (TanStack Start)

### `GET /api/measures`
Query params: `zip`, `electionId`, `cursor`
Returns: List of measures for user's jurisdiction

### `GET /api/measures/:id`
Returns: Measure + all insights
Auth: Optional (for stance)

### `POST /api/measures/:id/insights`
Body: `{ type: string }`
Returns: Generate or retrieve specific insight
Rate limited: Yes

### `POST /api/chat`
Body: `{ measureId, message, history }`
Returns: AI response
Rate limited: Yes
Uses: Vercel AI SDK `streamText`

### `POST /api/stance`
Body: `{ measureId, stance }`
Auth: Required (WorkOS)
Returns: Updated stance

## Authentication Flow

```
User clicks "Save Stance"
    │
    ▼
Check: Authenticated?
    │
    ├── Yes → Proceed
    └── No → Redirect to WorkOS AuthKit
                  │
                  ▼
             OAuth/Email flow
                  │
                  ▼
             Callback → Set session cookie
                  │
                  ▼
             Return to measure, save stance
```

**Session:** JWT in HTTP-only cookie, validated via WorkOS

## LLM Integration (Vercel AI SDK)

### Insight Generation Prompt

```typescript
const insightPrompt = {
  system: `You are analyzing a California ballot measure. Extract ${insightType} 
           and return structured JSON with content, confidence, citations, and flags.`,
  
  user: `Measure Title: ${measure.title}
         
         Official Text:
         ${measure.officialText}
         
         Provide:
         1. Plain language ${insightType} explanation
         2. Confidence level (high/medium/low)
         3. Exact text spans that support this (with character offsets)
         4. Any uncertainty or vague language to flag`,
  
  response_format: { type: "json_object" }
};
```

### Chat Prompt

```typescript
const chatPrompt = {
  system: `You are answering questions about California ballot measures. 
           Base answers only on the official text provided. 
           Cite specific sections. Never recommend how to vote.`,
  
  messages: [/* conversation history */]
};
```

### Rate Limiting Strategy

- Per-user: 10 chat messages / 5 minutes
- Per-IP: 50 insight generations / hour
- Convex action logs all LLM calls for cost tracking

## Convex Schema

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  measures: defineTable({
    measureNumber: v.string(),
    electionId: v.id("elections"),
    jurisdiction: v.object({
      type: v.union(v.literal("state"), v.literal("county"), v.literal("city")),
      name: v.string(),
      fipsCode: v.optional(v.string()),
    }),
    title: v.string(),
    officialText: v.string(),
    textHash: v.string(),
    fiscalImpactText: v.optional(v.string()),
    status: v.union(
      v.literal("upcoming"),
      v.literal("active"),
      v.literal("passed"),
      v.literal("failed"),
      v.literal("withdrawn")
    ),
    outcome: v.optional(v.object({
      passed: v.boolean(),
      yesVotes: v.number(),
      noVotes: v.number(),
      percentYes: v.number(),
    })),
    firstSeenAt: v.number(),
    lastUpdatedAt: v.number(),
    electionDate: v.number(),
  })
    .index("by_election", ["electionId"])
    .index("by_jurisdiction", ["jurisdiction.name"])
    .index("by_status", ["status"]),

  insights: defineTable({
    measureId: v.id("measures"),
    generatedAt: v.number(),
    model: v.string(),
    promptVersion: v.string(),
    type: v.union(
      v.literal("summary"),
      v.literal("fiscal"),
      v.literal("legal_changes"),
      v.literal("affected_groups"),
      v.literal("conflicts")
    ),
    content: v.string(),
    confidence: v.union(v.literal("high"), v.literal("medium"), v.literal("low")),
    uncertaintyFlags: v.optional(v.array(v.string())),
    citations: v.array(v.object({
      textSpan: v.string(),
      startOffset: v.number(),
      endOffset: v.number(),
      context: v.optional(v.string()),
    })),
    actualOutcome: v.optional(v.string()),
    predictionAccuracy: v.optional(v.union(
      v.literal("correct"),
      v.literal("partial"),
      v.literal("incorrect")
    )),
  })
    .index("by_measure", ["measureId"])
    .index("by_measure_type", ["measureId", "type"]),

  userStances: defineTable({
    userId: v.string(),
    measureId: v.id("measures"),
    stance: v.union(v.literal("support"), v.literal("oppose"), v.literal("undecided")),
    personalNotes: v.optional(v.string()),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_measure", ["userId", "measureId"]),

  elections: defineTable({
    date: v.number(),
    type: v.union(v.literal("primary"), v.literal("general"), v.literal("special")),
    year: v.number(),
    jurisdictions: v.array(v.string()),
  })
    .index("by_date", ["date"]),

  // For ingestion job tracking
  ingestionJobs: defineTable({
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
    status: v.union(v.literal("running"), v.literal("completed"), v.literal("failed")),
    newMeasures: v.number(),
    updatedMeasures: v.number(),
    errors: v.optional(v.array(v.string())),
  }),
});
```

## Environment Variables

```bash
# Convex
CONVEX_DEPLOYMENT=...
CONVEX_URL=...

# WorkOS AuthKit
WORKOS_CLIENT_ID=...
WORKOS_API_KEY=...
WORKOS_REDIRECT_URI=...

# LLM (Vercel AI SDK)
OPENAI_API_KEY=...         # or ANTHROPIC_API_KEY, etc.
AI_MODEL=gpt-4o            # Default model for insights
AI_CHAT_MODEL=gpt-4o-mini  # Faster/cheaper for chat

# App
APP_URL=https://beforetheballot.workers.dev
```

## File Structure

```
app/
├── routes/
│   ├── __root.tsx           # TanStack root with WorkOS auth provider
│   ├── index.tsx            # Landing (ZIP entry)
│   ├── measures/
│   │   ├── index.tsx        # List measures by election
│   │   └── $measureId.tsx   # Individual measure view
│   ├── api/
│   │   ├── measures.ts      # Measure API routes
│   │   ├── insights.ts      # Insight generation routes
│   │   ├── chat.ts          # Chat streaming endpoint
│   │   └── stance.ts        # Save user stance
│   └── auth/
│       └── callback.tsx     # WorkOS callback handler
├── components/
│   ├── MeasureCard.tsx      # Insight cards (gradual reveal)
│   ├── TextWithHighlights.tsx # Official text with citations
│   ├── ChatInterface.tsx    # Vercel AI SDK chat UI
│   └── StanceSelector.tsx   # Support/Oppose/Undecided
├── hooks/
│   ├── useMeasure.ts        # TanStack query for measures
│   ├── useInsights.ts       # Generate/retrieve insights
│   └── useAuth.ts           # WorkOS auth state
└── lib/
    ├── convex.ts            # Convex client setup
    ├── ai.ts                # Vercel AI SDK configuration
    ├── scraper.ts           # SoS scraping logic
    └── citations.ts         # Citation parsing/highlighting
convex/
├── _generated/              # Auto-generated
├── schema.ts                # Database schema
├── measures.ts              # Measure queries/mutations
├── insights.ts              # Insight generation actions
├── userStances.ts           # User stance CRUD
├── auth.ts                  # WorkOS integration
└── jobs/
    ├── scrapeSoS.ts         # Scheduled scraping job
    └── generateInsights.ts  # Background insight generation
```

## Deployment

### Cloudflare Workers

```toml
# wrangler.toml
name = "before-the-ballot"
main = "./build/server.js"
compatibility_date = "2024-01-01"

[build]
command = "npm run build"

[[env.production.vars]]
APP_URL = "https://beforetheballot.com"
```

### Convex

```bash
# Development
npx convex dev

# Production
npx convex deploy
```

## Cost Considerations

| Component | Estimate | Notes |
|-----------|----------|-------|
| Cloudflare Workers | $5/mo | Free tier: 100k req/day |
| Convex | $25/mo | Starter plan |
| LLM (OpenAI) | $50-200/mo | Depends on traffic; insights cached |
| WorkOS AuthKit | $0-50/mo | Free tier: 1M MAU |
| **Total** | **$80-280/mo** | Scales with usage |

## Open Questions

1. **Scraper reliability**: CA SoS site structure—need to handle changes gracefully
2. **Jurisdiction mapping**: ZIP → county/city mapping accuracy for local measures
3. **Insight versioning**: When text changes, keep old insights for audit trail?
4. **Chat context**: Should chat have access to all insight types or just raw text?
5. **Historical outcome data**: Source for actual results (LA Times API, SoS results)?
