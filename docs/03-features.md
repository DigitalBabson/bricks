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
- Use a **dynamic ellipsis window**:
  - near the start: first `maxVisible` page numbers, then `...`, then the last page
  - in the middle: first page, `...`, a small window around the current page, `...`, last page
  - near the end: first page, `...`, then the last `maxVisible` page numbers
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
- **Total page count:** The Drupal bricks endpoint returns `meta.count` (for example, `6280` on the base `/jsonapi/bricks` listing). Use that count to calculate `totalPages` for default browse mode and location-filtered Drupal queries. For Searchstax results, continue to use `numFound`.
- `fetchBricks()` calculates `page[offset]` from `(currentPage - 1) * pageSize`.
- On page change: **replace** the bricks array (not append).
- Scroll to the **top of the brick grid** on page change. Implement this with a template ref on the grid container rather than relying on `this.$el`.

### 3.2.3 Responsive Brick Grid (from XD wireframes)

- **Desktop (current implementation, `lg` / ≥1024px):** 4 columns of brick cards.
- **Mobile / tablet below `lg`:** **2 columns** of brick cards per row. Each card spans roughly half the viewport width with consistent gutter spacing.
- Implemented via Tailwind responsive grid: e.g., `tw-grid tw-grid-cols-2 lg:tw-grid-cols-4 tw-gap-4`.

**Files affected:** `Pagination.vue` (rewrite), `TheBricks.vue`

---

## 3.3 Search — Keyword + Location Filter

**Requirement:** Two search mechanisms with a results summary bar and "Clear All" button.

**Current state:** `BrickFilter.vue` has a single text input bound to `inscription` via `v-model:inscription`. Searches fire when the input is empty or has 3+ characters.

**Changes needed:**

### 3.3.1 Rewrite `BrickFilter.vue`

The filter component becomes a two-part filter bar:

**Section A — "Search by Brick Inscription"**

- Label: "Search by Brick Inscription" (Zilla Slab, white, `18px`, title case as shown in the wireframe rather than forced all-caps).
- Text input field.
- Emits on input, but the parent should debounce fetches by **500ms** to avoid sending a request on every keystroke.
- **Minimum character threshold:** 3 characters. Empty string (0 chars) resets to default browse.
- There is no inline clear/reset icon inside the field. Clearing happens through the form-level filter controls (`×` on the inscription pill or `Clear all`) or by manually clearing the input value.

**Section B — "Brick Locations" (scrollable list)**

- Label: "Brick Locations" (Zilla Slab, white, `18px`, title case as shown in the wireframe rather than forced all-caps).
- **Scrollable list box** (not a `<select>` dropdown) — it shows at most three visible locations before scrolling on both mobile and desktop. It uses a vertical scrollbar, square corners, and remains a compact scrollable `<ul>` rather than a dropdown. List items use Oswald at `16px`.
- Clicking a location toggles it in the active selection set (multi-select).
- Values populated from `locations` prop (fetched on mount from `/parkLocations`).
- On selection change, emit the selected location ID.

**Section C — Active Filters / Results Bar**

- Sits below the search inputs, inside the same form container.
- The action row sits on a separate translucent white rectangle (`white` at roughly `0.53` opacity) behind the chips/buttons.
- The action-row rectangle stays visible even when no filters are active, so the panel height and visual structure stay stable.
- Active filters render as white chips with dark text and rounded `23px` corners, using Oswald for the chip/button text, e.g. `Brick Inscription: Sample keyword ×`.
- Each pill has a `×` (close) button to remove that individual filter.
- The `×` close affordance is a white `x` centered inside a black circular button sized `20px`.
- A **"Clear all"** button with black text on a white rounded button (`23px` radius) sits in the same action strip and resets all filters.
- The design does **not** include a `Showing X bricks` counter in this action row.
- When no filters are active, the strip remains visible but the pills and `Clear all` controls are hidden.

**New props:**

| Prop | Type | Description |
|---|---|---|
| `inscription` (v-model) | `String` | Current keyword search text |
| `locationIds` (v-model) | `String[]` | Selected location IDs (empty array = all) |
| `locations` | `Array<{id, name}>` | All available locations |

**New emits:**

| Event | Payload | Description |
|---|---|---|
| `update:inscription` | `String` | Keyword changed |
| `update:locationIds` | `String[]` | Location filter changed |
| `clearAll` | — | Reset all filters |

### 3.3.2 TheBricks.vue search logic

**New state:**

