# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start Vite dev server (localhost:5173)
npm run build        # Production build → dist/
npm run serve        # Preview production build

npm test             # Run all unit tests (Vitest)
npx vitest run src/components/__tests__/BrickCard.spec.js  # Run single test file
npm run test:coverage  # Unit tests with coverage report

npm run test:e2e     # Run Playwright e2e tests (auto-starts dev server)
```

## Architecture

Vue 3 SPA that displays memorial bricks from a Drupal JSON:API backend. Built with Vite, styled with Tailwind CSS.

### Component hierarchy

```
App.vue              → provides defaultEnv/defaultUrl via provide/inject
└── TheBricks.vue    → fetches brick list, manages search/pagination state
    ├── BrickFilter  → search input, v-model:inscription two-way binding
    ├── BrickCard[]  → individual brick; fetches its own image + location from API on mount
    │   └── UiModal  → teleported to <body> for image zoom and location map
    └── Pagination   → emits @loadmore
```

### Data flow

1. **App.vue** provides API base URL via `provide()` (defaults to prod `intranet.babson.edu/jsonapi/`)
2. **TheBricks** fetches paginated brick list; watches `inscription` for search (min 4 chars)
3. **BrickCard** receives a `brick` prop, then makes two additional API calls on `mounted()`:
   - `media/image/{id}` → thumbnail + full image URLs (with image style URIs)
   - `parkLocations/{id}` → location name + map image
4. Modals use `<teleport to="body">` with fade transitions

### API environments

Configured in `App.vue` provide block. Switch by changing `drupalEnv.prod` to `drupalEnv.local|dev|stage`.

## Key conventions

- **Tailwind prefix**: All utility classes use `tw-` prefix (e.g., `tw-w-full`, `tw-bg-brickLightGreen`). This is set in `tailwind.config.js` `prefix` option.
- **Provide/inject**: `defaultEnv` and `defaultUrl` are injected (not props). Tests must supply these via `global.provide`.
- **Modals**: Always teleported to body. UiModal emits `@close`; parent controls visibility with a boolean.
- **Brand colors**: `brickLightGreen`, `brickMediumGreen`, `brickBabsonGreen`, `brickSummerNight`, `brickBabsonGrey` — defined in Tailwind config.
- **Fonts**: Oswald (headings, buttons) and Zilla Slab (body text) loaded via Google Fonts CDN.

## Testing

- **Unit tests**: `src/components/__tests__/*.spec.ts` using Vitest + Vue Test Utils with jsdom
- **E2E tests**: `tests/e2e/*.spec.ts` using Playwright (Chromium, Firefox, WebKit, mobile viewports)
- BrickCard tests must provide injections: `global: { provide: { defaultEnv: '...', defaultUrl: '...' } }`

## Deployment

Build output in `dist/` is uploaded to Terminal Four CMS (bricks directory in media). The app is embedded in the Babson.edu. Prod url: https://www.babson.edu/kmhpbricks/ Test url: https://test-www.babson.edu/kmhpbricks/
