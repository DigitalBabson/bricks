# ITCMS-7535 — Part 3: Feature Breakdown

[← Back to Table of Contents](./ITCMS-7535-upgrade-plan.md)

---

## 3.1 Alphabetical Sorting (A–Z Default)

**Requirement:** Bricks display in alphabetical order by inscription.

**Current state:** No explicit sort — relies on API default order.

**Changes needed:**

- **TheBricks.vue** — Add `sort=brickInscription` query parameter to the default `fetchBricks()` call. This ensures all paginated results arrive pre-sorted.
- No frontend re-sorting needed if the API returns sorted data.
- When Searchstax is the data source (during keyword search), confirm whether Searchstax results are relevance-ranked or alphabetical. If relevance-ranked, that is acceptable during search; alphabetical applies to the default browse view.

**Files affected:** `TheBricks.vue`

---

## 3.2 Pagination — Clickable Page Numbers

**Requirement:** Replace the current "Load more" button with a `< 1 2 3 4 5 ... 50 >` page control at the bottom (per XD wireframe).

**Current state:** `Pagination.vue` is a simple "Load more" button that emits a `loadmore` event. `TheBricks.vue` tracks a single `offset` and appends results.

**Changes needed:**

### 3.2.1 New `Pagination.vue` component (full rewrite)

**Props:**

| Prop | Type | Description |
|---|---|---|
| `currentPage` | `Number` | Active page (1-indexed) |
| `totalPages` | `Number` | Total number of pages |
| `maxVisible` | `Number` | Max numbered buttons before ellipsis (default: 5) |

**Emits:** `@update:page` with the target page number.

**Rendered output (from XD wireframe):**

```
< 1  2  3  4  5  ...  50  >
      ─
```

- `<` (previous) and `>` (next) arrow buttons at the ends.
- First `maxVisible` page numbers shown, then `...` ellipsis, then the **last page number** (e.g., 50).
- Current page is underlined / visually highlighted.
- Arrows disabled at boundaries (page 1 disables `<`, last page disables `>`).
- Accessible: `aria-label="Page navigation"`, `aria-current="page"` on active item.

**Styling (Tailwind with `tw-` prefix):**

- Font: Oswald.
- Active page: `tw-bg-brickBabsonGreen tw-text-white`.
- Inactive pages: `tw-text-brickSummerNight` with hover underline.
- Arrows: `tw-text-brickBabsonGreen`, disabled state `tw-opacity-30 tw-cursor-not-allowed`.

### 3.2.2 TheBricks.vue state changes

- Replace `offset: 0` with `currentPage: 1`.
- **Total page count:** The Drupal bricks endpoint does not return a total count in `meta`. Derive `totalPages` by checking whether `response.data.links.next` exists (there are more pages) or not (last page). This means pagination shows prev/next arrows and numbered pages but cannot show "of XX" for Drupal-sourced results. For Searchstax results, `numFound` provides an exact total.
- `fetchBricks()` calculates `page[offset]` from `(currentPage - 1) * pageSize`.
- On page change: **replace** the bricks array (not append).
- Scroll to top of grid on page change.

### 3.2.3 Responsive Brick Grid (from XD wireframes)

- **Desktop (≥1024px):** 4 columns of brick cards (current behavior).
- **Mobile (<768px):** **2 columns** of brick cards per row. Each card spans roughly half the viewport width with consistent gutter spacing.
- Implemented via Tailwind responsive grid: e.g., `tw-grid tw-grid-cols-2 md:tw-grid-cols-4 tw-gap-4`.

**Files affected:** `Pagination.vue` (rewrite), `TheBricks.vue`

---

## 3.3 Search — Keyword + Location Filter

**Requirement:** Two search mechanisms with a results summary bar and "Clear All" button.

**Current state:** `BrickFilter.vue` has a single text input bound to `inscription` via `v-model:inscription`. Searches fire when the input is empty or has 4+ characters.

**Changes needed:**

### 3.3.1 Rewrite `BrickFilter.vue`

The filter component becomes a two-part filter bar:

**Section A — "Search by Brick Inscription"**

- Label: "Search by Brick Inscription" (Oswald font, light green text above the input).
- Text input field.
- Emits on input; the parent determines when to fetch results.
- **Minimum character threshold:** 4 characters. Empty string (0 chars) resets to default browse.
- A clear/reset icon button inside the field clears the current query.

**Section B — "Brick Locations" (scrollable list)**

