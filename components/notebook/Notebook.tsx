'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface NotebookLayoutProps {
    leftPage: React.ReactNode;
    rightPage: React.ReactNode;
    className?: string;
}

export function NotebookLayout({ leftPage, rightPage, className }: NotebookLayoutProps) {
    return (
        <div className={twMerge("flex min-h-screen items-center justify-center bg-stone-200 p-4 dark:bg-stone-900", className)}>
            <div className="relative flex h-[800px] w-full max-w-6xl overflow-hidden rounded-r-2xl rounded-l-md bg-[#fdfbf7] shadow-2xl dark:bg-stone-800">

                {/* Binder / Spine */}
                <div className="absolute left-0 top-0 bottom-0 z-20 w-12 bg-gradient-to-r from-stone-800 to-stone-600 shadow-inner">
                    {/* Stitching details could go here */}
                    <div className="flex h-full flex-col justify-between py-8">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="mx-auto h-3 w-3 rounded-full bg-stone-400 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]" />
                        ))}
                    </div>
                </div>

                {/* Paper Texture Overlay (optional) */}
                <div className="pointer-events-none absolute inset-0 z-10 bg-[url('https://www.transparenttextures.com/patterns/paper.png')] opacity-30 mix-blend-multiply" />

                {/* Left Page */}
                <div className="relative z-0 flex w-1/2 flex-col border-r border-stone-300 px-8 py-10 pl-20 text-stone-800 dark:border-stone-700 dark:text-stone-200">
                    <div className="h-full overflow-y-auto pr-2 custom-scrollbar">
                        {leftPage}
                    </div>
                    {/* Page Number / Footer */}
                    <div className="absolute bottom-4 left-20 text-xs text-stone-400 font-serif italic">
                        Notes & Reflections
                    </div>
                </div>

                {/* Right Page */}
                <div className="relative z-0 flex w-1/2 flex-col px-8 py-10 text-stone-800 dark:text-stone-200">
                    <div className="h-full overflow-y-auto pr-2 custom-scrollbar">
                        {rightPage}
                    </div>
                    {/* Page Number / Footer */}
                    <div className="absolute bottom-4 right-8 text-xs text-stone-400 font-serif italic">
                        Daily Log
                    </div>
                </div>

                {/* Center Shadow for depth */}
                <div className="pointer-events-none absolute inset-y-0 left-1/2 w-16 -translate-x-1/2 bg-gradient-to-r from-stone-400/20 via-transparent to-stone-400/20" />

            </div>
        </div>
    );
}
