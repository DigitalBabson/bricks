# Testing Documentation

This document describes the testing infrastructure for the Bricks project.

## Overview

The project uses two testing frameworks:
- **Vitest** for unit and component tests
- **Playwright** for end-to-end (E2E) tests

## Quick Start

```bash
# Run unit tests
npm run test

# Run unit tests with UI
npm run test:ui

# Run unit tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Debug E2E tests
npm run test:e2e:debug
```

## Unit Testing with Vitest

### Configuration

Vitest is configured in `vitest.config.js`:
- Uses `jsdom` environment for DOM simulation
- Integrates with Vue via `@vitejs/plugin-vue`
- Generates coverage reports with V8 provider
- Setup file at `src/test/setup.js`

### Writing Unit Tests

Unit tests are located in `src/components/__tests__/` directory.

Example test structure:

```javascript
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MyComponent from '../MyComponent.vue'

describe('MyComponent', () => {
  it('renders correctly', () => {
    const wrapper = mount(MyComponent, {
      props: {
        // your props
      }
    })

    expect(wrapper.find('.my-element').exists()).toBe(true)
  })
})
```

### Test Examples

The project includes example tests:
- `BrickCard.spec.js` - Component rendering, props, events, modals
- `BrickFilter.spec.js` - Form inputs, v-model binding, events
- `UiModal.spec.js` - Modal behavior, slots, event emission
- `smoke.spec.js` - Basic smoke test to verify setup

### Running Specific Tests

```bash
# Run a specific test file
npm run test BrickCard

# Run tests in watch mode
npm run test

# Run with coverage
npm run test:coverage
```

## E2E Testing with Playwright

### Configuration

Playwright is configured in `playwright.config.ts`:
- Runs tests against `http://localhost:5173` (Vite dev server)
- Supports multiple browsers: Chromium, Firefox, WebKit
- Mobile viewport testing included
- Automatic dev server startup

### Setup Playwright Browsers

Before running E2E tests for the first time, install browsers:

```bash
npx playwright install
```

### Writing E2E Tests

E2E tests are located in `tests/e2e/` directory.

Example test structure:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('does something', async ({ page }) => {
    const element = page.locator('.my-selector');
    await expect(element).toBeVisible();
    await element.click();
    // assertions...
  });
});
```

### Test Examples

The project includes comprehensive E2E tests:
- `search.spec.ts` - Search functionality, filtering, clear button
- `images-and-modals.spec.ts` - Image display, modal interactions
- `navigation-and-layout.spec.ts` - Page layout, responsive design, accessibility

### Running E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI (interactive mode)
npm run test:e2e:ui

# Run specific browser
npx playwright test --project=chromium

# Debug mode (step through tests)
npm run test:e2e:debug

# Run specific test file
npx playwright test tests/e2e/search.spec.ts
```

## Known Issues

### Vue 3.0.x Component Test Compatibility

There is a known compatibility issue between Vue 3.0.x and the latest versions of @vue/test-utils when testing Single File Components (SFCs) with scoped styles.

**Issue:** Components fail to mount in tests with "SSR context" errors.

**Workarounds:**

1. **Upgrade Vue (Recommended)**
   ```bash
   npm install vue@^3.4.0 @vue/compiler-sfc@^3.4.0
   npm install --save-dev @vue/test-utils@^2.4.0 @vue/server-renderer@^3.4.0
   ```

2. **Use older @vue/test-utils**
   ```bash
   npm install --save-dev @vue/test-utils@2.0.2
   ```

3. **Skip scoped styles in tests**
   - Temporarily remove `scoped` from component styles during testing
   - Use global styles or CSS modules instead

The smoke test (`smoke.spec.js`) validates that the testing framework is configured correctly. Component tests will work once the Vue version is upgraded.

## Test Structure

```
bricks/
├── src/
│   ├── components/
│   │   ├── __tests__/          # Unit tests for components
│   │   │   ├── BrickCard.spec.js
│   │   │   ├── BrickFilter.spec.js
│   │   │   ├── UiModal.spec.js
│   │   │   └── smoke.spec.js
│   │   └── [components...]
│   └── test/
│       └── setup.js             # Vitest setup file
├── tests/
│   └── e2e/                     # E2E tests
│       ├── search.spec.ts
│       ├── images-and-modals.spec.ts
│       └── navigation-and-layout.spec.ts
├── vitest.config.js             # Vitest configuration
└── playwright.config.ts         # Playwright configuration
```

## Coverage Reports

Generate coverage reports:

```bash
npm run test:coverage
```

Coverage reports are generated in the following formats:
- **Text** - Console output
- **JSON** - `coverage/coverage-final.json`
- **HTML** - `coverage/index.html` (open in browser)

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test -- --run

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

## Best Practices

### Unit Tests
1. **Test user behavior**, not implementation details
2. **Use descriptive test names** that explain what is being tested
3. **Follow AAA pattern**: Arrange, Act, Assert
4. **Keep tests isolated** - no shared state between tests
5. **Mock external dependencies** (API calls, etc.)

### E2E Tests
1. **Test critical user journeys** end-to-end
2. **Use data-testid attributes** for stable selectors when needed
3. **Wait for elements** before interacting (Playwright does this automatically)
4. **Test responsive design** using different viewports
5. **Keep tests independent** - each test should work in isolation

## Debugging Tests

### Vitest Debugging

```bash
# Run tests with debug output
DEBUG=vitest npm run test

# Run single test file
npm run test BrickCard.spec.js

# Use console.log in tests
it('debugs something', () => {
  console.log('Debug info:', someValue)
  expect(someValue).toBe(expected)
})
```

### Playwright Debugging

```bash
# Debug mode (opens inspector)
npm run test:e2e:debug

# Run with headed browser
npx playwright test --headed

# Slow down test execution
npx playwright test --headed --slow-mo=1000

# Trace viewer (after test failure)
npx playwright show-trace trace.zip
```

## Writing Your Own Tests

### Adding Unit Tests

1. Create a new file in `src/components/__tests__/`
2. Import the component and test utilities
3. Write describe blocks for features
4. Write it blocks for specific behaviors
5. Run `npm run test` to execute

### Adding E2E Tests

1. Create a new file in `tests/e2e/`
2. Import Playwright test utilities
3. Use `test.describe` to group related tests
4. Write tests for user interactions
5. Run `npm run test:e2e` to execute

## Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [Vue Test Utils Guide](https://test-utils.vuejs.org/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## Troubleshooting

### "Cannot find module" errors
Run `npm install` to ensure all dependencies are installed.

### Playwright browser download fails
Run `npx playwright install` manually or use `npx playwright install --with-deps`.

### Tests timeout
Increase timeout in test file:
```javascript
test('slow test', async ({ page }) => {
  test.setTimeout(60000); // 60 seconds
  // test code...
});
```

### Port 5173 already in use
Change the port in `vite.config.js` and update `playwright.config.ts` to match.

## Future Enhancements

Planned testing improvements:
- [ ] Add visual regression testing
- [ ] Set up CI/CD pipeline
- [ ] Increase coverage to >80%
- [ ] Add performance testing
- [ ] Add accessibility testing (axe-core)
- [ ] Add API mocking with MSW
