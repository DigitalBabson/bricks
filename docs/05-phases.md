# ITCMS-7535 — Part 5: Implementation Phases

[← Back to Table of Contents](./ITCMS-7535-upgrade-plan.md)

---

## Phase 1 — Page Layout: Header, Hero, Footer (Low Risk)

**Goal:** Establish the new page structure before changing any data logic.

1. Create `AppHeader.vue` — "BABSON COLLEGE" / "FIND MY BRICK AT KERRY MURPHY HEALEY PARK" on dark green background.
2. Create `LocationExplorerTrigger.vue` as a reusable CTA component that emits `openLocations`.
3. Create `AppHero.vue` with hero background image (`DEV_HERO_IMAGE`), `<slot>` for the search form, and desktop trigger placement using `LocationExplorerTrigger`.
4. Create `AppFooter.vue` — "BABSON COLLEGE" in white on green, mirroring the header's first line.
5. Restructure `App.vue` layout: `AppHeader → AppHero (wrapping BrickFilter) → TheBricks → floating mobile trigger → AppFooter`.
6. Move `<brick-filter>` rendering from inside TheBricks into the hero slot (pass through v-model bindings).
7. Update `BrickCard.vue` placeholder image to use `DEV_PLACEHOLDER_IMAGE`.
8. Add `DEV_HERO_IMAGE` and `DEV_PLACEHOLDER_IMAGE` to `.env` / `.env.example`.
9. Unit tests for new components; E2E visual regression.

**Estimated effort:** 1–2 days

## Phase 2 — Sorting + Pagination (Low Risk)

**Goal:** Alphabetical browsing with proper pagination.

1. Add `sort=brickInscription` to the default fetch call in TheBricks.
2. Rewrite `Pagination.vue` with numbered pages.
3. Update TheBricks to track `currentPage` and `totalPages` instead of `offset`.
4. Ensure the API returns a total count (or derive from `links.last`).
5. Update unit tests for Pagination.
6. Update E2E tests for navigation.

**Estimated effort:** 1–2 days

## Phase 3 — Searchstax Integration (Medium Risk)

**Goal:** Fast keyword search via Searchstax instead of Drupal's `CONTAINS` filter. This phase is placed early because the location filter (Phase 4) and location explorer (Phase 5) depend on the search infrastructure and `.env`-based configuration established here.

1. Create `.env` / `.env.example` with `DEV_SEARCHSTAX_ENDPOINT` and `DEV_SEARCHSTAX_TOKEN`.
2. Update `src/main.ts` to read `import.meta.env.DEV_*` and provide via inject (replacing hardcoded `drupalEnv`).
3. Create `src/services/searchstax.ts`:
   - Builds the emselect URL: `{base}?q=*:*&fq=tcngramm_X3b_en_description:{keyword}&rows={pageSize}&start={offset}&fl=*&wt=json`
   - Sends `Authorization: Token {DEV_SEARCHSTAX_TOKEN}` header.
   - Parses `response.numFound` (total) and `response.docs[].ss_uuid` (brick UUIDs).
4. Create hydration logic: for each `ss_uuid`, call `GET /brick/{ss_uuid}` to get full brick data (use `Promise.all` for parallelism, consider batching or a queue if result sets are large).
5. Update TheBricks fetch logic: keyword searches go through Searchstax → hydrate → display.
6. Use `numFound` for pagination `totalPages` calculation during search.
7. Add unit tests for the Searchstax service (mock HTTP responses).
8. Full E2E regression against dev environment.

**Estimated effort:** 2–3 days

> **Security note:** The Searchstax API token is sent directly from the browser via the `Authorization` header. Since it is a read-only token scoped to the search index, the risk is low. Proxying through Drupal would add latency to every search. If needed later, swapping `DEV_SEARCHSTAX_ENDPOINT` to a proxy URL requires zero frontend changes.

## Phase 4 — Location Filter (Medium Risk)

**Goal:** Filter bricks by park location/zone with active-filter pills.

**Depends on:** Phase 3 (`.env`-based config and `import.meta.env` plumbing).

1. Create `fetchLocations()` in App.vue — calls `/parkLocations?fields[parkLocation]=name&include=field_brick_zone_image&sort=name`. Store as shared `locations: ParkLocation[]` state.
2. Add scrollable location list to BrickFilter (populated from `locations` prop).
3. Wire location filter into TheBricks fetch logic (Drupal `filter[brickParkLocation.id]={locationId}`).
4. Add active-filter pills and "Clear all" button to BrickFilter.
5. Unit tests for BrickFilter filter/pill behavior.
6. E2E tests for location filtering and "Clear all".

**Estimated effort:** 2–3 days

## Phase 5 — Location Explorer Overlay (Medium Risk)

**Goal:** Standalone location-browsing overlay accessible from the hero button.

**Depends on:** Phase 4 (`fetchLocations()` and the shared `ParkLocation[]` data).

1. Create `LocationExplorer.vue` with sidebar list + full-size map viewer.
2. Wire `LocationExplorerTrigger` in both placements → opens overlay in App.vue.
3. Populate sidebar from the same `locations` data used for the filter list.
4. Default selection: first location in the sorted list.
5. Clicking a location highlights it in the sidebar and swaps the map image.
6. Responsive behavior: map on top, scrollable centered list below on mobile (with chevron scroll indicators).
7. Unit + E2E tests for the overlay (desktop and mobile).

**Estimated effort:** 1–2 days

## Phase 6 — "Coming Soon" Overlay (Low Risk)

**Goal:** Identifiable bricks even without photos.

1. Add `isComingSoon` computed property to BrickCard.
2. Add inscription text overlay with Tailwind styling.
3. Update BrickCard unit tests.

**Estimated effort:** 0.5 day

---

**Next:** [Part 6 — Testing Plan](./06-testing.md)