```typescript
const inscription = ref('')       // keyword search text
const locationIds = ref<string[]>([])  // selected location filters
const locations = ref<ParkLocation[]>([])  // all park locations (from parkLocations endpoint)
const currentPage = ref(1)
const totalCount = ref(0)         // total matching bricks (from numFound or meta)
const totalPages = computed(...)
const bricks = ref<Brick[]>([])
const isLoading = ref(false)
```

**Fetch logic (pseudocode):**

There are four filter combinations. The routing rule is: **any request involving a keyword goes through Searchstax** (even when a location filter is also active). Location-only and default browse stay on the Drupal JSON:API path.

```
watchEffect:
  if keyword.length >= 3 AND locationIds.length > 0:
    → COMBINED (keyword + location) — route through Searchstax
    → call Searchstax emselect with:
       fq=tcngramm_X3b_en_description:{keyword}
       &fq=ss_body:{locationIds...}
       &rows=20&start={offset}&fl=*&wt=json
    → receive ss_uuid[] and numFound
    → hydrate each ss_uuid via GET /brick/{ss_uuid}

  else if keyword.length >= 3:
    → KEYWORD ONLY — route through Searchstax
    → call Searchstax emselect with fq=tcngramm_X3b_en_description:{keyword}
       &rows=20&start={offset}&fl=*&wt=json
    → receive ss_uuid[] and numFound
    → hydrate each ss_uuid via GET /brick/{ss_uuid}

  else if keyword.length > 0:
    → do not fetch yet; wait until the query reaches 3 characters

  else if locationIds.length > 0:
    → LOCATION ONLY — route through Drupal
    → call Drupal /bricks?filter[brickParkLocation.id]={locId}
       &sort=brickInscription&page[limit]=20&page[offset]={offset}

  else:
    → DEFAULT BROWSE — route through Drupal
    → call Drupal /bricks?sort=brickInscription
       &page[limit]=20&page[offset]={offset}

  on any filter change → reset currentPage to 1
  debounce keyword-driven fetches by 500ms
```

**Key routing rule:** Searchstax uses the `ss_body` field to filter by park location when a keyword is also active. The `ss_body` field in the Searchstax index stores the park-location reference that corresponds to the Drupal `brickParkLocation` relationship. Location-only filtering (no keyword) uses Drupal's `filter[brickParkLocation.id]` since Searchstax is not needed for simple location browsing.

**Pagination source:** Drupal-backed requests use `meta.count` for `totalPages`. Searchstax-backed requests (keyword-only or combined) use `numFound`.

**New method: `fetchLocations()`**

- Called once on `onMounted`.
- `GET /parkLocations?fields[parkLocation]=name&include=brick_zone_image&sort=name`
- Transforms response to `ParkLocation[]` array (id, name, mapImageUrl).
- Used by both the BrickFilter location list and the LocationExplorer overlay.

### 3.3.3 New type definitions

Add to `src/types/index.ts`:

```typescript
interface ParkLocation {
  id: string
  name: string
  mapImageUrl: string   // from included brick_zone_image → image_style_uri.full_img
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

**Desktop trigger positioning — progressive anchoring:**

On most screens the trigger should sit flush against the right edge of the viewport (with a small padding). On very wide screens (≥ 2048px) the trigger should stop drifting outward and instead anchor to the right edge of the content column (`max-w-brickMWL`, 1170px).

Implementation: add a custom `3xl` breakpoint at `2048px` in `tailwind.config.js`. Position the trigger **outside** the `max-w-brickMWL` inner container, directly inside the full-width hero `<section>`:

```html
<!-- AppHero.vue — trigger sits in the full-width section, not the content container -->
<section class="tw-relative tw-w-full ...">
  <!-- wash overlay -->

  <!-- Desktop trigger: flush to viewport edge, anchored to content at 3xl -->
  <location-explorer-trigger
    class="
      tw-hidden md:tw-block
      tw-absolute tw-top-12
      tw-right-6
      3xl:tw-right-[calc((100%-1170px)/2+24px)]
    "
    @openLocations="$emit('openLocations')"
  />

  <!-- Content container (search form) -->
  <div class="tw-max-w-brickMWL tw-mx-auto ...">
    <slot />
  </div>
