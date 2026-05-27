# Clean Habit Tracker with Direct Checklist Adding

This plan streamlines habit creation and removes default boilerplates:
1. **Remove Seeding**: Stop automatically seeding "Work out", "LeetCode", and "Running" into the user's database. Start with a clean slate when a user has no habits.
2. **Inline Adder**: Add an inline input field directly at the bottom of the daily checklist (right page) so users can instantly type and add their own habits.
3. **Automatic Colors**: When adding a habit, automatically assign the next color from `PRESET_COLORS` sequentially, removing the color-picking boilerplate unless the user wants to customize it later.

## Proposed Changes

---

### Core Data Flows

#### [MODIFY] [page.tsx](../app/page.tsx)
- Revert automatic database seeding in `useEffect` when habits are empty. Simply set the fetched data.
- Update `INITIAL_DATA` to start with an empty habits list `[]`.

---

### Component Styling & Interaction

#### [MODIFY] [GoalPlanner.tsx](../components/journal/GoalPlanner.tsx)
- Add state `newHabitName` inside `GoalPlanner`.
- Add prop `onAddHabit` so the planner can trigger habit creation.
- Update the empty state to show: `"No habits added yet. Type a habit below to get started!"`.
- Render an inline habit adder form at the bottom of the checklist.
- When submitted, pick the next preset color from `PRESET_COLORS` using `activeHabits.length % PRESET_COLORS.length` and call `onAddHabit(name, color)`.

#### [MODIFY] [TrackerView.tsx](../components/journal/TrackerView.tsx)
- Keep or refine the calendar page quick-adder, or clean it up if needed. Since we have a direct adder in the checklist, the calendar page adder can remain as an alternative or be simplified. Let's keep it simple.

## Verification Plan

### Manual Verification
1. **Verify Empty State**: Confirm that a new user starts with 0 habits and gets the clean checklist onboarding message.
2. **Verify Inline Add**: Type a habit name in the inline adder on the right page, hit Enter, and confirm it is added immediately to the checklist with an automatically assigned preset color.
3. **Verify Toggle and Save**: Toggle the newly added habit and confirm it saves to Supabase correctly with no errors.
4. **Verify Production Build**: Run `npm run build` to confirm everything compiles successfully.
