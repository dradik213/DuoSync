# Unified Workspace, Streamlined Header & Persistent Theme

A comprehensive architectural plan to elevate the DuoSync experience: unifying the Shared Admin and Google/AI Workspace into a single heart-portal full-screen experience, streamlining the Day Pulse and day picker to eliminate redundant date labels, condensing top widget cards for maximum viewport breathing room, and persisting user light/night themes across devices.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural decisions incorporate your clarified requirements:
> - **Unified Heart Experience**: The separate "Shared Admin" and "Workspace" buttons in the main header are replaced by a dedicated Heart button to the left of "Shared Life Hub". Clicking this heart opens a full-screen modal overlay with top navigation buttons (styled similarly to the category filter pills) housing Templates, Hub Admin Settings, Gemini AI, Tasks & Backlog, Calendar Sync, Partner Chat, and Gmail Insights side-by-side.
> - **Complementary Day & Date Hierarchy**: The top Day Pulse widget removes the "Day Pulse:" prefix and full date to show only the Day of the Week (e.g. "Monday"). In the navigation bar below, the day picker removes the day of the week to display only the Date (e.g. "October 12, 2026"), creating a natural visual complement without redundant text.
> - **Compact & Expanded Card Hierarchy**: The "Events & Time Spent" card is removed. When collapsed, compact double-spine cards occupy minimal vertical space to maximize usable schedule canvas below the category filters. When expanded, tightened Weather, Stay, and Moon/Astronomy cards reveal full details.
> - **Clean Category Bar**: Redundant "+ Invite Partner" button next to the partner slider is removed, centralizing invite and hub code actions exclusively inside Profile Settings.
> - **Cross-Device Persistent Theme**: User dark/light preference is stored directly in the active user's profile state (synced with Firestore and localStorage) so appearance stays consistent on every device and reload.

---

## 1. Overview & Core Concept

- **What It Does**: Unifies system administrative controls and external tool integrations (Gemini AI, Google Workspace, templates, chat) into a single cohesive Heart portal, tightens header and daily widget vertical footprint, eliminates duplicate day/date information across widgets, and guarantees persistent theme preferences across sessions.
- **Target Audience / Persona**: Couples managing shared schedules, household routines, and life collaboration who need quick access to productivity tools without interface clutter stealing viewport height from their daily calendar.
- **Key Value**: Delivers higher visual density where needed, preserves vertical space for calendar events, eliminates duplicate UI elements, and unifies fragmented workspaces into an intuitive single click.

---

## 2. User Experience & Visual Design

### Key User Flows

