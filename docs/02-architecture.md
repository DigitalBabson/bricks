# ITCMS-7535 — Part 2: Architecture Changes

[← Back to Table of Contents](./ITCMS-7535-upgrade-plan.md)

---

## 2.1 New System Roles

| System | Stores | Provides to Vue App |
|---|---|---|
| **Searchstax** | Fast search index | Matching brick IDs, zone counts |
| **Drupal** | Brick content, images, park locations | Image files, image styles, location data, full location list |
| **Vue App** | Nothing (pure frontend) | Search UI, photo overlays, responsive grid |
| **Acquia CDN** | Cached assets from Drupal | Fast global image delivery |

## 2.2 New Component Hierarchy

```
App.vue                          → page layout, provides config, manages overlay state and trigger placement
├── AppHeader.vue                → "BABSON COLLEGE" / "FIND MY BRICK AT KERRY MURPHY HEALEY PARK"
├── AppHero.vue                  → full-width hero image + desktop location trigger
│   ├── LocationExplorerTrigger.vue → reusable "VIEW MAP OF BRICK LOCATIONS" CTA
│   └── BrickFilter.vue          → keyword input + scrollable location list + active filters bar
├── TheBricks.vue                → fetches bricks, manages search/pagination state
│   ├── BrickCard[]              → individual brick card with image + location modal
│   │   └── UiModal              → per-brick image zoom / per-brick location map
│   └── Pagination.vue           → clickable numbered page navigation (< 1 2 3 ... 50 >)
├── LocationExplorerTrigger.vue  → reused as a floating bottom-right control on mobile
├── LocationExplorer.vue         → full-screen overlay: sidebar location list + map viewer
│   └── (teleported to body)
└── AppFooter.vue                → "BABSON COLLEGE" branding bar (mirrors header line 1)
```

## 2.3 New Data-Flow Sequence

**Keyword search flow:**

```
User types keyword
  ──► Searchstax emselect  (fq=tcngramm_X3b_en_description:{keyword})
  ──► returns ss_uuid[] + numFound
        │
        ▼
  For each ss_uuid ──► Drupal /brick/{ss_uuid}
  ──► returns full brick resource (inscription, image URLs, location)
        │
        ▼
  BrickCard renders  ──► Acquia CDN serves images
```

**Default browse flow (no keyword):**

```
  ──► Drupal /bricks?sort=brickInscription&page[limit]=20&page[offset]=N
  ──► returns paginated brick list
```

**Location filter flow (no keyword):**

```
  ──► Drupal /bricks?filter[brickParkLocation.id]={locId}&sort=brickInscription&...
  ──► returns filtered, paginated brick list
```

**Park locations data (fetched once on mount):**

```
  ──► Drupal /parkLocations?include=field_brick_zone_image,field_brick_zone_image.field_media_image
      &fields[parkLocation]=name,field_brick_zone_image
      &fields[media--image]=field_media_image
      &fields[file--file]=uri,url
  ──► populates both the filter dropdown AND the Location Explorer sidebar/maps
```

## 2.4 API Endpoints

All URLs below use `DEV_DRUPAL_ENDPOINT` and `DEV_SEARCHSTAX_ENDPOINT` from `.env`.

### Searchstax — Keyword Search

```
GET {DEV_SEARCHSTAX_ENDPOINT}/emselect
    ?q=*:*
    &fq=tcngramm_X3b_en_description:{keyword}
    &rows={pageSize}
    &start={offset}
    &fl=*
    &wt=json
    &indent=true
Headers:
    Authorization: Token {DEV_SEARCHSTAX_TOKEN}
```

**Key response fields:** `ss_uuid` (brick UUID used to hydrate from Drupal), plus `numFound` for total count.

> **Security note:** The Searchstax token is sent directly from the browser. It is a read-only token scoped to the search index, so the risk is low. Proxying through Drupal would add latency. If needed later, swapping `DEV_SEARCHSTAX_ENDPOINT` to a proxy URL requires no frontend changes.

### Drupal — Single Brick by UUID (hydrate after Searchstax)

```
GET {DEV_DRUPAL_ENDPOINT}/brick/{ss_uuid}
```

Returns the full brick resource including image URLs. One call per brick, or batch if the API supports multi-ID filtering.

### Drupal — Default Paginated Listing (alphabetical browse)

```
GET {DEV_DRUPAL_ENDPOINT}/bricks
    ?sort=brickInscription
    &page[limit]=20
    &page[offset]={offset}
```

Returns paginated brick data plus `meta.count`, which the frontend uses to calculate `totalPages`.

### Drupal — Location-Filtered Listing

```
GET {DEV_DRUPAL_ENDPOINT}/bricks
    ?filter[brickParkLocation.id]={locationId}
    &sort=brickInscription
    &page[limit]=20
    &page[offset]={offset}
```

The filtered response is expected to return `meta.count` as well, allowing numbered pagination to remain accurate while a location filter is active.

### Drupal — All Park Locations (names only, for dropdown)

```
GET {DEV_DRUPAL_ENDPOINT}/parkLocations
    ?fields[parkLocation]=name
    &sort=name
```

Resource type: `parkLocation`.

### Drupal — All Park Locations with Map Images (for Location Explorer)

```
GET {DEV_DRUPAL_ENDPOINT}/parkLocations
    ?include=field_brick_zone_image,field_brick_zone_image.field_media_image
    &fields[parkLocation]=name,field_brick_zone_image
    &fields[media--image]=field_media_image
    &fields[file--file]=uri,url
```

Returns location names plus the related media/file entities needed to resolve the map image URL for the viewer. Resource type: `parkLocation`.

Planning note:

- Fetch this collection once at app startup and reuse it for both the filter UI and the Location Explorer.
- This request gives the frontend the map image URLs, but it should not trigger eager downloading of every map bitmap.
- The overlay should render only the currently selected location's `<img>` so the browser fetches map images on demand as the user browses locations.

---

**Next:** [Part 3 — Feature Breakdown](./03-features.md)