- Label: "Brick Locations" (Oswald font, light green text above the list).
- **Scrollable list box** (not a `<select>` dropdown) — shows multiple locations visible at once, with a vertical scrollbar. Per the XD wireframe, this is a multi-row visible list with scroll, similar to an HTML `<select multiple>` or a custom scrollable `<ul>`.
- Clicking a location selects it (single-select). Clicking again or selecting a different one changes the filter.
- Values populated from `locations` prop (fetched on mount from `/parkLocations`).
- On selection change, emit the selected location ID.

**Section C — Active Filters / Results Bar**

- Sits below the search inputs, inside the same form container.
- Shows olive/green pill-style tags for each active filter, e.g.: `Brick Inscription: Sample keyword ×`
- Each pill has a `×` (close) button to remove that individual filter.
- A **"Clear all"** button (text-style, bordered) sits to the right of the pills, resets all filters.
- When no filters are active, this bar is hidden.

**New props:**

| Prop | Type | Description |
|---|---|---|
| `inscription` (v-model) | `String` | Current keyword search text |
| `locationId` (v-model) | `String` | Selected location ID (empty = all) |
| `locations` | `Array<{id, name}>` | All available locations |
| `resultCount` | `Number` | Total matching bricks (shown in results bar) |

**New emits:**

| Event | Payload | Description |
|---|---|---|
| `update:inscription` | `String` | Keyword changed |
| `update:locationId` | `String` | Location filter changed |
| `clearAll` | — | Reset all filters |

### 3.3.2 TheBricks.vue search logic

**New state:**

```typescript
const inscription = ref('')       // keyword search text
const locationId = ref('')        // selected location filter
const locations = ref<ParkLocation[]>([])  // all park locations (from parkLocations endpoint)
const currentPage = ref(1)
const totalCount = ref(0)         // total matching bricks (from numFound or meta)
const totalPages = computed(...)
const bricks = ref<Brick[]>([])
const isLoading = ref(false)
```

**Fetch logic (pseudocode):**

```
watchEffect:
  if keyword is present:
    → call Searchstax emselect with fq=tcngramm_X3b_en_description:{keyword}
       &rows=20&start={offset}
    → receive ss_uuid[] and numFound
    → for each ss_uuid → GET /brick/{ss_uuid} to hydrate full brick data
    → (optimization: use Promise.all to parallelize hydration calls)
  else if locationId is present:
    → call Drupal /bricks?filter[brickParkLocation.id]={locId}
       &sort=brickInscription&page[limit]=20&page[offset]={offset}
  else:
    → call Drupal /bricks?sort=brickInscription
       &page[limit]=20&page[offset]={offset}

  on any filter change → reset currentPage to 1
```

**New method: `fetchLocations()`**

- Called once on `onMounted`.
- `GET /parkLocations?fields[parkLocation]=name&include=field_brick_zone_image&sort=name`
- Transforms response to `ParkLocation[]` array (id, name, mapImageUrl).
- Used by both the BrickFilter location list and the LocationExplorer overlay.

### 3.3.3 New type definitions

Add to `src/types/index.ts`:

```typescript
interface ParkLocation {
  id: string
  name: string
  mapImageUrl: string   // from included field_brick_zone_image → image_style_uri.full_img
}

interface SearchstaxResponse {
  response: {
    numFound: number        // total matching bricks
    start: number           // current offset
    docs: SearchstaxDoc[]   // matching brick records
  }
}

interface SearchstaxDoc {
  ss_uuid: string           // brick UUID → used to call /brick/{ss_uuid}
  // Additional Searchstax fields (description, etc.) may be present
  [key: string]: unknown
}
```

**Files affected:** `BrickFilter.vue` (rewrite), `TheBricks.vue`, `src/types/index.ts`

---

## 3.4 "Coming Soon" Bricks — Show Inscription

**Requirement:** When a brick has no image, show the gray placeholder with the brick inscription and "Image Coming Soon" text overlaid.

**Current state:** `BrickCard.vue` shows a fallback image (`coming-soon.jpg`) when no image exists, but does not overlay any text.

**New placeholder image:** `DEV_PLACEHOLDER_IMAGE` → `https://babsondev.prod.acquia-sites.com/sites/default/files/2026-03/coming-soon-gray.jpg` (dev). This replaces the old `/sites/default/files/2025-10/coming-soon.jpg`.

**XD wireframe shows (for a brick with no photo):**

```
┌──────────────────────────┐
│                          │
│  DEBORAH DE SANTIS       │
│  CLASS OF 1985           │
│                          │
│   Image Coming Soon      │
│                          │
└──────────────────────────┘
│  VIEW LOCATION DETAILS   │
└──────────────────────────┘
```

