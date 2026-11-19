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
                <p className="text-xs text-stone-400 uppercase tracking-wider mb-8">Last updated November 19, 2026</p>

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
                            <li>The <strong>habits</strong> you create (name and color).</li>
                            <li>Your <strong>daily completions</strong> (which habit you checked off on which date).</li>
                            <li>Your <strong>monthly goals</strong>.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-base font-semibold text-stone-800 mb-2">Where it is stored</h2>
                        <p>
                            All of it is stored only in this browser&apos;s localStorage, on your own
                            device. Nothing is sent to any server. There are no accounts and no email
                            addresses, and there is no analytics or tracking of any kind.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-base font-semibold text-stone-800 mb-2">Backups and deletion</h2>
                        <p>
                            Because the data lives only in your browser, clearing this site&apos;s data
                            deletes it permanently, and it does not sync to other browsers or devices.
                            To delete your data, clear site data for this site in your browser settings.
                            To keep a copy, use the Export button in the app to download a backup file,
                            and the Import button to restore it.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-base font-semibold text-stone-800 mb-2">Contact</h2>
                        <p>
                            Questions:{' '}
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
