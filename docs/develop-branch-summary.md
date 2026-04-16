# Develop Branch — Implementation Summary

**Jira:** [ITCMS-7535](https://babson.atlassian.net/browse/ITCMS-7535)
**Date:** 2026-03-17
**Author:** Natalia Gabrieleva

This document summarises all work completed in the `develop` branch relative to `master`.

---

## Phase Completion Status

| Phase | Description | Status |
|-------|-------------|--------|
| Phase 1 | Page layout: header, hero, footer | ✅ Complete |
| Phase 2 | Alphabetical sort + numbered pagination | ✅ Complete |
| Phase 3 | Searchstax keyword search + Drupal CONTAINS fallback | ✅ Complete |
| Phase 4 | Location filter (multi-select, active pills, clear all) | ✅ Complete |
| Phase 5 | Location explorer overlay | ✅ Complete |
| Phase 6 | BrickCard hover/focus/keyboard + "Coming Soon" overlay | ✅ Complete |

---

## What Was Built

### Page Layout (Phase 1)

- **`AppHeader.vue`** — Full-width dark green Babson branding bar with logo SVG and "Find My Brick at Kerry Murphy Healey Park" subheading.
- **`AppHero.vue`** — Hero section with full-width background image (from `DEV_HERO_IMAGE`), white wash overlay, and slot for `BrickFilter`. Desktop trigger for location explorer sits flush to the right viewport edge.
- **`AppFooter.vue`** — Babson College logo repeated on green, mirroring the header.
- **`LocationExplorerTrigger.vue`** — Reusable CTA button that emits `@openLocations`. Rendered in two placements: desktop hero (top-right) and mobile floating (bottom-right, fixed position).

### Search & Filtering (Phases 2–4)

- **`BrickFilter.vue`** (rewritten) — Two-section filter form on a courtyard-green panel:
  - Inscription text input (Zilla Slab labels, 18px Regular)
  - Brick Locations scrollable multiselect listbox (3 items visible, Oswald 16px, 4px item padding)
  - Active filter pills with Font Awesome `×` remove buttons
  - "Clear all" button, disabled when no filters active
- **`TheBricks.vue`** — Search routing:
  - Keyword (≥ 3 chars) → SearchStax, with 500ms debounce
  - SearchStax failure → Drupal CONTAINS fallback
  - Location-only → Drupal JSON:API with `filter[field_brick_zone.id][operator]=IN`
  - Default browse → Drupal JSON:API sorted `A–Z` by inscription
  - Changing location filter cancels any pending keyword debounce

### Pagination (Phase 2)

- **`Pagination.vue`** (rewritten) — Dynamic ellipsis window pagination: `< 1 2 3 ... 50 >`. Font Awesome angle icons for prev/next. Active page styled with a centered 24×4px `brickCourtyardGreen` underline bar via CSS `::after`. 5rem top margin.

### Location Explorer (Phase 5)

- **`LocationExplorer.vue`** — Full-screen overlay (teleported to `<body>`) with:
  - Dark backdrop at 0.87 opacity
  - "BRICK LOCATION" heading in `#EEF1DC`
  - Scrollable sidebar list (Oswald, selected item bold, no underline)
  - Always-visible scroll chevrons (Font Awesome `fa-angle-up`/`fa-angle-down`), inactive at boundaries
  - Full-size map image for selected location, updated on click
  - Close button (`fa-solid fa-xmark`), Escape key, Tab trap, initial focus
  - Desktop: sidebar overlaid on map image, dimensions computed from rendered image size
  - Mobile: map on top, list below

### BrickCard Enhancements (Phase 6)

- "Coming Soon" overlay with inscription text and "Image Coming Soon" for bricks without photos
- "Enlarge Brick" button (top-right, semi-transparent, `fa-up-right-and-down-left-from-center` icon), visible on hover/focus, hidden for coming-soon bricks
- "View location details" bottom button
- Hover: white wash overlay on image area; button switches to medium green
- Card-level `focus-within` ring for keyboard navigation
- Full-size image zoom modal (`UiModal`)
- Location map modal (`UiModal`) with brick location and inscription in caption

---

## Post-Phase Polish & Bug Fixes

These improvements were made after all six phases were complete:

### Accessibility

- **`UiModal`**: Added focus trap (Tab key), initial focus on close button, and `aria-label` prop bound to `role="dialog"`. Each usage in `BrickCard` passes a descriptive label (`Brick image: [inscription]` / `Location map: [inscription]`).
- **`UiModal` + `LocationExplorer`**: Replaced competing `document.body.style.overflow` assignments with a shared reference-counted composable (`src/composables/useBodyScrollLock.ts`), preventing scroll from being incorrectly restored when one overlay closes while another is still open.

### Bug Fixes

- **Map modal `<img src="">`**: Map image now renders only when `parkLocationImgURL` is non-empty (`v-if`), preventing a spurious HTTP GET to the current page URL on first open. Added `isFetchingLocation` flag to prevent concurrent location fetches on rapid re-opens.
- **Cached image loading state**: After setting pre-hydrated image URLs, checks `img.complete` in `$nextTick` to clear `isImgLoading` for images that browsers serve from cache without firing a `load` event.
- **Debounce race**: `locationIds` watcher now cancels any pending inscription debounce before fetching, eliminating stale results overwriting location-filter results.
- **Horizontal scrollbar**: `<body>` had `width: 100vw` which includes the scrollbar gutter, causing a persistent horizontal scrollbar when a vertical scrollbar was present. Changed to `width: 100%`.
- **Location explorer down chevron**: `showDownChevron` initialised to `true`; `updateChevrons()` now also runs after `updateNavHeight()` so the button reflects actual scrollability once the image loads and constrains the nav height.

### UI Refinements

- **Font Awesome**: All text glyphs (`×`, `^`, `v`, `<`, `>`) replaced with FA icons (`fa-xmark`, `fa-angle-up/down/left/right`, `fa-up-right-and-down-left-from-center`). Kit loaded directly in `index.html`.
- **Location filter form**: Zilla Slab Regular 18px labels; location list items 4px top/bottom padding; listbox height `84px` (3 items visible).
- **"View Map of Brick Locations" button**: Oswald Regular 14px.
- **Brick images**: Rounded corners removed.
- **Pagination active page**: 24×4px `brickCourtyardGreen` underline bar (CSS `::after`), replacing Tailwind `tw-underline`.
- **Spacing**: Pagination top margin and container bottom padding unified to 5rem.
- **Favicon**: Updated to official Babson favicon.
- **Babson header**: Logo SVG (instead of text), subheading on same dark green bar.

### Code Quality

- Removed dead `update:totalCount` emit from `TheBricks` (declared but never consumed by `App.vue`).
- Removed invalid `//` CSS comment and dead `#app` font-family rule from `App.vue`.
- Added GitHub Pages deployment workflow.
- Migrated project documentation to `AGENTS.md` (shared with all AI agents); `CLAUDE.md` now references it.

---

## Key Files Created / Rewritten

| File | Status | Notes |
|------|--------|-------|
| `src/components/AppHeader.vue` | New | Babson branding bar |
| `src/components/AppHero.vue` | New | Hero image + search form slot |
| `src/components/AppFooter.vue` | New | Footer logo |
| `src/components/LocationExplorerTrigger.vue` | New | Reusable map CTA button |
| `src/components/LocationExplorer.vue` | New | Full-screen location overlay |
| `src/components/BrickFilter.vue` | Rewritten | Two-section filter form |
| `src/components/Pagination.vue` | Rewritten | Numbered pagination |
| `src/components/UiModal.vue` | Enhanced | Focus trap, aria-label prop, shared scroll lock |
| `src/components/BrickCard.vue` | Enhanced | Coming soon, hover states, modals |
| `src/components/TheBricks.vue` | Enhanced | Search routing, debounce, pagination |
| `src/composables/useBodyScrollLock.ts` | New | Reference-counted body scroll lock |
| `src/services/searchstax.ts` | New | SearchStax API wrapper |
| `src/types/index.ts` | Enhanced | ParkLocation, SearchstaxDoc, injection keys |
| `AGENTS.md` | New | Project context for all AI agents |

---

## Test Coverage

- **143 unit tests** passing (Vitest + Vue Test Utils)
- Test files: `AppHeader`, `AppFooter`, `AppHero`, `LocationExplorerTrigger`, `LocationExplorer`, `BrickFilter`, `BrickCard`, `Pagination`, `UiModal`, `TheBricks`, `App`, `searchstax` service, smoke tests
- E2E tests: Playwright (`tests/e2e/`) covering desktop and mobile viewports

---

## Deployment

Build output in `dist/` → uploaded to Terminal Four CMS (bricks directory in media).

- **Prod:** https://www.babson.edu/kmhpbricks/
- **Test:** https://test-www.babson.edu/kmhpbricks/
