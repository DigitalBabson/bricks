# ITCMS-7535 — Part 4: New & Modified Files Summary

[← Back to Table of Contents](./ITCMS-7535-upgrade-plan.md)

---

| File | Action | Scope |
|---|---|---|
| `src/App.vue` | **Rewrite** | New page layout: AppHeader → AppHero (with BrickFilter) → TheBricks → AppFooter. Manages `showLocationExplorer` state. Provides locations data. |
| `src/components/AppHeader.vue` | **Create** | Site header with title/logo only |
| `src/components/AppHero.vue` | **Create** | Full-width hero image with slot for search form overlay and desktop trigger placement |
| `src/components/LocationExplorerTrigger.vue` | **Create** | Reusable "VIEW MAP OF BRICK LOCATIONS" CTA used in the hero on desktop and as a floating bottom-right control on mobile |
| `src/components/AppFooter.vue` | **Create** | Page footer — "BABSON COLLEGE" white text on green bar (mirrors header line 1) |
| `src/components/LocationExplorer.vue` | **Create** | Full-screen overlay with sidebar location list + map image viewer |
| `src/components/TheBricks.vue` | **Modify** | Add sorting param, new search/filter state, location fetch, Searchstax integration, page-based pagination logic. Move BrickFilter rendering to hero. |
| `src/components/BrickFilter.vue` | **Rewrite** | Keyword input + scrollable location list + active filters bar + Clear All |
| `src/components/Pagination.vue` | **Rewrite** | Clickable numbered pagination with arrows and ellipsis |
| `src/components/BrickCard.vue` | **Modify** | Add inscription overlay for "Coming Soon" images; add "ENLARGE BRICK" hover overlay, card-level focus wrapper with keyboard handlers (tab stop 1 → location details, tab stop 2 → enlarge), rename button text to "VIEW LOCATION DETAILS", accessibility attributes |
| `src/types/index.ts` | **Modify** | Add `ParkLocation`, `SearchstaxResponse`, `SearchstaxDoc` types; update `BrickApiResponse` for total count |
| `src/services/searchstax.ts` | **Create** | Searchstax API client: builds `emselect` URL with `fq=tcngramm_X3b_en_description:{keyword}`, sends `Authorization: Token` header, parses `ss_uuid[]` + `numFound` |
| `src/services/drupal.ts` | **Create** (optional) | Drupal API client: wraps brick fetch, zone fetch, brick-by-UUID hydration |
| `src/composables/usePagination.ts` | **Create** (optional) | Reusable pagination logic (currentPage, totalPages, offset calculation) |
| `src/main.ts` | **Modify** | Read `import.meta.env.DEV_*` vars, provide Searchstax + Drupal config via inject. Set `envPrefix: 'DEV_'` in Vite config. |
| `.env` / `.env.staging` / `.env.production` | **Create** | Per-environment Drupal base, JSON:API URL, Searchstax base + token (not committed) |
| `.env.example` | **Create** | Template `.env` file with placeholder values (committed) |
| `.gitignore` | **Modify** | Ensure `.env` files are excluded |
| `tailwind.config.js` | **Modify** (if needed) | New custom utilities for hero, footer, or location explorer |

---

**Next:** [Part 5 — Implementation Phases](./05-phases.md)
