# Implementation Plan: Dynamic Hub Title, Floating Add Button, & Sleek 3-Position Sliders

Synchronize the top header hub title with the admin-configured hub name, introduce a bottom-right floating action button (+ Add) for 1-tap activity creation, relocate the partner filter slider directly to the right of the date with a clean 3-position center state (removing the redundant "Both" button), align the stay selector with a center "Home" position, and streamline the Fridge Photos button to an icon-only control.

---

## User Review Required

> [!IMPORTANT]
> - **Top-Left `+ Add` Button Relocation**: The `+ Add` button will be removed from the top header bar and placed as a modern, accessible **Floating Action Button (FAB)** in the bottom-right corner (`fixed bottom-6 right-6 z-40`), providing quick access on both mobile and desktop.
> - **Dynamic Hub Title**: The static `"Shared Life Hub"` text in the header will dynamically display `currentHub?.name` (fallback to `"Shared Life Hub"` if unset). When the hub name is edited in Admin or Unified Workspace (e.g. to `"Our Life"`), the header title updates in real-time.
> - **3-Position Partner Slider Next to Date**: Placed directly to the right of the date navigation label (`{navLabel}`). Left = Partner 1 / Her, Center = Both (with balanced subtle highlight), Right = Partner 2 / Him. The separate `"Both"` button is eliminated.
> - **3-Position Stay Selector with Center "Home"**: Left = Partner 1 home, Center = Home (our home), Right = Partner 2 home. The redundant standalone "Home" button is removed.
> - **Icon-Only Photos Button**: The text `"Photos"` is removed from the schedule bar, leaving the camera icon button immediately to the right of the stay slider.

---

## Proposed Changes

### 1. Header Hub Title & Top Bar Streamlining (`src/components/CalendarHeader.tsx`)
- Bind the header brand title to `currentHub?.name || 'Shared Life Hub'` so any edits in admin or creation flows instantly reflect on the home view.
- Remove the inline `+ Add` button from the top-left header bar to give the title and pastel heart pristine breathing room.
- Relocate the **Partner Slider** from the far-right filter row to sit directly adjacent to `{navLabel}` on the left side of the secondary header bar.
- Update the Partner Slider to a seamless 3-state slider:
  - Left = `partner1Label`
  - Center = Both of us (`partnerFilter === 'all'`), styled with a subtle balanced highlight
  - Right = `partner2Label`
  - Remove the standalone `"Both"` text button.
- Ensure the secondary navigation bar maintains clean flex alignment and does not awkwardly wrap on mobile.

---

### 2. Floating Action Button for Quick Add (`src/App.tsx`)
- Add a floating round `+` button in `src/App.tsx`:
  - Position: `fixed bottom-6 right-6 z-40 sm:bottom-8 sm:right-8`
  - Styling: High-contrast rounded-full button (`bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 shadow-xl hover:scale-105 active:scale-95 transition-all`) with soft ring and glow.
  - Action: Triggers `onOpenAddModal()` for instant activity scheduling.

---

### 3. Center "Home" Stay Slider & Icon-Only Photos Button (`src/components/InteractiveDaySchedule.tsx`)
- Refactor the Stay Slider to a 3-position tri-state control:
  - Left: `partner1Label` (`her_home`)
  - Center: `Home` (`our_home`) with subtle balanced highlight
  - Right: `partner2Label` (`his_home`)
  - Remove the extra separate `"Home"` text button.
- Streamline the Photos button:
  - Remove the text `"Photos"` while keeping the clean camera icon button (`<Camera className="w-4 h-4" />`) with counter badge (e.g. `(3)`) and tooltip.
  - Position it directly to the right of the stay slider.

---

## Verification Plan

### Automated Build & Lint Verification
1. Run `compile_applet` to confirm zero TypeScript compilation errors across `CalendarHeader.tsx`, `App.tsx`, and `InteractiveDaySchedule.tsx`.
2. Run `lint_applet` to ensure ESLint rules pass.

### User Interaction Testing
1. **Hub Name Sync**: Verify that changing the hub name in Admin (e.g. to "our life") immediately updates the title in the top header.
2. **Floating Button**: Click the bottom-right `+` button and confirm the Add Activity modal opens smoothly.
3. **Partner Slider**: Toggle the slider between Partner 1 (left), Both (center), and Partner 2 (right). Verify calendar events filter accurately.
4. **Stay Slider**: Toggle the slider between Partner 1 (left), Home (center), and Partner 2 (right). Verify day stay status updates.
5. **Icon-Only Photos**: Confirm clicking the camera icon opens the Fridge Photos modal.
6. **Mobile & Desktop Spacing**: Test viewport responsiveness to ensure all items fit naturally without overlapping or horizontal scroll issues.
