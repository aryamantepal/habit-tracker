# Habit Tracker

A notebook-style habit journal built with Next.js, React, TypeScript, and Supabase. Track daily completions in a monthly grid, manage a daily checklist, and plan monthly goals. Email/password accounts keep each user's journal in Supabase.

## Local setup

Use Node.js compatible with the Next.js version in `package.json` and npm. Run commands from this repository's root.

```sh
npm ci
```

Create a Supabase project, enable email/password sign-in, and run [supabase_schema.sql](supabase_schema.sql) in its SQL editor. It creates `habits`, `completions`, and `monthly_goals` with row-level security. The policy statements are intended for initial setup; rerunning them against existing policies requires adjustment.

Create `.env.local` with your project's public client credentials:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-public-anon-key
```

The client throws an error if either variable is missing. Use the public anon key, never a service-role key. Configure Supabase's authentication URLs for your local/deployed site and complete email verification if enabled.

```sh
npm run dev
```

Open http://localhost:3000, create an account, and add your first habit. New journals start empty.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run lint` | Run ESLint |
| `npm run build` | Create a production build |
| `npm start` | Serve the production build |

The same environment variables are needed when building and deploying.

## Code map

- [app/page.tsx](app/page.tsx): session handling and journal interactions.
- [components/journal](components/journal): monthly tracker, daily checklist, and goals.
- [components/auth/Auth.tsx](components/auth/Auth.tsx): signup and sign-in.
- [lib/api.ts](lib/api.ts): Supabase reads and writes.
- [lib/types.ts](lib/types.ts): journal data types.
- [docs](docs): implementation notes and walkthroughs.

There is no automated test script in `package.json`. A useful manual check is to create a habit, toggle a completion, add a monthly goal, and reload to confirm persistence.
