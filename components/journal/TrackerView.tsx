'use client';

import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, getDay, isToday } from 'date-fns';
import { clsx } from 'clsx';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { JournalData } from '@/lib/types';

interface TrackerViewProps {
    currentDate: Date;
    onMonthChange: (date: Date) => void;
    selectedDate: string;
    onSelectDate: (date: string) => void;
    data: JournalData;
    onAddHabit: (habit: { name: string; color: string }) => void;
}

export function TrackerView({ currentDate, onMonthChange, selectedDate, onSelectDate, data, onAddHabit }: TrackerViewProps) {
    const [newHabitName, setNewHabitName] = useState('');
    
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const startDayOfWeek = getDay(monthStart);

    const activeHabits = data.habits.filter(h => !h.archivedAt);
    
    // Helper to format Date to YYYY-MM-DD
    const formatDateKey = (d: Date) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const r = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${r}`;
    };

    const todayStr = formatDateKey(new Date());

    // Calculate score on a given date (completions count)
    const getDayScore = (dateKey: string) => {
        return data.completions.filter(c => c.date === dateKey && activeHabits.some(h => h.id === c.habitId)).length;
    };

    // Calculate stats
    const totalDays = daysInMonth.length;
    const totalPossible = totalDays * activeHabits.length;
    
    const monthDaysKeys = daysInMonth.map(d => formatDateKey(d));
    const totalDone = data.completions.filter(
        c => monthDaysKeys.includes(c.date) && activeHabits.some(h => h.id === c.habitId)
    ).length;

    const perfectDays = monthDaysKeys.filter(
        d => getDayScore(d) === activeHabits.length && activeHabits.length > 0
    ).length;

    const monthPct = totalPossible ? Math.round((totalDone / totalPossible) * 100) : 0;

    const WEEK_DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    return (
        <div className="space-y-6">
            {/* Top title bar */}
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold font-serif text-stone-900 dark:text-stone-100">
                    Lock-in Tracker
                </h2>
                <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-850 px-2.5 py-1 rounded-full">
                    {monthPct}% this month
                </span>
            </div>

            {/* Quick help note */}
            <p className="text-xs text-stone-500 dark:text-stone-450 -mt-3">
                Tap a day on the calendar, then check off what you completed on the right page. Saved automatically.
            </p>

            {/* Summary cards */}
            <div className="grid grid-cols-3 gap-3">
                <div className="bg-stone-100 dark:bg-stone-950/40 p-4 rounded-xl border border-stone-200 dark:border-stone-850 text-center md:text-left">
                    <div className="text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Perfect Days</div>
                    <div className="text-2xl font-bold text-stone-800 dark:text-stone-100 mt-1">{perfectDays}</div>
                </div>
                <div className="bg-stone-100 dark:bg-stone-950/40 p-4 rounded-xl border border-stone-200 dark:border-stone-850 text-center md:text-left">
                    <div className="text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Checks Logged</div>
                    <div className="text-2xl font-bold text-stone-800 dark:text-stone-100 mt-1">{totalDone}</div>
                </div>
                <div className="bg-stone-100 dark:bg-stone-950/40 p-4 rounded-xl border border-stone-200 dark:border-stone-850 text-center md:text-left">
                    <div className="text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Total Possible</div>
                    <div className="text-2xl font-bold text-stone-800 dark:text-stone-100 mt-1">{totalPossible}</div>
                </div>
            </div>

            {/* Month selector nav */}
            <div className="flex items-center justify-between border-t border-stone-200 dark:border-stone-850 pt-4">
                <button
                    onClick={() => onMonthChange(subMonths(currentDate, 1))}
                    className="rounded-lg p-1.5 border border-stone-300 dark:border-stone-750 hover:bg-stone-50 dark:hover:bg-stone-850 transition-colors"
                >
                    <ChevronLeft size={16} className="text-stone-600 dark:text-stone-400" />
                </button>
                <span className="font-semibold text-stone-800 dark:text-stone-200 text-sm">
                    {format(currentDate, 'MMMM yyyy')}
                </span>
                <button
                    onClick={() => onMonthChange(addMonths(currentDate, 1))}
                    className="rounded-lg p-1.5 border border-stone-300 dark:border-stone-750 hover:bg-stone-50 dark:hover:bg-stone-850 transition-colors"
                >
                    <ChevronRight size={16} className="text-stone-600 dark:text-stone-400" />
                </button>
            </div>

            {/* Calendar Card */}
            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 p-4 rounded-2xl shadow-sm">
                <div className="grid grid-cols-7 gap-2 text-center text-xs text-stone-400 font-bold dark:text-stone-600 mb-2">
                    {WEEK_DAYS.map(wd => (
                        <div key={wd}>{wd}</div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: startDayOfWeek }).map((_, i) => (
                        <div key={`pad-${i}`} className="aspect-square" />
                    ))}
                    {daysInMonth.map((day, i) => {
                        const dateKey = formatDateKey(day);
                        const score = getDayScore(dateKey);
                        const ratio = activeHabits.length ? score / activeHabits.length : 0;
                        const isTodayDate = dateKey === todayStr;
                        const isSelected = dateKey === selectedDate;

                        // Shading based on ratio (standard alpha step logic from the user prompt)
                        const bgStyle = ratio === 0 
                            ? {} 
                            : { backgroundColor: `rgba(29, 158, 117, ${0.15 + ratio * 0.7})` };

                        return (
                            <button
                                key={dateKey}
                                onClick={() => onSelectDate(dateKey)}
                                style={bgStyle}
                                className={clsx(
                                    "aspect-square flex flex-col items-center justify-center rounded-xl border text-xs transition-all relative",
                                    isSelected 
                                        ? "border-2 border-indigo-600 dark:border-indigo-400 ring-2 ring-indigo-600/20" 
                                        : isTodayDate
                                            ? "border-1.5 border-stone-400 dark:border-stone-650"
                                            : "border border-stone-200 dark:border-stone-800",
                                    ratio === 0 ? "bg-white dark:bg-stone-900" : "",
                                    ratio > 0.5 ? "text-stone-900 font-bold" : "text-stone-700 dark:text-stone-300"
                                )}
                            >
                                <span className={clsx(isTodayDate && "underline font-semibold")}>{i + 1}</span>
                                {score > 0 && (
                                    <span className="text-[9px] mt-0.5 text-emerald-800 dark:text-emerald-400">
                                        {score}/{activeHabits.length}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Habit Quick Adder inside Left Column */}
            <div className="flex items-center gap-2 border-t border-stone-200 dark:border-stone-850 pt-4">
                <input
                    className="flex-1 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-stone-400 dark:focus:ring-stone-600 text-stone-900 dark:text-stone-100"
                    placeholder="New Habit..."
                    value={newHabitName}
                    onChange={e => setNewHabitName(e.target.value)}
                    onKeyDown={e => {
                        if (e.key === 'Enter' && newHabitName.trim()) {
                            onAddHabit({ name: newHabitName.trim(), color: '#1D9E75' });
                            setNewHabitName('');
                        }
                    }}
                />
                <button
                    onClick={() => {
                        if (newHabitName.trim()) {
                            onAddHabit({ name: newHabitName.trim(), color: '#1D9E75' });
                            setNewHabitName('');
                        }
                    }}
                    className="p-2 rounded-lg bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-stone-200 text-white dark:text-stone-900"
                >
                    <Plus size={16} />
                </button>
            </div>
        </div>
    );
}
