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
| `BrickCard.vue` | Shows inscription overlay when image is "coming-soon"; hides overlay for normal images |
| `TheBricks.vue` | Passes correct sort/pagination/filter params to API; resets page on filter change; handles Searchstax response |
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
| Keyword search | Type 3+ chars, wait 500ms → results update, pagination resets, active filter pill shows |
| Location filter | Select a zone from dropdown → bricks filtered, active filter pill appears |
| Combined filters | Keyword + location → both pills shown, results narrow |
| Clear All | Click "Clear All" → all filters removed, default browse restored |
| Coming Soon overlay | A brick without an image shows the inscription text on the placeholder |
| Mobile brick grid | 2-column grid on mobile viewports (< 768px), 4-column on desktop |
| Mobile location trigger | Trigger appears as a floating bottom-right control (not in hero) on mobile and remains visible while scrolling |
| Mobile responsive | All filter, pagination, header, and footer controls work on small viewports |

---

**Next:** [Part 7 — Open Questions](./07-open-questions.md)
