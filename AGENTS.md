# AGENTS.md

Project context for AI agents working in this repository.

## Commands

```bash
npm run dev          # Start Vite dev server (localhost:5173)
npm run build        # Production build → dist/
npm run serve        # Preview production build

npm test             # Run all unit tests (Vitest)
npx vitest run src/components/__tests__/BrickCard.spec.ts  # Run single test file
npm run test:coverage  # Unit tests with coverage report

npm run test:e2e     # Run Playwright e2e tests (auto-starts dev server)
```

## Architecture

Vue 3 SPA. Displays memorial bricks from Drupal JSON:API backend. Vite + Tailwind CSS.

### Component hierarchy

```
App.vue                    → injects defaultEnv/defaultUrl (provided in main.ts)
├── AppHero                → hero section; renders BrickFilter in slot
│   └── BrickFilter        → inscription search + location multiselect, v-model two-way binding
├── TheBricks.vue          → fetches brick list, manages search/pagination state
│   ├── BrickCard[]        → individual brick; fetches its own image + location from API on mount
│   │   └── UiModal        → teleported to <body> for image zoom and location map
│   └── Pagination         → emits @update:page
└── LocationExplorer       → map overlay (teleported to body); opened from AppHero trigger
```

### Data flow

1. **main.ts** provides API base URL via `provide()`; **App.vue** injects it (falls back to prod `contentfiles.babson.edu/jsonapi/` when `DEV_DRUPAL_ENDPOINT` is unset)
2. **TheBricks** fetches paginated brick list; watches `inscription` for search (min 3 chars, 500ms debounce); uses SearchStax when keyword active, falls back to Drupal CONTAINS
3. **BrickCard** receives `brick` prop, makes two API calls on `mounted()`:
   - `file/file/{id}` → thumbnail + full image URLs (with image style URIs)
   - `parkLocations/{id}` → location name + map image
4. Modals use `<teleport to="body">` with fade transitions

### API environments

Configured via Vite's mode system — `.env.[mode]` files loaded at build time.

| Command | Mode / env file | Drupal endpoint |
|---------|-----------------|-----------------|
| `npm run dev` | `.env.dev` | `babsondev.prod.acquia-sites.com` |
| `npm run dev:stage` | `.env.stage` | `test-www.babson.edu` |
| `npm run dev:stage2` | `.env.stage2` | `stage2.babson.edu` |
| `npm run dev:prod` | `.env.production` | `contentfiles.babson.edu` |
| `npm run build:stage` | `.env.stage` | `test-www.babson.edu` |
| `npm run build:stage2` | `.env.stage2` | `stage2.babson.edu` |
| `npm run build:production` | `.env.production` | `contentfiles.babson.edu` |

Real secrets locally: create `.env.[mode].local` (gitignored) with `DEV_SEARCHSTAX_TOKEN`.

## Key conventions

- **Tailwind prefix**: All utility classes use `tw-` prefix (e.g., `tw-w-full`, `tw-bg-brickLightGreen`). Set in `tailwind.config.js` `prefix` option.
- **Provide/inject**: `defaultEnv` and `defaultUrl` injected (not props). Tests must supply via `global.provide`.
- **Modals**: Teleported to `#bricks-modal-root` (not `body`). `main.ts` creates the root defensively if absent. UiModal emits `@close`; parent controls visibility with boolean.
- **Brand colors**: `brickLightGreen`, `brickMediumGreen`, `brickCourtyardGreen`, `brickBabsonGreen`, `brickSummerNight`, `brickBabsonGrey` — defined in Tailwind config.
- **Fonts**: Oswald (headings, buttons) and Zilla Slab (body text) via Google Fonts CDN.
- **Font Awesome**: Loaded via kit script in `index.html` `<head>` (`kit.fontawesome.com`). Works on localhost by default. Use `fa-solid`/`fa-regular` — `fa-sharp` requires Sharp style enabled in kit settings.
- **Body scroll lock**: Components blocking page scroll must use `lockBodyScroll()`/`unlockBodyScroll()` from `src/composables/useBodyScrollLock.ts` (reference-counted — do not set `document.body.style.overflow` directly).
- **Active pagination**: Styled via `.page-active` CSS class + `::after` pseudo-element in `Pagination.vue` (not Tailwind underline utilities).
- **Search service**: `src/services/searchstax.ts` wraps SearchStax API. Keyword searches route through it first; Drupal CONTAINS fallback.

## Testing

- **Unit tests**: `src/components/__tests__/*.spec.ts` — Vitest + Vue Test Utils + jsdom
- **E2E tests**: `tests/e2e/*.spec.ts` — Playwright (Chromium, Firefox, WebKit, mobile viewports)
- BrickCard tests must provide injections: `global: { provide: { defaultEnv: '...', defaultUrl: '...' } }`

## T4 page markup

The following must appear in the T4 content layout for the widget to function:

```html
<script type="module" src="<t4 type="media" formatter="path/*" id="2227767" />"></script>
<div id="app"></div>
<div id="bricks-modal-root"></div>
```

- `#app` — Vue mount point
- `#bricks-modal-root` — teleport target for UiModal and LocationExplorer (modals). `main.ts` creates it defensively if missing, but it should be present in the layout so modals render before any user interaction.
- The T4 page must also render `h1.type__header--1#page-main-content` (via the page content type) and `.c-breadcrumbs--default` (via the navigation layout) — AppHero reads these from the DOM on mount.

## Deployment

Build output in `dist/` uploaded to Terminal Four CMS (bricks directory in media). App embedded in Babson.edu. Prod: https://www.babson.edu/kmhpbricks/ Test: https://test-www.babson.edu/kmhpbricks/