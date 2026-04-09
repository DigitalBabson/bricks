# Manual Testing Plan: Bricks App

This document outlines the manual testing procedures to ensure the Bricks application meets high standards of visual fidelity, user experience, accessibility, and responsiveness. This plan complements the existing automated test suite (Vitest and Playwright).

## 1. Visual Fidelity & UI Consistency
**Goal:** Ensure the app looks exactly as designed and adheres to brand guidelines.

| Test Case | Description | Expected Result |
|---|---|---|
| **Brand Colors** | Inspect elements for correct use of `brickLightGreen`, `brickBabsonGreen`, etc. | All colors match the Tailwind configuration and brand identity. |
| **Typography** | Verify headings use Oswald and body text uses Zilla Slab. | Fonts are correctly loaded and applied across all components. |
| **Spacing & Alignment** | Check padding, margins, and grid alignment (especially on mobile). | Layout is consistent; no overlapping elements or broken alignments. |
| **Image Quality** | Inspect thumbnails and full-size images in modals. | Images are clear, not distorted, and "Coming Soon" placeholders are present where appropriate. |
| **Iconography** | Verify Font Awesome icons are rendering correctly. | All icons (search, close, chevron, etc.) are visible and correctly styled. |

## 2. User Experience (UX) & Interaction
**Goal:** Ensure the application is intuitive, smooth, and responsive to user input.

| Test Case | Description | Expected Result |
|---|---|---|
| **Transition Smoothness** | Observe modal opening/closing and filter pill appearance. | Transitions are fluid (fade/slide) and not jarring. |
| **Search Responsiveness** | Type in search box and observe the 500ms debounce. | Results update smoothly after the debounce period without UI stutter. |
| **Filter Feedback** | Apply a location filter and observe the "active filter" pill. | The pill appears immediately and clearly indicates the active filter. |
| **Clear All Flow** | Click "Clear All" after applying multiple filters. | All filters are removed, and the grid reverts to the default state seamlessly. |
| **Modal Interaction** | Click "Enlarge Brick" and "View Location Details". | Modals open correctly; clicking the backdrop or close button closes them. |
| **Loading States** | (If applicable) Observe behavior during API latency. | The UI remains stable; no broken layouts while waiting for data. |

## 3. Accessibility (Manual Audit)
**Goal:** Ensure the app is usable by everyone, including those using assistive technologies.

| Test Case | Description | Expected Result |
|---|---|---|
| **Keyboard Navigation** | Navigate the entire app using only `Tab`, `Enter`, and `Space`. | All interactive elements (links, buttons, cards) are reachable and actionable. |
| **Focus Management** | Check focus ring visibility and focus trapping in modals. | Focus ring is clearly visible; focus is trapped within the `UiModal` when open. |

| **Screen Reader Check** | Use VoiceOver (macOS) or NVDA (Windows) to navigate. | All elements have descriptive `aria-label` or `alt` text; landmarks are correctly identified. |
| **Color Contrast** | Use a contrast checker on text/background combinations. | All text meets WCAG AA standards for readability. |

## 4. Cross-Device & Responsive Verification
**Goal:** Ensure the app works perfectly on all intended screen sizes.

| Test Case | Description | Expected Result |
|---|---|---|
| **Mobile Viewport** | Test on a mobile device or emulator (e.g., iPhone/Android). | 2-column grid; floating location trigger is visible and functional. |
| **Tablet/Small Desktop** | Test on medium-sized viewports. | Layout adapts gracefully; no horizontal scrolling. |
| **Desktop Viewport** | Test on standard widescreen monitors. | 4-column grid; all desktop-specific features (like hero placement) are correct. |
| **Browser Compatibility** | Test on Chrome, Safari, and Firefox. | Consistent behavior and rendering across all major browsers. |

## 5. Edge Case Exploration
**Goal:** Test the boundaries of the application's logic.

| Test Case | Description | Expected Result |
|---|---|---|
| **Rapid Interaction** | Click filters or search buttons very quickly. | The app handles rapid input without crashing or showing inconsistent states. |
| **Long Search Queries** | Enter a very long string of text in the search box. | The UI handles the text gracefully (e.g., via ellipsis or wrapping) without breaking. |
| **Empty Results** | Search for a term that matches no bricks. | A clear "No results found" message (or appropriate empty state) is displayed. |
| **Network Interruption** | (Simulate) Disable network during an API call. | The app handles the error gracefully without breaking the UI. |
