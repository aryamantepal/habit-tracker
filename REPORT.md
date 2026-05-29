# Fix Report

## What Was Found

Reviewed `ERR.MD` (console errors logged from the browser) and the full codebase. Three categories of errors were reported:

### 1. Duplicate React keys in `TrackerView` — already fixed
`WEEK_DAYS = ['S','M','T','W','T','F','S']` has duplicate 'T' (Tue/Thu) and 'S' (Sat/Sun). Using `key={wd}` caused React duplicate-key warnings. **This was already corrected in the current code** — the map uses `key={`${wd}-${idx}`}`, so the error is stale.

### 2. Nested `<button>` inside `<button>` in `GoalPlanner` — already fixed
The habit row wrapper was previously a `<button>` that contained action buttons (archive, delete, edit) — invalid HTML causing a hydration error. **This was already fixed** — the outer wrapper is now a `<div>`, with only the toggle action being a `<button>` inside.

### 3. Completion add/remove errors — fixed now

**Root cause:** `addCompletion` used a plain `insert` call. If the same habit+date combination was attempted twice (race condition, fast double-tap, or retry after a failed optimistic rollback), Supabase's unique constraint on `(habit_id, date)` would reject the insert and log `Error adding completion: {}`. The `{}` output was because the Supabase error object's message wasn't being extracted.

**Fixes applied:**

**`lib/api.ts`**
- `addCompletion`: changed `insert` → `upsert` with `onConflict: 'habit_id,date'` and `ignoreDuplicates: true`. Duplicate inserts now silently no-op instead of throwing.
- Both `addCompletion` and `removeCompletion` now log `error.message` instead of the raw object (so errors are human-readable), and `throw` the error so callers can react.

**`app/page.tsx`** — `handleToggleCompletion`
- Added `try/catch` around both DB calls.
- On failure: **rolls back the optimistic UI update**, restoring the previous state. This means if a completion fails to sync, the checkbox snaps back rather than showing a false state.

## Files Changed
- `lib/api.ts` — upsert + proper error propagation
- `app/page.tsx` — error rollback on optimistic toggle
- `ERR.MD`, `INSTRUCTIONS.MD`, `screenshot.png` — removed (planning artifacts, not part of codebase)

---

# Follow-up: Codebase audit fixes + theme rework

After the initial error fixes, a fuller audit surfaced more issues. These were fixed in priority order, each as its own commit.

## Fix #1 — Error propagation + optimistic rollbacks across the board
The first pass only hardened the completion toggle. Every other mutation still logged-but-swallowed errors, and every other optimistic handler left the UI in a false state on failure.

- `lib/api.ts`: `createHabit`, `updateHabit`, `deleteHabit`, `createGoal`, `updateGoal`, `deleteGoal` now log `error.message` and **throw** so callers can react.
- `updateGoal` previously had no `.select()` (always returned `null`) and updated with a raw `updates` object — now uses an explicit DB payload + `.select().single()`.
- `app/page.tsx`: `handleAddHabit`, `handleUpdateHabit`, `handleDeleteHabit`, `handleAddGoal`, `handleToggleGoal`, `handleDeleteGoal`, `handleEditGoal` all capture prior state and **roll back** the optimistic update if the DB write fails. Deleting a habit also restores its completions on rollback.

## Fix #2 — Typed `GoalPlanner` data prop
- Replaced `data: any` with `data: JournalData`; the inline `HabitDefinition`/`Completion` annotations are now type-checked against the real shape.
- Removed the unused `isToday` import.

## Fix #3 — Fetch failure no longer hangs on the loading screen
- `fetchJournalData` previously ignored query errors and returned empty arrays. It now collects the first error from the habit/completion/goal queries and throws.
- `app/page.tsx` wraps the fetch in `.catch()/.finally()`, adds a `fetchError` state, and renders a retry screen instead of spinning forever.

## Fix #4 — Future-date feedback
- Selecting a future date previously disabled the checkboxes silently. Now an inline note explains why ("You can't check off habits for a future date…").

## Theme rework — soft sage green, light-only
Chosen direction (confirmed with the user): soft sage green accents, light-only, Elixir-ERP-inspired soft/light vibe.

- **Removed dark mode entirely** — all `dark:` classes stripped from every component.
- **Palette:** warm cream `#f4f3ee` app background, white / `#faf9f5` cards, soft warm borders (`#e7e4da` / `#ebe8df`), sage green `#6f8d76` (hover `#5e7a65`) as the single accent for buttons, selected day, goal checkboxes, focus rings, progress bars, and links.
- Calendar day shading switched from emerald to sage rgba; deeper fill = more habits completed that day.
- Softer rounded corners (`rounded-xl`/`rounded-2xl`/`rounded-3xl`) and a gentler shadow on main surfaces.

## Verification
- `npx tsc --noEmit` clean after each change.
- `npm run build` passes.
- Auth screen rendered in a headless browser to confirm the new theme (cream bg, white card, sage Sign In button/link). The main app screen is behind Supabase auth so it wasn't screenshotted, but it uses the same palette tokens.

## Note / pre-existing issue
- There are two `package-lock.json` files (one in the repo, one at `/Users/aryamantepal/`). Next.js warns about the ambiguous workspace root. Not changed here — flag for cleanup.
