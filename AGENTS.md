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

Vue 3 SPA that displays memorial bricks from a Drupal JSON:API backend. Built with Vite, styled with Tailwind CSS.

### Component hierarchy

```
App.vue                    → provides defaultEnv/defaultUrl via provide/inject
├── AppHero                → hero section; renders BrickFilter in slot
│   └── BrickFilter        → inscription search + location multiselect, v-model two-way binding
├── TheBricks.vue          → fetches brick list, manages search/pagination state
│   ├── BrickCard[]        → individual brick; fetches its own image + location from API on mount
│   │   └── UiModal        → teleported to <body> for image zoom and location map
│   └── Pagination         → emits @update:page
└── LocationExplorer       → map overlay (teleported to body); opened from AppHero trigger
```

### Data flow

1. **App.vue** provides API base URL via `provide()` (defaults to prod `intranet.babson.edu/jsonapi/`)
2. **TheBricks** fetches paginated brick list; watches `inscription` for search (min 3 chars, 500ms debounce); uses SearchStax when keyword active, falls back to Drupal CONTAINS
3. **BrickCard** receives a `brick` prop, then makes two additional API calls on `mounted()`:
   - `file/file/{id}` → thumbnail + full image URLs (with image style URIs)
   - `parkLocations/{id}` → location name + map image
4. Modals use `<teleport to="body">` with fade transitions

### API environments

Configured in `App.vue` provide block. Switch by changing `drupalEnv.prod` to `drupalEnv.local|dev|stage`.

## Key conventions

- **Tailwind prefix**: All utility classes use `tw-` prefix (e.g., `tw-w-full`, `tw-bg-brickLightGreen`). This is set in `tailwind.config.js` `prefix` option.
- **Provide/inject**: `defaultEnv` and `defaultUrl` are injected (not props). Tests must supply these via `global.provide`.
- **Modals**: Always teleported to body. UiModal emits `@close`; parent controls visibility with a boolean.
- **Brand colors**: `brickLightGreen`, `brickMediumGreen`, `brickCourtyardGreen`, `brickBabsonGreen`, `brickSummerNight`, `brickBabsonGrey` — defined in Tailwind config.
- **Fonts**: Oswald (headings, buttons) and Zilla Slab (body text) loaded via Google Fonts CDN.
- **Font Awesome**: Loaded via kit script in `index.html` `<head>` (`kit.fontawesome.com`). Works on localhost by default. Use `fa-solid`/`fa-regular` — `fa-sharp` requires Sharp style enabled in kit settings.
- **Body scroll lock**: Any component that blocks page scroll must use `lockBodyScroll()`/`unlockBodyScroll()` from `src/composables/useBodyScrollLock.ts` (reference-counted — do not set `document.body.style.overflow` directly).
- **Active pagination**: Styled via `.page-active` CSS class + `::after` pseudo-element in `Pagination.vue` (not Tailwind underline utilities).
- **Search service**: `src/services/searchstax.ts` wraps the SearchStax API. Keyword searches route through it first; Drupal CONTAINS is the fallback.

## Testing

- **Unit tests**: `src/components/__tests__/*.spec.ts` using Vitest + Vue Test Utils with jsdom
- **E2E tests**: `tests/e2e/*.spec.ts` using Playwright (Chromium, Firefox, WebKit, mobile viewports)
- BrickCard tests must provide injections: `global: { provide: { defaultEnv: '...', defaultUrl: '...' } }`

## Deployment

Build output in `dist/` is uploaded to Terminal Four CMS (bricks directory in media). The app is embedded in Babson.edu. Prod url: https://www.babson.edu/kmhpbricks/ Test url: https://test-www.babson.edu/kmhpbricks/
