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
        <div className={twMerge("flex min-h-screen items-start md:items-center justify-center bg-[#f4f3ee] p-3 md:p-4", className)}>
            <div
                className="relative flex flex-col md:flex-row md:h-[800px] w-full max-w-6xl overflow-hidden rounded-3xl shadow-[0_8px_40px_rgba(99,110,93,0.12)] bg-white border border-[#e7e4da]"
            >
                {/* Left Page */}
                <div className="relative z-0 flex w-full md:w-1/2 flex-col border-b md:border-b-0 md:border-r border-[#ebe8df] px-5 pt-16 pb-8 md:px-8 md:py-10 text-stone-700">
                    <div className="md:h-full md:overflow-y-auto md:pr-2 custom-scrollbar">
                        {leftPage}
                    </div>
                </div>

                {/* Right Page */}
                <div className="relative z-0 flex w-full md:w-1/2 flex-col px-5 py-8 md:px-8 md:py-10 text-stone-700 bg-[#fbfaf6]">
                    <div className="md:h-full md:overflow-y-auto md:pr-2 custom-scrollbar">
                        {rightPage}
                    </div>
                </div>
            </div>
        </div>
    );
}