```
[Main Calendar Header]
┌────────────────────────────────────────────────────────────────────────────────────────┐
│  [❤️] Shared Life Hub   [User: Dustin]         [Daily Schedule][Week][Month][Reflect]  │
│                                                                        [+ Add]         │
└────────────────────────────────────────────────────────────────────────────────────────┘
                                    │ (Click Heart)
                                    ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ [❤️ Unified Workspace & Admin]                                                      [✕]│
│  [Templates] [Admin & Hub] [Gemini AI] [Tasks & Backlog] [Calendar] [Chat] [Gmail]     │
│ ────────────────────────────────────────────────────────────────────────────────────── │
│  Active tab workspace with full tools, live sync, partner chat, and admin settings     │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### Visual Identity & Theme Tokens
- **Heart Button**: Positioned directly to the left of "Shared Life Hub". In idle state, it features a warm rose heart (`text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40`) with subtle pulsing indicator if unread partner chat messages exist.
- **Top Tabs in Heart Portal**: Category-style segmented pills with clear active states (`bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 font-semibold`) and hover transitions.
- **Complementary Day Display**:
  - *Day Pulse Bar*: Single prominent Day of Week badge (e.g., `Monday` or `Friday`) in elegant serif/sans styling, with compact stay badge and quick radar pills.
  - *Secondary Nav Bar*: Date only (e.g., `October 12, 2026`) next to the navigation controls (`< Today >`).
- **Collapsed vs. Expanded Cards**:
  - *Collapsed*: Micro double-spine strip with high-density tabular numbers for temperature, moon phase icon, and overnight stay.
  - *Expanded*: 3 clean, tightened cards (Live Weather, Overnight Stay, Lunar & Inspiration) with zero redundant event counts or committed hour bars.

---

## 3. Key Product Decisions & Trade-Offs

### Decision 1: Unified Heart Modal vs. Separate Admin Views
- **Chosen Approach**: Replace the standalone Admin view and separate Workspace modal with a single comprehensive, full-screen overlay triggered by the Heart icon.
- **Why**: Eliminates competing navigation paths (Shared Admin vs Workspace vs Calendar) and lets templates, admin tools, Gemini AI, Google Tasks, Google Calendar, and Partner Chat live in one contextual panel.
- **Trade-off**: Requires consolidating state handlers so switching between templates and AI actions inside the modal preserves intermediate draft state.

### Decision 2: Complementary Day / Date Split
- **Chosen Approach**: Render only the day of the week in the Day Pulse bar, and only the calendar date in the secondary navigation bar below.
- **Why**: Eliminates repeating "Monday, October 12, 2026" twice within a 60-pixel vertical space, reducing text clutter while giving each bar a distinct, clear purpose.

### Decision 3: Card Pruning & Vertical Space Conservation
- **Chosen Approach**: Remove the "Events & Time Spent" card entirely, tighten padding in the remaining 3 cards, and keep micro-pills active when collapsed.
- **Why**: The events list and time distribution are already clearly displayed in the schedule grid right below; duplicating them in a card squeezed out the actual daily timeline on smaller screens and laptops.

### Decision 4: Persistent Theme in User Account & LocalStorage
- **Chosen Approach**: Store `themePreference: 'dark' | 'light'` on `UserAccount` in Firestore, mirror it in `localStorage` for zero-flash initial page rendering, and automatically sync it upon sign-in or user switch.
- **Why**: Fulfills the user requirement for true cross-device persistence without forcing users to re-toggle night view on every session.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        App.tsx State & Context                         │
│  - isDarkMode (synced with currentUser.themePreference & Firestore)   │
│  - isUnifiedWorkspaceOpen (boolean)                                    │
│  - unifiedWorkspaceTab ('templates'|'admin'|'gemini'|'tasks'|'chat'|..)│
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
           ┌─────────────────────────┴─────────────────────────┐
           ▼                                                   ▼
┌──────────────────────────────────────┐    ┌───────────────────────────────────┐
│        CalendarHeader.tsx            │    │    UnifiedWorkspaceModal.tsx      │
│  - [Heart Button] (triggers modal)   │    │  - Top Category-style Nav Tabs    │
│  - Title: "Shared Life Hub"          │    │  - Templates Management Tab       │
│  - User Profile dropdown             │    │  - Hub Admin & Name Edit Tab      │
│  - Nav Date (Date-only in day view)  │    │  - Gemini AI Logger Tab           │
│  - Clean category filters & slider   │    │  - Tasks & Backlog Tab            │
│  - (Removed "+ Invite Partner" button│    │  - Google Calendar Tab            │
│     and "His & Partner" top badge)   │    │  - Real-time Partner Chat Tab     │
└──────────────────┬───────────────────┘    │  - Gmail Insights Tab             │
                   │                        └───────────────────────────────────┘
                   ▼
┌──────────────────────────────────────┐
│     SelectedDaySummaryWidget.tsx     │
│  - Day of Week ONLY (e.g. "Monday")  │
│  - Removed "Day Pulse:" prefix       │
│  - Removed "Events & Time Spent" card│
│  - Compact double-spine when         │
│    collapsed                         │
│  - Tightened Weather, Stay & Moon    │
└──────────────────────────────────────┘
```

### Component & State Plan
1. **`src/types/auth.ts`**:
   - Add `themePreference?: 'dark' | 'light'` to `UserAccount`.
2. **`src/context/AuthContext.tsx`**:
   - Update `updateUserProfile` and theme state initialization to persist `themePreference` to Firestore and `localStorage`.
   - On `switchUser` or initial auth load, restore the active user's saved `themePreference`.
3. **`src/components/CalendarHeader.tsx`**:
   - Add Heart button to the left of "Shared Life Hub" title.
   - Remove "Shared Admin" text button and standalone "Workspace" button.
   - Remove the "His & Partner" badge (`coupleViewLabel`) from the top row.
   - In the partner slider section, remove the "+ Invite" button next to categories.
4. **`src/components/SelectedDaySummaryWidget.tsx`**:
   - Update header: remove `Day Pulse:` text and full date; display only the Day of the Week (`new Date(...).toLocaleDateString('en-US', { weekday: 'long' })`).
   - Remove "Events & Time Spent" card (Card 1).
   - Tighten Card 2 (Weather), Card 3 (Stay), and Card 4 (Moon/Astro) to reduce vertical height.
   - Refine collapsed double-spine card display for minimal footprint.
5. **`src/App.tsx` & Day Picker**:
   - In `App.tsx`, calculate `navLabel` for day scope to display only the Date (e.g., `October 12, 2026`) without the weekday prefix.
   - Unify `AdminPage` and `GoogleWorkspaceModal` into a single connected `UnifiedWorkspaceModal.tsx` containing all tabs (Templates, Admin Settings, Gemini AI, Tasks, Calendar, Chat, Gmail).
   - Connect theme toggle to user profile persistence.
