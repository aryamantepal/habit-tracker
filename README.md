This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


## Habit Tracker — Sleek & Fast Consistency Logger

A fast, mobile-first daily habit tracker designed for consistency visualization and cross-device sync. Built with Next.js (App Router), TypeScript, Tailwind CSS, and Supabase.

### Core Features

*   **Fast Daily Check-off**: Big touch targets for toggle actions that feel instant due to optimistic UI updates.
*   **Monthly Calendar Grid**: Day-by-day calendar grid mapping completions for each active habit in the selected month.
*   **Streaks & Rates**: Calculates current active streak count and monthly completion rate dynamically for each habit.
*   **Habit Management**: Add, rename, permanently delete, or archive habits. Archived habits are hidden from the current tracker sheet while preserving historical logs.
*   **Monthly Goals**: Add, edit, complete, or remove high-level goals for each calendar month.
*   **Authentication**: Built-in Email/Password signup/signin and Google OAuth for seamless cross-device synchronization.

### Technical Stack

*   **Framework**: Next.js 16 (App Router, Turbopack)
*   **Database**: Supabase PostgreSQL
*   **Auth**: Supabase GoTrue Auth (Email/Password + Google OAuth)
*   **Styling**: Tailwind CSS v4

---

### Setup Instructions

1.  **Clone & Install Dependencies**:
    ```bash
    npm install
    ```
2.  **Environment Variables**:
    Create a `.env.local` file in the root directory:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```
3.  **Database Migration**:
    Execute the SQL queries in [supabase_schema.sql](file:///Users/aryamantepal/Desktop/habit-tracker/supabase_schema.sql) in your Supabase project's SQL Editor to set up the necessary tables and Row-Level Security (RLS) policies.
4.  **Google OAuth Setup**:
    To enable Google login, configure your Google Credentials in the Supabase Authentication Dashboard under Providers -> Google.
5.  **Run Locally**:
    ```bash
    npm run dev
    ```