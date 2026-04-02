# E2E Tests

This directory contains end-to-end tests using Playwright.

## Running Tests

```bash
# First time setup - install browsers
npx playwright install

# Run all E2E tests
npm run test:e2e

# Run with UI (interactive mode)
npm run test:e2e:ui

# Debug mode
npm run test:e2e:debug
```

## Test Files

- `search.spec.ts` - Search and filter functionality tests
- `images-and-modals.spec.ts` - Image display and modal interaction tests
- `navigation-and-layout.spec.ts` - Page layout, responsiveness, and navigation tests

## Writing New Tests

Create a new `.spec.ts` file in this directory:

```typescript
import { test, expect } from '@playwright/test';

test.describe('My Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Setup code...
  });

  test('should do something', async ({ page }) => {
    // Test code...
  });
});
```

## Best Practices

1. Use descriptive test names
2. Group related tests in describe blocks
3. Clean up after tests (if needed)
4. Use page object pattern for complex pages
5. Avoid hardcoded waits - use Playwright's auto-waiting

See `../TESTING.md` for full documentation.