The gray placeholder background is shown with the brick's **inscription** (uppercase, Oswald font) centered above "Image Coming Soon" text.

**Changes needed:**

- Update `defaultImgPath` in `BrickCard.vue` to use the new `DEV_PLACEHOLDER_IMAGE` URL.
- Add a computed `isComingSoon` that checks if the brick has no image (brickImage is `'default'` or null).
- When `isComingSoon` is true, render the inscription text and "Image Coming Soon" as an overlay on top of the gray placeholder.

**Implementation:**

```html
<div class="tw-relative">
  <img :src="thumbnailUrl" ... />
  <div
    v-if="isComingSoon"
    class="tw-absolute tw-inset-0
           tw-flex tw-flex-col tw-items-center tw-justify-center
           tw-text-center tw-px-4"
  >
    <p class="tw-font-oswald tw-text-brickSummerNight tw-uppercase tw-text-lg tw-font-semibold">
      {{ brick.inscription }}
    </p>
    <p class="tw-font-zilla tw-text-brickBabsonGrey tw-mt-2">
      Image Coming Soon
    </p>
  </div>
</div>
```

- `isComingSoon` is determined early (before the image fetch) based on whether `brick.brickImage === 'default'` — no need to wait for an image error.

**Files affected:** `BrickCard.vue`

---

## 3.5 Header + Location-Explorer Trigger

**Requirement:** Add a site header at the top of the page with Babson branding, plus a separate reusable trigger that opens the location-explorer overlay (see 3.6).

**Current state:** The app has no header. `App.vue` renders only a wrapper `<div>` around `<the-bricks/>`. The app is embedded inside the Babson.edu CMS page, so the header here is an *in-app* header, not the site-wide Babson navigation.

**Changes needed:**

### 3.5.1 New `AppHeader.vue` component

**Structure (from XD wireframe):**

```
┌─────────────────────────────────────────────────────────────────┐
│  BABSON COLLEGE                                                 │
│  FIND MY BRICK AT KERRY MURPHY HEALEY PARK                     │
└─────────────────────────────────────────────────────────────────┘
```

- Full-width dark green (`tw-bg-brickBabsonGreen`) bar.
- **Line 1:** "BABSON COLLEGE" — large, bold, uppercase, white, Oswald font.
- **Line 2:** "FIND MY BRICK AT KERRY MURPHY HEALEY PARK" — smaller, uppercase, white, Oswald font.
- No location button inside the header. `AppHeader.vue` is branding-only; the location-explorer CTA is a separate component reused elsewhere.

**Props:** none.

**Emits:** none.

**Styling:**

- Background: `tw-bg-brickBabsonGreen` (dark green).
- Text: `tw-text-white tw-font-oswald tw-uppercase`.
- Full-width, inner content padded.

### 3.5.2 New `LocationExplorerTrigger.vue` component

Create a small reusable CTA component responsible only for rendering the **"VIEW MAP OF BRICK LOCATIONS"** control and emitting `openLocations`.

- Reused in two placements:
  - **Desktop:** inside `AppHero.vue`, top-right of the hero image.
  - **Mobile:** inside `App.vue`, as a floating fixed-position control anchored to the bottom-right viewport edge.
- Keeps copy, styling, and event wiring identical across both placements.
- `App.vue` remains the owner of `showLocationExplorer` state; the trigger never opens the overlay directly.
- Uses the courtyard green CTA surface (`#587C32`), while the header and footer remain on Babson green (`#006644`).

**Props:**

| Prop | Type | Description |
|---|---|---|
| `floating` | `Boolean` | When `true`, renders as the mobile floating bottom-right variant |

**Emits:** `@openLocations`

**Files affected:** `src/components/AppHeader.vue` (new), `src/components/LocationExplorerTrigger.vue` (new), `src/components/AppHero.vue`, `src/App.vue`

---

## 3.6 Location-Explorer Overlay

**Requirement:** A full-screen modal overlay, opened from the reusable location-explorer trigger, that lets users browse all park locations/zones and see their respective map images.

**Current state:** Location maps are only visible per-brick via the "See location details" button inside `BrickCard.vue`, which opens a small modal with one location at a time. There is no global location-browsing view.

**Reference:** See the XD screenshot — the overlay shows a left-hand sidebar listing all zones and a large map image on the right.

**Changes needed:**

### 3.6.1 New `LocationExplorer.vue` component

