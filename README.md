# Bricks

A public-facing web app for [Babson College](https://www.babson.edu/) that lets visitors search for personalized memorial bricks at the Knight Memorial Hill Park (KMHP). Users can look up bricks by inscription text, filter by park location, and view location maps.

This repo is the **front-end UI only**. All brick data, images, and park location metadata are stored on a separate **Acquia-hosted Drupal** site and fetched at runtime via the Drupal JSON:API. The compiled front-end is hosted on babson.edu through Terminal Four (T4).

**Tech stack:** Vue 3, Vite, Tailwind CSS (`tw-` prefix), TypeScript

## Getting started

**Prerequisites:** Node >= 22.13.0 — check with `node --version`

```bash
git clone <repo-url> && cd bricks
npm install
npm run dev       # Dev server → localhost:5173
```

This works out of the box — `.env.dev` is committed with dev API endpoints. Keyword search requires a valid SearchStax token; to set one locally, create `.env.dev.local` (gitignored) and add your `DEV_SEARCHSTAX_TOKEN`. See `.env.example` for all available variables.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server against Drupal dev endpoint (`.env.dev`) |
| `npm run dev:local` | Dev server with local overrides (`.env.localdev`) |
| `npm run dev:stage` | Dev server against stage — `test-www.babson.edu` |
| `npm run dev:stage2` | Dev server against stage2 — `stage2.babson.edu` |
| `npm run dev:prod` | Dev server against production — `intranet.babson.edu` |
| `npm run build` | Production build → `dist/` (uses `.env.production`) |
| `npm run build:stage` | Build for stage |
| `npm run build:stage2` | Build for stage2 |
| `npm run build:production` | Build for production (same as `npm run build`) |
| `npm run serve` | Preview a production build locally |
| `npm run lint` | ESLint check |
| `npm run lint:fix` | ESLint with auto-fix |
| `npm run typecheck` | TypeScript type checking (vue-tsc) |
| `npm test` | Unit tests (Vitest) |
| `npm run test:ui` | Vitest with browser UI |
| `npm run test:coverage` | Unit tests with coverage report |
| `npm run test:e2e` | Playwright end-to-end tests |
| `npm run test:e2e:ui` | Playwright with browser UI |

## Multi-environment config

API endpoints are configured via Vite's mode system. Each mode loads a `.env.[mode]` file at build time.

| Mode | Env file | Drupal endpoint |
|------|----------|-----------------|
| `dev` | `.env.dev` | `babsondev.prod.acquia-sites.com` |
| `localdev` | `.env.localdev` | Local overrides |
| `stage` | `.env.stage` | `test-www.babson.edu` |
| `stage2` | `.env.stage2` | `stage2.babson.edu` |
| `production` | `.env.production` | `intranet.babson.edu` |

To override values locally without committing secrets, create `.env.[mode].local` (gitignored).

## Architecture

### Component hierarchy

```
App.vue                         → root; fetches park locations, injects API config into all children
├── AppHeader                   → site header with Babson logo
├── AppHero                     → hero banner image section
│   ├── LocationExplorerTrigger → "View Brick Locations" button (desktop, hidden on mobile)
│   └── BrickFilter (slot)      → inscription search input + location multiselect listbox
├── TheBricks                   → fetches paginated brick list, manages search/filter/pagination
│   ├── BrickCard[]             → individual brick card (image, enlarge modal, location map modal)
│   │   └── UiModal             → full-screen overlay, teleported to <body>
│   └── Pagination              → page navigation
├── LocationExplorerTrigger     → floating "View Brick Locations" button (mobile only)
├── AppFooter                   → site footer
└── LocationExplorer            → full-screen location map overlay with selectable locations
```

### Data flow

1. **App.vue** fetches all park locations on mount and passes them down as props. It also provides the API base URL to all descendants via Vue's dependency injection.
2. **TheBricks** fetches paginated bricks. It watches the inscription text (min 3 chars, 500ms debounce) and selected location IDs to re-fetch when filters change.
3. **Search routing**: keyword searches go through **SearchStax** (a hosted Solr search service for relevance-ranked results) first, falling back to Drupal's CONTAINS filter if SearchStax is unavailable. Browse and location-only queries go directly to the **Drupal JSON:API** sorted alphabetically.
4. **BrickCard** receives a `brick` prop, then lazily fetches its own image URLs and location map from the Drupal API on mount.
5. **Modals** use `<teleport to="body">` with fade transitions, keyboard focus trapping, and Escape-to-close.

## Testing

- **Unit tests**: `src/components/__tests__/` and `src/services/__tests__/` — Vitest + Vue Test Utils (jsdom)
- **E2E tests**: `tests/e2e/` — Playwright (Chromium, Firefox, WebKit, mobile viewports)

Run a single test file:

```bash
npx vitest run src/components/__tests__/BrickCard.spec.ts
```

## Deployment

### Production — Terminal Four CMS

[Terminal Four (T4)](https://www.terminalfour.com/) is the CMS Babson uses to manage web content. The compiled front-end assets are uploaded to T4's media library, where they're referenced by babson.edu pages.

```bash
npm run build:production    # outputs to dist/
```

The build produces `dist/assets/index-*.js` and `dist/assets/index-*.css` (hashed filenames). Upload these files to T4 media under **javascript/bricks**.

- **Prod**: https://www.babson.edu/kmhpbricks/
- **Stage**: https://test-www.babson.edu/kmhpbricks/

### GitHub Pages (review deploy)

The repo can deploy to GitHub Pages via GitHub Actions for review/demo purposes.

**Required repository secrets:**

- `DEV_DRUPAL_ENDPOINT`
- `DEV_SEARCHSTAX_ENDPOINT`
- `DEV_SEARCHSTAX_TOKEN`

**Optional repository variables:**

- `DEV_HERO_IMAGE`
- `DEV_PLACEHOLDER_IMAGE`
- `DEV_PLACEHOLDER_IMAGE_UUID` — Drupal file entity UUID for the placeholder brick image
- `PAGES_BASE_PATH` — override the default `/<repo-name>/` base path

**Setup:**

1. Enable `Settings > Pages` and set `Build and deployment` to `GitHub Actions`
2. Add the required secrets and any optional variables. Use only browser-safe throwaway values — Vite injects `DEV_*` values into the client bundle at build time
3. Push to `develop` or run the `Deploy GitHub Pages` workflow manually

The workflow writes a temporary `.env.production` during CI only; nothing sensitive is committed.