</section>
```

Below `3xl` (< 2048px): `tw-right-6` places the button 24px from the viewport edge.
At `3xl` (≥ 2048px): `calc((100% - 1170px) / 2 + 24px)` computes the distance from the viewport right edge to the content container's right edge plus the same 24px padding, so the button aligns with the content column.

**Tailwind config addition:**

```js
// tailwind.config.js → theme.extend
screens: {
  '3xl': '2048px',
},
```

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
- **Right panel:** the map image for the currently selected zone. Uses `image_style_uri.full_img` from the included `brick_zone_image`.
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
GET /parkLocations?fields[parkLocation]=name&include=brick_zone_image&sort=name
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
- **Desktop trigger placement** — `LocationExplorerTrigger` renders in the top-right area of the hero, styled as a green pill/button. On click, emits `@openLocations` to the parent (opens the LocationExplorer overlay). The trigger is positioned flush to the viewport right edge on most screens, but at the `3xl` breakpoint (≥ 2048px) it anchors to the right edge of the content column instead (see §3.5.2 for implementation details).
- **Search form** — rendered as a courtyard-green panel inside the hero. On mobile it fills the hero vertically from top to bottom. On desktop it intentionally overhangs the bottom edge of the hero image. The hero image itself has a full-coverage semi-transparent white wash.
- Below the hero: the brick grid. On desktop there is roughly `140px` of spacing between the hero image and the grid region to accommodate the overhanging search panel. On mobile, the gap above the grid matches the grid’s horizontal inset (`32px` / `tw-pt-8`).

**Emits:** `@openLocations` — parent (App.vue) toggles the location-explorer overlay.

**Implementation approach:**

- Move the `BrickFilter` rendering from inside `TheBricks.vue` into the hero section.
- `AppHero` wraps the hero image, the desktop `LocationExplorerTrigger`, and includes `<BrickFilter>` as a child (via slot).

**Slot approach (simpler):**

```html
<!-- In App.vue or TheBricks.vue -->
<app-hero @openLocations="showLocationExplorer = true">
  <brick-filter v-model:inscription="inscription" v-model:locationIds="locationIds" ... />
</app-hero>
```

**Styling:**

- `tw-relative tw-w-full` wrapper with `tw-bg-cover tw-bg-center` for the background image.
- Fixed height: `355px` on mobile, ~350px minimum on tablet, and a fixed `276px` desktop hero height.
- Hero wash: full-coverage semi-transparent white overlay above the background image.
- Search form container: on mobile it fills the hero height with a **425px max width** and stays centered; on desktop it is centered with a **576px max width** and `48px` horizontal padding. The panel itself has square corners (no border radius).
- On desktop, the search panel overhangs the bottom edge of the hero and the hero reserves about `140px` of space below before the grid starts.
- Desktop `LocationExplorerTrigger`: `tw-bg-brickCourtyardGreen tw-text-white tw-font-oswald tw-uppercase tw-px-6 tw-py-3`. Positioned flush to the viewport right edge (`tw-right-6`) on most screens; at `3xl` (≥ 2048px) anchors to the content column edge via `3xl:tw-right-[calc((100%-1170px)/2+24px)]`. The trigger sits directly inside the full-width hero `<section>`, not inside the `max-w-brickMWL` content container.
- Hero image URL: read from `DEV_HERO_IMAGE` env var.

**Responsive behavior (from XD mobile wireframe):**

- **Desktop:** `LocationExplorerTrigger` sits in the top-right area of the hero, flush to the viewport edge until the `3xl` breakpoint where it anchors to the content column. Search form overlays the left/center of the hero image.
- **Mobile:** The hero image is full-width and `355px` tall. The search form fills the hero vertically from top to bottom, and the `LocationExplorerTrigger` becomes a floating fixed-position control in the **bottom-right corner of the viewport**, remaining visible while the user scrolls. Implementation: render the trigger in both locations and toggle visibility with Tailwind responsive classes (`tw-hidden md:tw-block` in hero, `md:tw-hidden` on the floating mobile instance).

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

## 3.9 BrickCard Hover, Focus & Keyboard Interaction

**Requirement:** Each brick card has two interactive zones with distinct hover states, plus full keyboard accessibility via sequential tab stops. See `docs/wireframes/hovers.png` for the visual reference.

**Current state:** The brick image has a simple `hover:tw-opacity-50` effect and is clickable to enlarge. The "See location details" button has a hover background-color change. There is no visible "Enlarge Brick" label, no card-level focus outline, and no structured tab order.

**Changes needed:**

### 3.9.1 Hover States (Mouse)

The wireframe defines two hover zones:

**Zone 1 — Card body (image area)**

- On hover over the image area, display an **"ENLARGE BRICK"** label overlay in the top-right corner of the image. The label includes a magnifying-glass icon (🔍) and white text on a dark semi-transparent background.
- The overlay is hidden by default and appears only on `:hover` of the card's media container.
- Clicking anywhere on the image opens the full-size image modal (existing behavior).

**Zone 2 — "VIEW LOCATION DETAILS" button**

- Rename the existing "See location details" button text to **"VIEW LOCATION DETAILS"** (uppercase, Oswald font) to match the wireframe.
- On hover, the button background changes to `tw-bg-brickMediumGreen` with `tw-text-white` (existing behavior, confirmed by wireframe).

### 3.9.2 Keyboard / Tab Order

The wireframe specifies two sequential tab stops per card for keyboard navigation:

| Tab Stop | Element | Action on Enter/Space |
|---|---|---|
| **1st Tab** | Whole card (image + location button wrapper) | Opens the location details modal |
| **2nd Tab** | "ENLARGE BRICK" button | Opens the full-size image modal |

- The **1st tab stop** wraps the entire card in a focusable container (`tabindex="0"`) with a visible focus ring (solid dark border matching the wireframe's thick black outline). Pressing Enter or Space on this focused card triggers `openMap()`.
- The **2nd tab stop** is a dedicated `<button>` for "ENLARGE BRICK" that sits visually in the top-right corner of the image area. It receives focus after the card wrapper. Pressing Enter or Space triggers `openImg()`.
- Focus styles: a solid `tw-ring-2 tw-ring-brickSummerNight` outline on the card wrapper (1st tab), and the standard focus ring on the enlarge button (2nd tab).

### 3.9.3 "Coming Soon" Brick — Hover & Keyboard Variant

For bricks with no image (`isComingSoon === true`):

- The "ENLARGE BRICK" overlay and 2nd tab stop are **not rendered** (there is no image to enlarge).
- The card still has the 1st tab stop (whole card focus → opens location details).
- The "VIEW LOCATION DETAILS" button hover behavior remains the same.
- The card body shows the inscription text and "Image Coming Soon" overlay on the gray placeholder (as defined in section 3.4), with no hover opacity change.

### 3.9.4 Implementation

```html
<!-- BrickCard.vue — updated template structure -->
<article
  class="brick-card tw-shadow-brickCard tw-text-center"
  tabindex="0"
  role="button"
  aria-label="View location details for {{ brick.inscription }}"
  @click="openMap"
  @keydown.enter.prevent="openMap"
  @keydown.space.prevent="openMap"
