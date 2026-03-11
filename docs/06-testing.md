# ITCMS-7535 — Part 6: Testing Plan

[← Back to Table of Contents](./ITCMS-7535-upgrade-plan.md)

---

## Unit Tests (Vitest)

| Component | New / Updated Tests |
|---|---|
| `AppHeader.vue` | Renders title/branding only; does not render the location trigger |
| `AppHero.vue` | Renders hero image; renders slot content (BrickFilter) over the image; renders desktop trigger placement |
| `LocationExplorerTrigger.vue` | Renders CTA copy; emits `openLocations` on click; supports standard and floating mobile variants |
| `AppFooter.vue` | Renders footer content, links, branding |
| `LocationExplorer.vue` | Renders location list; highlights selected location; swaps map image on click; emits `close` on × button; emits `close` on backdrop click |
| `Pagination.vue` | Renders correct page range; handles ellipsis; emits correct page on click; disables arrows at boundaries; highlights active page |
| `BrickFilter.vue` | Renders keyword input + location dropdown; emits on changes; shows/hides active filter pills; "Clear All" resets both filters |
| `BrickCard.vue` | Shows inscription overlay when image is "coming-soon"; hides overlay for normal images; renders "ENLARGE BRICK" overlay on hover (via group-hover class); hides enlarge overlay for "Coming Soon" bricks; card wrapper is focusable (`tabindex="0"`) and triggers `openMap` on Enter/Space; enlarge button triggers `openImg` on Enter/Space; inner click handlers do not propagate to card wrapper; `role="button"` and `aria-label` attributes are present |
| `TheBricks.vue` | Passes correct sort/pagination/filter params to API; resets page on Drupal-backed query changes; handles Drupal `meta.count`; later handles Searchstax response |
| `searchstax.ts` | Correctly formats search request; parses response; handles errors |

## E2E Tests (Playwright)

| Scenario | Description |
|---|---|
| Page layout | Header, hero, grid, footer all render in correct order |
| Location trigger | Reusable "View Map of Brick Locations" trigger opens the location-explorer overlay from both desktop and mobile placements |
| Location explorer | Sidebar lists all zones; clicking a zone updates the map image; × closes overlay |
| Location explorer mobile | Map on top, scrollable location list below with chevron arrows; selected item bold |
| Hero search | Search form is visually overlaid on the hero image |
| Default browse | Page loads with alphabetical bricks, pagination shows at bottom |
| Page navigation | Click page 2 → URL/state updates, new bricks load, scroll to top |
| Keyword search | Post-Phase 3: type 3+ chars, wait 500ms → Searchstax results update, pagination resets, active filter pill shows |
| Location filter | Select a zone from dropdown → bricks filtered, active filter pill appears |
| Combined filters | Post-Phase 3: keyword + location → both pills shown, results narrow |
| Clear All | Click "Clear All" → all filters removed, default browse restored |
| BrickCard hover — enlarge overlay | Hovering over a brick card's image area reveals the "ENLARGE BRICK" label; moving away hides it |
| BrickCard hover — view location | Hovering over "VIEW LOCATION DETAILS" changes background to green with white text |
| BrickCard keyboard — 1st tab | Tabbing to a brick card shows a visible focus ring; pressing Enter opens the location details modal |
| BrickCard keyboard — 2nd tab | Tabbing again focuses the "ENLARGE BRICK" button (becomes visible); pressing Enter opens the full-size image modal |
| BrickCard keyboard — Coming Soon | A "Coming Soon" brick has only one tab stop (card-level); no enlarge button is rendered or focusable |
| Coming Soon overlay | A brick without an image shows the inscription text on the placeholder |
| Mobile brick grid | 2-column grid on mobile viewports (< 768px), 4-column on desktop |
| Mobile location trigger | Trigger appears as a floating bottom-right control (not in hero) on mobile and remains visible while scrolling |
| Mobile responsive | All filter, pagination, header, and footer controls work on small viewports |

---

**Next:** [Part 7 — Open Questions](./07-open-questions.md)
