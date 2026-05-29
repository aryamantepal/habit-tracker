import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Privacy Policy — Lock-in Tracker',
    description: 'What Lock-in Tracker stores and how your data is handled.',
};

export default function PrivacyPage() {
    return (
        <main className="min-h-screen bg-[#f4f3ee] text-stone-700 px-4 py-12">
            <div className="mx-auto w-full max-w-2xl bg-white border border-[#e7e4da] rounded-3xl shadow-[0_8px_40px_rgba(99,110,93,0.12)] p-8 sm:p-10">
                <h1 className="text-3xl font-serif font-bold text-stone-800 mb-1">Privacy Policy</h1>
                <p className="text-xs text-stone-400 uppercase tracking-wider mb-8">Last updated May 29, 2026</p>

                <div className="space-y-6 text-sm leading-relaxed">
                    <section>
                        <p>
                            Lock-in Tracker is a personal habit-tracking app. This page explains
                            what it stores and how that information is handled. It is written plainly
                            and reflects how the app actually works.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-base font-semibold text-stone-800 mb-2">What is stored</h2>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Your <strong>email address</strong>, used only to sign you in.</li>
                            <li>The <strong>habits</strong> you create (name and color).</li>
                            <li>Your <strong>daily completions</strong> (which habit you checked off on which date).</li>
                            <li>Your <strong>monthly goals</strong>.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-base font-semibold text-stone-800 mb-2">How it is used</h2>
                        <p>
                            Your data is used solely to provide the app: to show your calendar,
                            streaks, and stats, and to sync them across your devices. It is not sold,
                            shared, or used for advertising. There is no third-party analytics or
                            tracking.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-base font-semibold text-stone-800 mb-2">Where it is stored</h2>
                        <p>
                            Data is stored in a Postgres database hosted by{' '}
                            <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[#6f8d76] hover:underline">Supabase</a>,
                            which also handles authentication. Every row is tied to your account, and
                            database-level Row-Level Security ensures you can only ever read or modify
                            your own data. The app is hosted on Vercel.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-base font-semibold text-stone-800 mb-2">Data retention and deletion</h2>
                        <p>
                            Your data is kept for as long as your account exists. To have your account
                            and all associated data permanently deleted, email the address below and it
                            will be removed.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-base font-semibold text-stone-800 mb-2">Contact</h2>
                        <p>
                            Questions or deletion requests:{' '}
                            <a href="mailto:atepal@umass.edu" className="text-[#6f8d76] hover:underline">atepal@umass.edu</a>
                        </p>
                    </section>
                </div>

                <div className="mt-10 pt-6 border-t border-[#ebe8df]">
                    <Link href="/" className="text-sm text-[#6f8d76] hover:underline">&larr; Back to app</Link>
                </div>
            </div>
        </main>
    );
}
