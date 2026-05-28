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
