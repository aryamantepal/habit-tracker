'use client';

import React from 'react';
import { twMerge } from 'tailwind-merge';

interface NotebookLayoutProps {
    leftPage: React.ReactNode;
    rightPage: React.ReactNode;
    className?: string;
}

export function NotebookLayout({ leftPage, rightPage, className }: NotebookLayoutProps) {
    return (
        <div className={twMerge("flex min-h-screen items-center justify-center bg-stone-100 p-4 dark:bg-stone-950", className)}>
            <div
                className="relative flex h-[800px] w-full max-w-6xl overflow-hidden rounded-2xl shadow-xl bg-white border border-stone-200 dark:bg-stone-900 dark:border-stone-800"
            >
                {/* Left Page */}
                <div className="relative z-0 flex w-1/2 flex-col border-r border-stone-200 px-8 py-10 text-stone-900 dark:border-stone-800 dark:text-stone-100">
                    <div className="h-full overflow-y-auto pr-2 custom-scrollbar">
                        {leftPage}
                    </div>
                </div>

                {/* Right Page */}
                <div className="relative z-0 flex w-1/2 flex-col px-8 py-10 text-stone-900 dark:text-stone-100">
                    <div className="h-full overflow-y-auto pr-2 custom-scrollbar">
                        {rightPage}
                    </div>
                </div>
            </div>
        </div>
    );
}

