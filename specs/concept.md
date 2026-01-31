# Concept: Before the Ballot

## Overview

A web application that helps California voters understand ballot measures by providing direct access to official ballot text with an AI-powered questioning interface.

## Problem Statement

Ballot measures are confusing. Existing solutions (Ballotpedia, voter guides) suffer from three key problems:

1. **Timing**: They publish too late in the election cycle
2. **Bias**: They incorporate spin from sponsors, NGOs, and interest groups
3. **Complexity**: Technical language creates barriers to understanding

Voters need early, neutral, accessible information to make informed decisions.

## Solution

**Before the Ballot** delivers:

- **Source of Truth**: Official ballot measure text as the primary content
- **AI-Generated Insights**: Pre-analyzed breakdowns of each measure (plain language summary, fiscal impact, legal changes, affected groups, conflicts)
- **Verifiable Analysis**: Every insight cites specific text from the measure with inline highlighting
- **User-Controlled Discovery**: Insights presented gradually—users expand cards to see details
- **Chat Support**: Natural language Q&A for deeper questions
- **Historical Context**: Past measures show original AI insights + actual outcomes to demonstrate accuracy
- **Personalization**: Location-based relevance (ZIP/address determines applicable measures)
- **Private Stance Tracking**: Users can save their support/oppose/undecided position (no vote recommendations)

## Key Differentiators

| Existing Tools | Before the Ballot |
|---------------|-------------------|
| Ballotpedia (technical, late, curated) | Official text + AI insights, early, neutral |
| Voter Guides (sponsor-influenced) | No third-party spin, verifiable citations |
| Generic search | Purpose-built ballot interface with gradual insight reveal |
| AI chatbots (general purpose) | Domain-specific, cited, uncertainty-flagged analysis |

## MVP Scope (California)

### In Scope
- California ballot measures only
- Historical measures database (past elections) with outcome tracking
- Current/upcoming election measures
- Web application (PWA-ready architecture)
- Location-based measure matching
- AI-generated insights (5 types) with inline citations
- Expandable insight cards with gradual reveal
- Text view with source highlighting
- Private stance tracking (support/oppose/undecided)
- AI chat for follow-up questions (on-demand)

### Out of Scope (Future)
- Other states
- Native mobile apps
- User accounts/profiles
- Social features
- Advocacy or recommendations

## User Flow

1. **Landing**: User enters ZIP code or address
2. **Discovery**: App displays relevant measures for their jurisdiction, browseable by election
3. **Measure View**: Cards show AI-generated insights in gradual reveal order:
   - Plain language summary (always visible)
   - Fiscal impact (expandable)
   - Legal changes (expandable)
   - Affected groups (expandable)
   - Potential conflicts (expandable)
4. **Text View**: Toggle to read official text with inline highlights showing source of insights
5. **Side-by-Side**: Optional view comparing multiple measures (power user feature)
6. **Chat**: Ask follow-up questions about insights or text
7. **Save Position**: Mark support/oppose/undecided (private, local storage)
8. **Historical Compare**: For past measures, view original AI insights alongside actual outcomes

## AI Insights Architecture

### Insight Types (All Generated, User-Selectable)
1. **Plain Language Summary** — What this measure actually does
2. **Fiscal Impact** — Costs, revenue, and economic effects
3. **Legal Changes** — Specific laws added, removed, or modified
4. **Affected Groups** — Who benefits, who is impacted
5. **Potential Conflicts** — Overlaps or contradictions with existing law

### Trust & Verification
- **Inline Citations**: Every insight links to specific measure text
- **Text Highlighting**: Source passages highlighted in official text view
- **Uncertainty Flags**: AI confidence levels displayed, vague language flagged
- **No Recommendations**: System never suggests how to vote
- **Citable**: Permalinks to specific insights and text passages

### Technical Implementation
- **Phase 1**: On-demand insight generation per measure view
- **Phase 2**: Pre-computed and cached for performance
- **Chat**: Also on-demand initially, may reference cached insights later

## Technical Approach

- **Platform**: Web application (React/Vue/similar)
- **PWA**: Service worker for offline reading, installable
- **AI**: LLM integration for insight generation and chat (on-demand initially)
- **Data**: California ballot measure corpus (historical + current)
- **Geolocation**: ZIP/address → jurisdiction mapping
- **Citation System**: Structured storage linking insights to text spans

## Success Metrics

- Time to information (how quickly users find their measures)
- Question resolution rate (AI provides helpful answers)
- Engagement depth (measures read, questions asked)
- Return visits for election updates

## Open Questions

1. Data source for official ballot text and historical measures with outcome data?
2. LLM provider and cost management for on-demand insight generation?
3. Citation storage format: structured JSON, vector embeddings, or hybrid?
4. How to handle measures with complex jurisdictional boundaries?
5. Frequency of data updates as election cycle progresses?
6. Storage for user stance preferences (local only, or optional sync)?
7. Strategy for tracking and verifying historical outcome predictions?

---

*Initial concept — subject to refinement as requirements solidify*
