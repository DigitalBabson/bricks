# ITCMS-7535 — Bricks Vue App Upgrade Plan

**Jira:** [ITCMS-7535](https://babson.atlassian.net/browse/ITCMS-7535)
**Date:** 2026-03-10
**Author:** Natalia Gabrieleva

---

## Table of Contents

1. [Overview](./01-overview.md)
   Environment configuration, design references, assumptions, and key changes at a glance.

2. [Architecture Changes](./02-architecture.md)
   System roles, new component hierarchy, data-flow sequences, and all API endpoints (Searchstax + Drupal).

3. [Feature Breakdown](./03-features.md)
   Detailed specs for all 8 features: alphabetical sorting, clickable pagination, keyword + location search, "Coming Soon" overlay, header, location explorer, hero image, and footer.

4. [New & Modified Files Summary](./04-files-summary.md)
   Complete list of every file to create, rewrite, or modify — with scope descriptions.

5. [Implementation Phases](./05-phases.md)
   Six phases: layout → sorting/pagination → Searchstax → location filter → location explorer → "Coming Soon". With dependency notes and effort estimates.

6. [Testing Plan](./06-testing.md)
   Unit test matrix (Vitest) and E2E scenario table (Playwright) covering desktop and mobile.

7. [Open Questions / Blockers](./07-open-questions.md)
   All 14 questions — every one resolved. Includes Searchstax proxy decision, pagination total-count strategy, and batch hydration.

8. [Risks & Mitigations](./08-risks.md)
   Risk register covering token security, N+1 hydration, missing total counts, Searchstax downtime, and CDN availability.
