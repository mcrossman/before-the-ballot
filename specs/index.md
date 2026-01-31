# Specifications

Table fields:

- Document: title is document, link is to file
- Code: Path to code, if document governs feature or implementation
- Purpose: quick summary and purpose of doc

| Document | Code | Purpose |
|----------|------|---------|
| [Concept](./concept.md) | — | Initial product concept for Before the Ballot — AI-powered ballot measure information platform for California voters |
| [Tech Architecture](./tech-architecture.md) | — | Technical architecture: TanStack Start + React, Cloudflare Workers, Convex, Vercel AI SDK, WorkOS AuthKit |
| [UX/UI](./ux-ui.md) | — | User interface and experience design: shadcn/ui, news-like aesthetic, mobile-first with accordion/sidebar insight patterns |
| [Ingestion](./ingestion.md) | — | Data ingestion and scraping: CA SoS and Santa Clara County ballot measures via Convex scheduled functions |
| [Initial UI](./initial-ui.md) | `apps/web/src/` | First UI implementation: navbar with location/auth, ZIP entry landing page, measures list placeholder |
| [Measure Summary View](./measure-summary-view.md) | `apps/web/src/routes/measures/` | Detail view for individual ballot measures: article-style layout with expandable insights and verifiable citations |