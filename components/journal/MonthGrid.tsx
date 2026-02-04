'use client';

import React from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from 'date-fns';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { JournalData } from '@/lib/types';

interface MonthGridProps {
    currentDate: Date;
    onSelectDay: (date: Date) => void;
    data?: JournalData;
}

export function MonthGrid({ currentDate, onSelectDay, data }: MonthGridProps) {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    return (
        <div className="h-full">
            <header className="mb-8 flex items-baseline justify-between border-b-2 border-stone-300 pb-4 dark:border-stone-700">
                <h2 className="font-serif text-4xl font-bold text-stone-800 dark:text-stone-100">
                    {format(currentDate, 'MMMM')}
                </h2>
                <span className="font-serif text-xl text-stone-500">{format(currentDate, 'yyyy')}</span>
            </header>

            <div className="grid grid-cols-7 gap-4">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
                    <div key={day} className="text-center font-serif text-sm font-bold text-stone-400">
                        {day}
                    </div>
                ))}

                {days.map((day, idx) => {
                    // Check simple consistency (mock logic for now: random check if no data)
                    const dayKey = format(day, 'yyyy-MM-dd');
                    // For now, let's just show the grid. We can hook up consistency dots later.

                    return (
                        <motion.button
                            key={day.toString()}
                            whileHover={{ scale: 1.1, rotate: -2 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onSelectDay(day)}
                            className={clsx(
                                "group relative flex aspect-square flex-col items-center justify-center rounded-lg border border-stone-200 bg-white p-2 shadow-sm transition-colors hover:border-stone-400 hover:shadow-md dark:border-stone-700 dark:bg-stone-800/50",
                                isToday(day) && "ring-2 ring-stone-900 dark:ring-stone-100",
                                !isSameMonth(day, currentDate) && "opacity-30"
                            )}
                        >
                            <span className={clsx(
                                "font-serif text-lg font-medium text-stone-700 dark:text-stone-300",
                                isToday(day) && "font-bold"
                            )}>
                                {format(day, 'd')}
                            </span>

                            {/* Consistency Dots (Placeholder) */}
                            <div className="mt-1 flex gap-0.5">
                                {/* Provide visual hints of logged info */}
                                <div className="h-1 w-1 rounded-full bg-stone-200 dark:bg-stone-600" />
                                <div className="h-1 w-1 rounded-full bg-stone-200 dark:bg-stone-600" />
                            </div>
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
}
