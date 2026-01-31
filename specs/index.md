# Specifications

Table fields:

- Document: title is document, link is to file
- Code: Path to code, if document governs feature or implementation
- Purpose: quick summary and purpose of doc

| Document | Status | Code | Purpose |
|----------|--------|------|---------|
| [Concept](./concept.md) | 📝 Spec | — | Initial product concept for Before the Ballot — AI-powered ballot measure information platform for California voters |
| [Tech Architecture](./tech-architecture.md) | 📝 Spec | — | Technical architecture: TanStack Start + React, Cloudflare Workers, Convex, Vercel AI SDK, WorkOS AuthKit |
| [UX/UI](./ux-ui.md) | 📝 Spec | — | User interface and experience design: shadcn/ui, news-like aesthetic, mobile-first with accordion/sidebar insight patterns |
| [Ingestion](./ingestion.md) | 📝 Spec | — | Data ingestion and scraping: CA SoS and Santa Clara County ballot measures via Convex scheduled functions |
| [Initial UI](./initial-ui.md) | ✅ Implemented | `apps/web/src/` | First UI implementation: navbar with location/auth, ZIP entry landing page, measures list placeholder |
| [Measure Summary View](./measure-summary-view.md) | ✅ Phase 1 | `apps/web/src/routes/measures/` | Detail view for individual ballot measures: article-style layout with expandable insights and verifiable citations |
| [Demo Data](./demo-data.md) | ✅ Implemented | `apps/web/src/lib/demo-data.ts` | Demo data structure based on ACA 13: extracted measure text, AI insights with citations, and type definitions |