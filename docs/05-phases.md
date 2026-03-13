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
4. Read `meta.count` from the Drupal response and calculate `totalPages` from that value.
5. Update unit tests for Pagination.
6. Update E2E tests for navigation.

**Estimated effort:** 1–2 days

## Phase 3 — Searchstax Integration (Medium Risk)

**Goal:** Fast keyword search via Searchstax instead of Drupal's `CONTAINS` filter, including combined keyword + location filtering.

**Implementation order note:** Searchstax is not required to complete Phase 2 pagination or Phase 4 location-only filtering. The recommended delivery order is Phase 2 → Phase 4 → Phase 5 → Phase 3 → Phase 6, with keyword search allowed to remain a placeholder until Searchstax is wired. However, **combined keyword + location search** depends on Phase 3 because it routes through Searchstax (see step 3b below). Until Phase 3 ships, the app continues to use the hardcoded intranet Drupal host from `src/main.ts`; the Drupal endpoint cutover to `.env` happens in Phase 3 together with Searchstax.

1. ~~Create `.env` / `.env.example` with `DEV_SEARCHSTAX_ENDPOINT` and `DEV_SEARCHSTAX_TOKEN`.~~ **Done** — completed in Task 1.7. Both variables already exist in `.env` and `.env.example`.
2. Update `src/main.ts` to read `import.meta.env.DEV_*` and provide via inject (replacing hardcoded `drupalEnv`). This is the required cutover from the current intranet Drupal host to the `.env` site, and it must ship together with Searchstax because Searchstax indexes that site.
3. Create `src/services/searchstax.ts`:
   a. **Keyword-only search:** Builds the emselect URL with `fq=tcngramm_X3b_en_description:{keyword}&rows={pageSize}&start={offset}&fl=*&wt=json`.
   b. **Combined keyword + location search:** Appends a second `fq` parameter: `&fq=ss_body:{locationId}`. The `ss_body` field in the Searchstax index stores the park-location reference corresponding to the Drupal `brickParkLocation` relationship.
   c. Sends `Authorization: Token {DEV_SEARCHSTAX_TOKEN}` header.
   d. Parses `response.numFound` (total) and `response.docs[].ss_uuid` (brick UUIDs).
4. Create hydration logic: for each `ss_uuid`, call `GET /brick/{ss_uuid}` to get full brick data (use `Promise.all` for parallelism, consider batching or a queue if result sets are large).
5. Update TheBricks fetch logic with the routing rule: **any request involving a keyword (≥ 3 chars) goes through Searchstax**, whether or not a location filter is also active. Location-only filtering (no keyword) stays on the Drupal JSON:API path. Apply a 3-character minimum and 500ms debounce to keyword-driven fetches.
6. Use `numFound` for pagination `totalPages` calculation during any Searchstax-backed search (keyword-only or combined).
7. Add unit tests for the Searchstax service (mock HTTP responses), covering keyword-only and combined keyword + location queries.
8. Full E2E regression against dev environment, including combined filter scenarios.

**Estimated effort:** 2–3 days

> **Security note:** The Searchstax API token is sent directly from the browser via the `Authorization` header. Since it is a read-only token scoped to the search index, the risk is low. Proxying through Drupal would add latency to every search. If needed later, swapping `DEV_SEARCHSTAX_ENDPOINT` to a proxy URL requires zero frontend changes.

## Phase 4 — Location Filter (Medium Risk)

**Goal:** Filter bricks by park location/zone with active-filter pills.

**Depends on:** Phase 2 pagination/state work.

**Scope:** This phase handles location-only filtering via the Drupal JSON:API. All keyword-related paths (keyword-only and combined keyword + location via Searchstax `ss_body`) are owned by Phase 3. Do not add temporary Searchstax stubs, fallback branches, or partial combined-filter behavior in Phase 4.

1. Create `fetchLocations()` in App.vue — calls `/parkLocations?fields[parkLocation]=name&include=brick_zone_image&sort=name`. Store as shared `locations: ParkLocation[]` state.
2. Add scrollable location list to BrickFilter (populated from `locations` prop).
3. Wire location-only filter into TheBricks fetch logic (Drupal `filter[brickParkLocation.id][operator]=IN&filter[brickParkLocation.id][value]={locationIds...}`). Uses Drupal `meta.count` for `totalPages`.
4. Add active-filter pills and "Clear all" button to BrickFilter.
5. Unit tests for BrickFilter filter/pill behavior.
6. E2E tests for location-only filtering and "Clear all".

> **Implementation note:** Keep the translucent action strip visible even when no filters are active. The latest UX direction is to also keep the `Clear all` button visible in that idle state, but disabled until a keyword or location filter is active. That disabled-idle behavior is documented here as a follow-up and should be implemented once final UX details are provided.

**Estimated effort:** 2–3 days

## Phase 5 — Location Explorer Overlay (Medium Risk)

**Goal:** Standalone location-browsing overlay accessible from the hero button.

**Depends on:** Phase 4 (`fetchLocations()` and the shared `ParkLocation[]` data).

1. Create `LocationExplorer.vue` with sidebar list + full-size map viewer.
2. Wire `LocationExplorerTrigger` in both placements → opens overlay in App.vue. Reposition the desktop trigger: move it outside the `max-w-brickMWL` container so it sits flush to the viewport right edge. Add a custom `3xl` Tailwind breakpoint (`2048px`) so that at very wide viewports the trigger anchors to the content column edge instead. Requires `tailwind.config.js` update (`screens: { '3xl': '2048px' }`).
3. Populate sidebar from the same `locations` data used for the filter list.
4. Default selection: first location in the sorted list.
5. Clicking a location highlights it in the sidebar and swaps the map image.
6. Responsive behavior: map on top, scrollable centered list below on mobile (with up/down chevron controls that also scroll the list when tapped/clicked).
7. Unit + E2E tests for the overlay (desktop and mobile).

**Estimated effort:** 1–2 days

## Phase 6 — BrickCard Enhancements: "Coming Soon" Overlay + Hover/Focus/Keyboard (Low Risk)

**Goal:** Identifiable bricks even without photos, plus polished hover states and full keyboard accessibility per the `hovers.png` wireframe.

1. Add `isComingSoon` computed property to BrickCard.
2. Add inscription text overlay with Tailwind styling for "Coming Soon" bricks.
3. Add "ENLARGE BRICK" hover overlay (top-right, semi-transparent dark background, magnifying-glass icon) using Tailwind `group-hover`.
4. Wrap card `<article>` in a focusable container (`tabindex="0"`) with keyboard handlers for 1st tab stop (Enter/Space → open location details).
5. Add dedicated "ENLARGE BRICK" `<button>` as the 2nd tab stop (Enter/Space → open image modal). Hidden by default, visible on card hover and on focus.
6. Rename "See location details" to "VIEW LOCATION DETAILS"; set `tabindex="-1"` on the bottom button to avoid redundant tab stop.
7. Add `role="button"` and `aria-label` attributes for screen reader support.
8. Suppress hover overlay and 2nd tab stop for "Coming Soon" bricks (no image to enlarge).
9. Update BrickCard unit tests for hover overlay rendering, keyboard interaction, and "Coming Soon" variant.

**Estimated effort:** 1 day

---

**Next:** [Part 6 — Testing Plan](./06-testing.md)
