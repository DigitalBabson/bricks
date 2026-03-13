# ITCMS-7535 — Part 2: Architecture Changes

[← Back to Table of Contents](./ITCMS-7535-upgrade-plan.md)

---

## 2.1 New System Roles

| System | Stores | Provides to Vue App |
|---|---|---|
| **Searchstax** | Fast search index (`ss_uuid`, `ss_zone_uuid`, `ss_file_img_uuid`, `tcngramm_X3b_en_description`) | Complete `Brick` objects + `numFound` — zero-hydration (keyword-only and combined keyword + location) |
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

**Routing rule:** Any request with a keyword (≥3 chars) goes through SearchStax, whether or not a location filter is also active. All other requests go through Drupal JSON:API directly.

**Keyword-only search flow (zero-hydration):**

```
User types keyword (≥3 chars, 500ms debounce)
  ──► Searchstax emselect  (fq=tcngramm_X3b_en_description:{keyword}
                             &fl=ss_uuid,ss_zone_uuid,ss_file_img_uuid,tcngramm_X3b_en_description)
  ──► returns complete Brick[] + numFound (single network call, no Drupal hydration needed)
        │
        ▼
  BrickCard renders  ──► per-card fetches for image URLs + location data (unchanged)
                     ──► Acquia CDN serves images
```

**Combined keyword + location search flow (zero-hydration):**

```
User types keyword + selects location(s)
  ──► Searchstax emselect  (fq=tcngramm_X3b_en_description:{keyword}
                             &fq=ss_zone_uuid:({uuid1} OR {uuid2})
                             &fl=ss_uuid,ss_zone_uuid,ss_file_img_uuid,tcngramm_X3b_en_description)
  ──► returns complete Brick[] + numFound (single network call, no Drupal hydration needed)
```

**Keyword search fallback (SearchStax unavailable):**

```
  SearchStax fails (network error, timeout, 401, 500)
  ──► console.warn logged
  ──► Drupal CONTAINS fallback ──► /bricks?filter[brickInscription][operator]=CONTAINS&...
  ──► returns filtered, paginated brick list (same as pre-Phase-3 behavior)
```

**Default browse flow (no keyword, no location):**

```
  ──► Drupal /bricks?sort=brickInscription&page[limit]=20&page[offset]=N
  ──► returns paginated brick list
```

**Location-only filter flow (no keyword):**

```
  ──► Drupal /bricks?filter[brickParkLocation.id][operator]=IN&filter[brickParkLocation.id][value]={locIds}&sort=brickInscription&...
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

### Searchstax — Keyword-Only Search (zero-hydration)

```
GET {DEV_SEARCHSTAX_ENDPOINT}
    ?q=*:*
    &fq=tcngramm_X3b_en_description:{keyword}
    &rows={pageSize}
    &start={offset}
    &fl=ss_uuid,ss_zone_uuid,ss_file_img_uuid,tcngramm_X3b_en_description
    &wt=json
Headers:
    Authorization: Token {DEV_SEARCHSTAX_TOKEN}
```

**Zero-hydration field mapping:** The SearchStax response contains all fields needed to construct `Brick` objects directly — no Drupal batch call is required.

| `Brick` property | SearchStax field | Description |
|---|---|---|
| `id` | `ss_uuid` | Brick media entity UUID |
| `inscription` | `tcngramm_X3b_en_description[0]` | First element of inscription array |
| `brickImage` | `ss_file_img_uuid` | File entity UUID for image |
| `brickParkLocation` | `ss_zone_uuid` | Park location UUID |

`response.numFound` provides the total count for pagination.

### Searchstax — Combined Keyword + Location Search (zero-hydration)

```
GET {DEV_SEARCHSTAX_ENDPOINT}
    ?q=*:*
    &fq=tcngramm_X3b_en_description:{keyword}
    &fq=ss_zone_uuid:({uuid1} OR {uuid2} OR {uuid3})
    &rows={pageSize}
    &start={offset}
    &fl=ss_uuid,ss_zone_uuid,ss_file_img_uuid,tcngramm_X3b_en_description
    &wt=json
Headers:
    Authorization: Token {DEV_SEARCHSTAX_TOKEN}
```

The `ss_zone_uuid` field stores the Drupal park location UUID. Location filtering uses UUID matching (not `ss_body` location name) for exactness. Same zero-hydration field mapping as keyword-only search.

> **Security note:** The Searchstax token is sent directly from the browser. It is a read-only token scoped to the search index, so the risk is low. Proxying through Drupal would add latency. If needed later, swapping `DEV_SEARCHSTAX_ENDPOINT` to a proxy URL requires no frontend changes.

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