**Layout (desktop):**

```
┌──────────────────────────────────────────────────┐
│                                            [ × ] │
│  ┌──────────────┬───────────────────────────┐    │
│  │              │                           │    │
│  │ 14-15-16     │                           │    │
│  │ 15-16-17     │                           │    │
│  │ 16-17-18     │     [Selected zone's      │    │
│  │ Class Walk   │      map image,           │    │
│  │   of 2019  ◄─│      full-size]           │    │
│  │ Class Walk   │                           │    │
│  │   of 2020    │                           │    │
│  │ Class Walk   │                           │    │
│  │   of 2021    │                           │    │
│  │ Class Walk   │                           │    │
│  │   of 2022    │                           │    │
│  │ Rodger       │                           │    │
│  │   Babson     │                           │    │
│  │   Statue     │                           │    │
│  │              │                           │    │
│  └──────────────┴───────────────────────────┘    │
└──────────────────────────────────────────────────┘
```

- **Left sidebar:** scrollable **flat list** of all zones, sorted alphanumerically in ascending order (matching the API's `sort=name`). No hierarchy or grouping — zones are listed as they come from the API. The active/selected zone is visually highlighted (bold, underline, or background highlight).
- **Right panel:** the map image for the currently selected zone. Uses `image_style_uri.full_img` from the included `field_brick_zone_image`.
- **Close button (×):** top-right corner, closes the overlay.
- The overlay uses `<teleport to="body">` with a dark semi-transparent backdrop, consistent with the existing `UiModal` pattern.

**Props:**

| Prop | Type | Description |
|---|---|---|
| `locations` | `ParkLocation[]` | All park locations from `parkLocations` endpoint (id, name, mapImageUrl) |

**Emits:** `@close`

**Reuses the `ParkLocation` type** (see 3.3.3) — no separate type needed since the `fetchLocations()` call already includes images.

**State:** `selectedZoneId` — tracks which zone is highlighted; defaults to the **first zone in the sorted list** (i.e., the default/first zone alphabetically). There is no separate "Location Overview" map — the default zone's map serves as the initial view.

**Responsive behavior (from XD mobile wireframe):**

- **Desktop:** two-column layout (left sidebar list + right map image).
- **Mobile:** single-column stacked layout — map image on top (full-width), location list below. The list is a vertically scrollable centered list with up/down chevron arrows (`^` / `v`) at the top and bottom to indicate scrollability. The selected location is **bold** with an underline. The `×` close button sits in the top-right corner above the map. The dark/black background fills the full viewport.

### 3.6.2 Data source for zones

The same `fetchLocations()` call used for the filter list (see 3.3.2) provides all the data needed:

```
GET /parkLocations?fields[parkLocation]=name&include=field_brick_zone_image&sort=name
```

This returns location names and their included map images in a single call. The `ParkLocation[]` array is shared between the BrickFilter location list and the LocationExplorer overlay — fetched once at App-level on mount.

### 3.6.3 Wiring into App.vue

- `App.vue` manages a `showLocationExplorer: boolean` state.
- `LocationExplorerTrigger` emits `@openLocations` from either placement → App sets `showLocationExplorer = true`.
- `LocationExplorer` emits `@close` → App sets `showLocationExplorer = false`.
- The locations data can be lifted to App-level (fetched once, passed down to both TheBricks and LocationExplorer) or re-fetched.

**Files affected:** `src/components/LocationExplorer.vue` (new), `src/components/LocationExplorerTrigger.vue`, `src/App.vue`, `src/types/index.ts`

---

## 3.7 Hero Image with Search Overlay

**Requirement:** A hero/banner section at the top of the page (below the header) with a full-width background image. The search form (keyword + location filter) is overlaid on top of the hero.

**Current state:** There is no hero section. `BrickFilter` renders directly above the brick grid inside `TheBricks.vue`.

**Changes needed:**

### 3.7.1 New `AppHero.vue` component

**Layout (from XD wireframe):**

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   [Full-width hero background image]    [VIEW MAP OF BRICK      │
│                                          LOCATIONS] button      │
│    ┌──────────────────────────────────┐                         │
│    │ Search by Brick Inscription      │                         │
│    │ ┌──────────────────────────────┐ │                         │
│    │ │ Sample keyword               │ │                         │
│    │ └──────────────────────────────┘ │                         │
│    │                                  │                         │
│    │ Brick Locations                  │                         │
│    │ ┌──────────────────────────────┐ │                         │
│    │ │ Class Walk of 2022         ▲ │ │                         │
│    │ │ Class Walk of 2021         ▼ │ │                         │
│    │ └──────────────────────────────┘ │                         │
│    │                                  │                         │
│    │ [Brick Inscription: kw  ×] [Clear all] │                   │
│    └──────────────────────────────────┘                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

- Full-width section with a background image (aerial park photo).
- **Hero image** is hosted on Drupal: `DEV_HERO_IMAGE` env var → `https://babsondev.prod.acquia-sites.com/sites/default/files/2026-03/find-my-brick-hero.jpg` (dev).
- **Desktop trigger placement** — `LocationExplorerTrigger` renders in the top-right area of the hero, styled as a green pill/button. On click, emits `@openLocations` to the parent (opens the LocationExplorer overlay).
- **Search form** — left/center area, rendered as a courtyard-green panel inside the hero. The hero image itself has a full-coverage semi-transparent white wash.
- Below the hero: the brick grid.

**Emits:** `@openLocations` — parent (App.vue) toggles the location-explorer overlay.

**Implementation approach:**

- Move the `BrickFilter` rendering from inside `TheBricks.vue` into the hero section.
- `AppHero` wraps the hero image, the desktop `LocationExplorerTrigger`, and includes `<BrickFilter>` as a child (via slot).

**Slot approach (simpler):**

```html
<!-- In App.vue or TheBricks.vue -->
<app-hero @openLocations="showLocationExplorer = true">
  <brick-filter v-model:inscription="inscription" v-model:locationId="locationId" ... />
</app-hero>
```

**Styling:**

- `tw-relative tw-w-full` wrapper with `tw-bg-cover tw-bg-center` for the background image.
- Minimum height: ~350px desktop, ~250px mobile.
- Hero wash: full-coverage semi-transparent white overlay above the background image.
- Search form container: courtyard-green panel, left-aligned on desktop, with a **540px max width**.
- Desktop `LocationExplorerTrigger`: `tw-bg-brickCourtyardGreen tw-text-white tw-font-oswald tw-uppercase tw-px-6 tw-py-3`, positioned top-right on desktop.
- Hero image URL: read from `DEV_HERO_IMAGE` env var.

**Responsive behavior (from XD mobile wireframe):**

- **Desktop:** `LocationExplorerTrigger` sits in the top-right area of the hero. Search form overlays the left/center of the hero image.
- **Mobile:** The hero image is still full-width but the `LocationExplorerTrigger` becomes a floating fixed-position control in the **bottom-right corner of the viewport**, remaining visible while the user scrolls. The search form fills the width of the hero area with no side-by-side layout. Implementation: render the trigger in both locations and toggle visibility with Tailwind responsive classes (`tw-hidden md:tw-block` in hero, `md:tw-hidden` on the floating mobile instance).

**Files affected:** `src/components/AppHero.vue` (new), `src/components/TheBricks.vue` (move BrickFilter out), `src/App.vue`

> **Note on hero image:** The hero is **not** a static bundled asset — it's hosted on Drupal and referenced via `DEV_HERO_IMAGE` env var. This allows different images per environment and easy updates without redeployment.

---

## 3.8 Footer

**Requirement:** Add a footer at the bottom of the page that mirrors the header branding.

**Current state:** No footer exists in the Vue app. The app is embedded in the Babson.edu CMS page which may have its own footer, but the Bricks app itself needs its own closing section.

**Changes needed:**

### 3.8.1 New `AppFooter.vue` component

The footer is a duplicate of the header's first line only — "BABSON COLLEGE" in white on a dark green background. No subheader, no links, no additional content.

**Layout:**

```
┌─────────────────────────────────────────────────────────────────┐
│  BABSON COLLEGE                                                 │
└─────────────────────────────────────────────────────────────────┘
```

- Full-width dark green (`tw-bg-brickBabsonGreen`) bar.
- **"BABSON COLLEGE"** — large, bold, uppercase, white, Oswald font. Same styling as the header's first line.
- No subheader, no links, no copyright line.

**Styling:**

- Background: `tw-bg-brickBabsonGreen` (dark green).
- Text: `tw-text-white tw-font-oswald tw-uppercase tw-font-semibold`.
- Full-width, inner content padded to match header alignment.
- Max-width inner container: `tw-max-w-brickMWL tw-mx-auto`.

**Files affected:** `src/components/AppFooter.vue` (new), `src/App.vue`

---

**Next:** [Part 4 — Files Summary](./04-files-summary.md)
