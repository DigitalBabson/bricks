# ITCMS-7535 — Part 1: Overview

**Jira:** [ITCMS-7535](https://babson.atlassian.net/browse/ITCMS-7535)
**Date:** 2026-03-10
**Author:** Natalia Gabrieleva

---

This plan covers the frontend upgrade of the Babson Bricks Vue 3 SPA to meet the new UX requirements and architecture documented in the Jira ticket and the Confluence "Bricks update — proposed architecture" page.

**Key changes at a glance:**

- New page-level layout: branding header, hero image with search overlay, reusable location-explorer trigger, and footer
- Reusable "View Map of Brick Locations" trigger opens a full-screen location-explorer overlay from the hero on desktop and as a floating bottom-right mobile control that stays visible while scrolling
- Replace the "Load more" button with clickable numbered pagination
- Add alphabetical A-Z default sort
- Introduce a dual search system: keyword (inscription) search via Searchstax, plus a brick-location dropdown filter
- Add an active-filters results bar with a "Clear All" button
- Show the brick inscription on "Coming Soon" placeholder images

**Assumptions:**

- The Drupal JSON:API backend and the Searchstax search service are fully set up and functional.
- Searchstax returns brick UUIDs (`ss_uuid`) and zone/location counts.
- Drupal continues to serve brick images, park-location data, and image styles.
- The Adobe XD specs (linked below) are the source of truth for visual design.
- Using the **dev** environment for initial development.

**Design reference:**

- [Adobe XD specs](https://xd.adobe.com/view/45e9dae9-23d7-4ab5-8c51-2576194b2032-10ba/specs/)
- [Adobe XD grid view](https://xd.adobe.com/view/45e9dae9-23d7-4ab5-8c51-2576194b2032-10ba/grid)

**Environment configuration:**

Endpoints and the Searchstax API token live in a `.env` file (not committed to Git). The app reads them at build time via Vite's `import.meta.env`. Since variables use the `DEV_` prefix instead of the default `VITE_`, the Vite config must set `envPrefix: 'DEV_'` to expose them to client-side code.

```bash
# .env (dev — do NOT commit)
DEV_DRUPAL_ENDPOINT=https://babsondev.prod.acquia-sites.com/jsonapi/
DEV_SEARCHSTAX_ENDPOINT=https://searchcloud-18-us-east-1.searchstax.com/29847/babsonbricksdatadev-7987/emselect
DEV_SEARCHSTAX_TOKEN=de67b1598757fcc74ecf4f78b934869f92436404
DEV_HERO_IMAGE=https://babsondev.prod.acquia-sites.com/sites/default/files/2026-03/find-my-brick-hero.jpg
DEV_PLACEHOLDER_IMAGE=https://babsondev.prod.acquia-sites.com/sites/default/files/2026-03/coming-soon-gray.jpg
```

The Drupal base URL (without `/jsonapi/`) can be derived at runtime by stripping the trailing path from `DEV_DRUPAL_ENDPOINT` when needed for image URLs.

Additional `.env` files per environment (`.env.staging`, `.env.production`) will hold the corresponding values. `main.ts` will read `import.meta.env.DEV_DRUPAL_ENDPOINT` etc. instead of hardcoding `drupalEnv.prod`.

---

**Next:** [Part 2 — Architecture Changes](./02-architecture.md)
