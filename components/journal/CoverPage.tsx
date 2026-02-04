import React from 'react';

export function CoverPage() {
    return (
        <div className="flex h-full flex-col items-center justify-center space-y-8 text-center">
            <div className="border-4 border-double border-stone-800 p-12 dark:border-stone-400">
                <h1 className="font-serif text-6xl font-bold tracking-wider text-stone-900 dark:text-stone-100">
                    JOURNAL
                </h1>
                <div className="my-4 h-1 w-full bg-stone-800 dark:bg-stone-400" />
                <h2 className="font-serif text-2xl italic text-stone-600 dark:text-stone-300">
                    Monthly Tracker
                </h2>
            </div>

            <div className="mt-12 space-y-2 font-serif text-stone-500">
                <p>Belongs to:</p>
                <div className="w-64 border-b-2 border-dashed border-stone-400" />
            </div>

            <div className="absolute bottom-10 text-xs tracking-widest text-stone-400 opacity-50">
                EST. 2026
            </div>
        </div>
    );
}
