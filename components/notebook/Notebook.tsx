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
        <div className={twMerge("flex min-h-screen items-center justify-center bg-[#f4f3ee] p-4", className)}>
            <div
                className="relative flex h-[800px] w-full max-w-6xl overflow-hidden rounded-3xl shadow-[0_8px_40px_rgba(99,110,93,0.12)] bg-white border border-[#e7e4da]"
            >
                {/* Left Page */}
                <div className="relative z-0 flex w-1/2 flex-col border-r border-[#ebe8df] px-8 py-10 text-stone-700">
                    <div className="h-full overflow-y-auto pr-2 custom-scrollbar">
                        {leftPage}
                    </div>
                </div>

                {/* Right Page */}
                <div className="relative z-0 flex w-1/2 flex-col px-8 py-10 text-stone-700 bg-[#fbfaf6]">
                    <div className="h-full overflow-y-auto pr-2 custom-scrollbar">
                        {rightPage}
                    </div>
                </div>
            </div>
        </div>
    );
}

