# Searchbox — Interim Task Spec

**Date:** 2026-03-12
**Component:** `BrickFilter.vue` + `AppHero.vue`
**Status:** In QA

---

## 1. Container sizing

### Desktop (`md` / `lg` breakpoints)

| Property | Current | Target |
|---|---|---|
| `max-width` of the green search form | `540px` (`md:tw-max-w-[540px]`) | **`700px`** |
| `min-height` of the green search form | none set explicitly | **~310px** (approximate; the green box must be allowed to grow taller as new search features are added) |

The inner search form (`<form>` in `BrickFilter.vue`) and the hero slot wrapper (`AppHero.vue` `lg:tw-max-w-[576px]`) both need to be updated so the form can render at the new 700px width on desktop. The hero section's positioning and bottom-offset may need adjustment to accommodate the taller box.

### Mobile

The same `700px` max-width now applies on mobile as well; the form stays centered and still fills the hero vertically within the available width.

### Growth behavior

The green container should use `min-height` (not a fixed height) so it naturally expands when additional search controls are introduced in future iterations. The search input and any future fields inside should also be free to grow vertically within the form.

---

## 2. "Clear all" button — disabled state

Currently the "Clear all" button is hidden (`v-show="activeFilters.length > 0"`) when no filters are active. The new behavior changes this to **always visible but disabled** when no filters are active.

### When disabled (no active filters OR immediately after clearing)

| Element | Style |
|---|---|
| Oval/pill background | `#CCD8C0` |
| "Clear all" text color | `#31451D` |
| Pointer | `cursor: not-allowed` (or `default`) |
| Interactive | `disabled` attribute set; no hover effect |

### When enabled (one or more active filters)

Keep the current styling (white background, black text, hover lightens).

### Implementation notes

- Replace `v-show="activeFilters.length > 0"` on the Clear all button with an always-visible button.
- Bind `:disabled="activeFilters.length === 0"` on the `<button>`.
- Apply the disabled palette via Tailwind classes, e.g.:

```html
<button
  type="button"
  :disabled="activeFilters.length === 0"
  class="
    tw-rounded-[23px] tw-px-3 tw-py-1
    tw-font-oswald tw-text-sm tw-font-semibold
    tw-transition-colors tw-duration-200
  "
  :class="activeFilters.length === 0
    ? 'tw-bg-[#CCD8C0] tw-text-[#31451D] tw-cursor-not-allowed'
    : 'tw-bg-white tw-text-black hover:tw-bg-gray-100 tw-cursor-pointer'"
  @click="$emit('clearAll')"
>
  Clear all
</button>
```

---

## 3. Location listbox — selected-option background color

Currently, selected options use the brand color `tw-bg-brickLightGreen` (`#C7D28A`). The new requirement is to use the **browser-default selection highlight** instead.

### Implementation notes

- In `optionClasses()`, remove the `tw-bg-brickLightGreen` class from selected items.
- Keep `tw-font-bold` to retain a visual distinction for selected items beyond color alone.
- The browser-default highlight for `option:checked` / `::selection` only applies to native `<select>` elements. Since this is a custom `<ul role="listbox">`, "browser default" likely means either:
  - **(a)** Use the OS highlight blue (approximately `#0078D4` on Windows, `#007AFF` on macOS) — would need to be hard-coded or applied via `::selection`-like class.
  - **(b)** Switch from the custom listbox to a native `<select multiple>` element, which inherits true browser-default styling.

**Implementation note (2026-03-12):** The current implementation keeps the custom ARIA listbox and relies on bold text plus the existing active/focus treatment for selected items rather than adding a custom selected-state background color.

---

## 4. Selected-location filter badges

Each selected location should appear as its own individual pill/badge button inside the filter-actions bar (the semi-transparent white strip below the listbox). Users can remove any single location by clicking its badge — the same pattern already used for the inscription filter badge.

### Current behavior

When multiple locations are selected, they are collapsed into a single badge reading "Brick Locations: 3 selected." Removing this badge clears all selected locations at once.

### New behavior

- Each selected location renders as a **separate pill badge** displaying the location name (e.g., "Brick Location: Centennial Park").
- Each badge has its own **× remove button** that deselects only that location.
- The filter-actions bar wraps naturally as badges are added; the green container grows in height to accommodate them (consistent with the expandable min-height from section 1).
- The "Clear all" button remains at the end of the badge list and clears everything (inscription + all locations) in one click.

### Implementation notes

- In the `activeFilters` computed property, replace the current `locationIds.length > 1` branch (which produces one summary badge) with a loop that produces one `ActiveFilter` entry per selected location ID.
- Each entry should carry its individual location ID as `value` so `removeFilter()` can deselect just that location.
- Update `removeFilter()` to accept an optional location ID parameter. When removing a single location badge, emit `update:locationIds` with that ID filtered out (rather than clearing the entire array).
- The `ActiveFilter` type may need a new optional field (e.g., `locationId: string`) to distinguish individual location badges from the inscription badge during removal.

Example computed output when locations "Centennial Park" and "Heritage Walk" are selected:

```ts
[
  { type: 'location', label: 'Brick Location', value: 'Centennial Park', locationId: 'uuid-1' },
  { type: 'location', label: 'Brick Location', value: 'Heritage Walk',   locationId: 'uuid-2' },
]
```

---

## 5. Out of scope

- New search features (future additions that will expand the green box).
- Mobile-specific layout changes beyond what currently exists.
- Brick card hover/tab/enlarge behavior (shown in the reference screenshot but not part of the searchbox scope).

---

## 6. Files to modify

| File | Changes |
|---|---|
| `src/components/BrickFilter.vue` | Form max-width, min-height, Clear all button disabled state, location selected-option color, individual location filter badges |
| `src/components/AppHero.vue` | Slot wrapper max-width (`lg:tw-max-w-[576px]` → at least `700px`), possible height/offset adjustments |
| `tailwind.config.js` | Add new color tokens if the disabled-state colors should be semantic (optional) |

---

## 7. Acceptance criteria

1. The green search form renders at a max-width of 700px across breakpoints and a minimum desktop height of ~310px.
2. The green container grows in height when content inside it increases (no overflow clipping).
3. On page load (no filters active), the "Clear all" button is visible, disabled, with background `#CCD8C0` and text `#31451D`.
4. After clicking "Clear all" to reset filters, the button returns to the same disabled appearance.
5. When at least one filter is active, "Clear all" is enabled with the current white/black styling.
6. Selected locations in the listbox use browser-default background color (pending clarification on exact implementation approach).
7. Each selected location appears as its own pill badge with a × button that deselects only that location.
8. Removing a single location badge leaves the remaining locations selected and their badges intact.
9. The filter-actions bar keeps a `51px` minimum height and the green container expands in height as location badges wrap to additional lines.
10. Existing keyboard navigation and ARIA accessibility on the location listbox remain intact.
11. All existing unit tests continue to pass; update tests to cover the new disabled state of "Clear all" and individual location badge removal.
