# Habit Tracker

A notebook-style habit journal built with Next.js, React, and TypeScript. Track daily completions in a monthly grid, manage a daily checklist, and plan monthly goals. There are no accounts and no backend: everything is saved in your browser's localStorage.

## Local setup

Use Node.js compatible with the Next.js version in `package.json` and npm. Run commands from this repository's root.

```sh
npm ci
npm run dev
```

Open http://localhost:3000 and add your first habit. New journals start empty. No environment variables are needed.

## Data storage

The journal is stored as JSON under the `lockin-journal-v1` localStorage key and saved on every change. The app asks the browser for persistent storage on load (best effort).

Use the Export button (top right) to download a dated `.json` backup, and the Import button to restore one. Import replaces all current data after a confirmation.

Trade-offs:

- No cross-device or cross-browser sync. Each browser profile has its own journal; move data between them with export and import.
- Clearing site data erases the journal. Export a backup first.
- Safari may evict site data after 7 days without a visit, unless the site is installed to the Home Screen or Dock.
- Private browsing windows may not keep data after they close.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run lint` | Run ESLint |
| `npm run build` | Create a production build |
| `npm start` | Serve the production build |

## Code map

- [app/page.tsx](app/page.tsx): journal state, localStorage persistence, and export/import controls.
- [components/journal](components/journal): monthly tracker, daily checklist, and goals.
- [lib/storage.ts](lib/storage.ts): localStorage load/save, export, and import parsing.
- [lib/types.ts](lib/types.ts): journal data types.
- [app/privacy/page.tsx](app/privacy/page.tsx): privacy policy.
- [docs](docs): implementation notes and walkthroughs (written when the app used Supabase).

There is no automated test script in `package.json`. A useful manual check is to create a habit, toggle a completion, add a monthly goal, and reload to confirm persistence.
