# Habit Tracker Polish & Seeding Bug Fixes

This plan addresses user feedback and build/run errors:
1. **Fix Color Checked State**: Make checked off habits highly readable and visually distinct by resolving named colors to preset hexes and adding translucent colored backgrounds with matching solid borders.
2. **Easy Habit Editing**: Add an explicit `Pencil` edit button next to the archive/delete buttons so users can easily edit names and colors, especially on mobile.
3. **Database Integrity & Seeding**: Seed a new user's empty profile with the default habits (`Work out`, `LeetCode`, `Running`) using valid UUIDs and preset hex colors in the database. This prevents foreign key constraint failures when checking items off.

## Proposed Changes

---

### Core Data & Seeding

#### [MODIFY] [page.tsx](../app/page.tsx)
- Modify the database fetching logic inside `useEffect`.
- If a user logs in and has 0 habits in the database, automatically generate 3 default habits (`Work out`, `LeetCode`, `Running`) using `crypto.randomUUID()` and hex values from `PRESET_COLORS`.
- Call `createHabit` for each of them to insert them into the database before updating the state.
- Update the default placeholder data to use hex colors and clean values.

#### [MODIFY] [types.ts](../lib/types.ts)
- Add a helper function `getHabitColorHex(colorNameOrHex: string)` that checks if the color starts with `#`. If not, maps it to a corresponding hex code from `PRESET_COLORS` (or returns a fallback hex). This ensures all existing/legacy color values resolve to proper hex strings.

---

### Component Styling & Interaction

#### [MODIFY] [GoalPlanner.tsx](../components/journal/GoalPlanner.tsx)
- Resolve habit color using `getHabitColorHex`.
- Update the checked off container styling:
  - If checked, apply background color with a clean alpha layer (e.g. `${hex}1a` for 10% opacity in light mode, or a solid/translucent border).
  - Use `Check` from `lucide-react` instead of a plain text `✓`.
- Add a visible `Pencil` button to open the edit panel for a habit, so users don't have to rely on double-clicking.
- Ensure the color swatch preset selection is easy to tap.

## Verification Plan

### Manual Verification
1. **Verify Default Seeding**: Create a new test user, sign in, and verify that the 3 default habits are generated, saved to Supabase, and display properly.
2. **Verify Toggle Completions**: Check off the seeded habits and check the browser console. Confirm there are no database foreign key errors, and completions are correctly saved.
3. **Verify Color Checks**: Verify checked items are clearly colored and readable in both light and dark modes.
4. **Verify Edit Flow**: Tap the new `Pencil` icon on a habit, change its name and color swatch, save it, and verify that the changes persist on reload.
5. **Verify Production Build**: Run `npm run build` to confirm everything compiles successfully.