>
  <div class="brick-card__media tw-relative tw-group">
    <!-- Existing image or placeholder -->
    <img v-if="!isComingSoon" ... />

    <!-- "ENLARGE BRICK" hover overlay + 2nd tab stop -->
    <button
      v-if="!isComingSoon"
      class="
        tw-absolute tw-top-2 tw-right-2
        tw-bg-black/70 tw-text-white tw-font-oswald tw-uppercase
        tw-px-3 tw-py-1 tw-text-sm
        tw-opacity-0 group-hover:tw-opacity-100
        focus:tw-opacity-100
        tw-transition-opacity tw-duration-200
      "
      aria-label="Enlarge brick image"
      @click.stop="openImg"
      @keydown.enter.stop="openImg"
    >
      Enlarge Brick 🔍
    </button>

    <!-- Coming Soon overlay (from 3.4) -->
    <div v-if="isComingSoon" class="...">...</div>
  </div>

  <button
    class="
      tw-w-full tw-py-4 tw-text-brickSummerNight tw-font-oswald tw-uppercase
      hover:tw-bg-brickMediumGreen hover:tw-text-white
      tw-transition-background tw-duration-200 tw-ease-in-out
    "
    tabindex="-1"
    @click.stop="openMap"
  >
    View Location Details
  </button>
</article>
```

**Key implementation notes:**

- The `<article>` wrapper gains `tabindex="0"` and click/keyboard handlers for the 1st tab stop.
- The "ENLARGE BRICK" `<button>` uses Tailwind's `group-hover` to appear on card hover and `focus:tw-opacity-100` to appear on keyboard focus.
- The "VIEW LOCATION DETAILS" button uses `tabindex="-1"` since the card wrapper already handles location-detail activation on the 1st tab stop; the button remains clickable by mouse but is skipped in the tab order to avoid redundancy.
- `.stop` modifier on inner click handlers prevents the card-level `@click="openMap"` from also firing.
- The `aria-label` on the article provides screen reader context.

**Accessibility considerations:**

- `role="button"` on the article informs assistive tech that the card is interactive.
- Two distinct `aria-label` values distinguish the card action ("View location details") from the enlarge action ("Enlarge brick image").
- Focus ring is visible and high-contrast, meeting WCAG 2.1 AA focus-indicator requirements.

**Files affected:** `BrickCard.vue`

---

**Next:** [Part 4 — Files Summary](./04-files-summary.md)
