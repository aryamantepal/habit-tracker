'use client';

import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, getDay, isToday } from 'date-fns';
import { clsx } from 'clsx';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { JournalData, PRESET_COLORS } from '@/lib/types';

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
    const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0].hex);
    
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
                <h2 className="text-xl font-bold font-serif text-stone-800">
                    Lock-in Tracker
                </h2>
                <span className="text-xs font-semibold text-[#4f6b56] bg-[#eef2ec] px-2.5 py-1 rounded-full">
                    {monthPct}% this month
                </span>
            </div>

            {/* Quick help note */}
            <p className="text-xs text-stone-500 -mt-3">
                Tap a day on the calendar, then check off what you completed on the right page. Saved automatically.
            </p>

            {/* Summary cards */}
            <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#faf9f5] p-4 rounded-2xl border border-[#ebe8df] text-center md:text-left">
                    <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Perfect Days</div>
                    <div className="text-2xl font-bold text-stone-800 mt-1">{perfectDays}</div>
                </div>
                <div className="bg-[#faf9f5] p-4 rounded-2xl border border-[#ebe8df] text-center md:text-left">
                    <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Checks Logged</div>
                    <div className="text-2xl font-bold text-stone-800 mt-1">{totalDone}</div>
                </div>
                <div className="bg-[#faf9f5] p-4 rounded-2xl border border-[#ebe8df] text-center md:text-left">
                    <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Total Possible</div>
                    <div className="text-2xl font-bold text-stone-800 mt-1">{totalPossible}</div>
                </div>
            </div>

            {/* Month selector nav */}
            <div className="flex items-center justify-between border-t border-[#ebe8df] pt-4">
                <button
                    onClick={() => onMonthChange(subMonths(currentDate, 1))}
                    className="rounded-lg p-1.5 border border-[#e0ddd2] hover:bg-[#eef2ec] transition-colors"
                >
                    <ChevronLeft size={16} className="text-stone-500" />
                </button>
                <span className="font-semibold text-stone-700 text-sm">
                    {format(currentDate, 'MMMM yyyy')}
                </span>
                <button
                    onClick={() => onMonthChange(addMonths(currentDate, 1))}
                    className="rounded-lg p-1.5 border border-[#e0ddd2] hover:bg-[#eef2ec] transition-colors"
                >
                    <ChevronRight size={16} className="text-stone-500" />
                </button>
            </div>

            {/* Calendar Card */}
            <div className="bg-white border border-[#ebe8df] p-4 rounded-2xl shadow-sm">
                <div className="grid grid-cols-7 gap-2 text-center text-xs text-stone-400 font-bold mb-2">
                    {WEEK_DAYS.map((wd, idx) => (
                        <div key={`${wd}-${idx}`}>{wd}</div>
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

                        // Sage shading: more completed habits => deeper sage fill
                        const bgStyle = ratio === 0
                            ? {}
                            : { backgroundColor: `rgba(111, 141, 118, ${0.15 + ratio * 0.65})` };

                        return (
                            <button
                                key={dateKey}
                                onClick={() => onSelectDate(dateKey)}
                                style={bgStyle}
                                className={clsx(
                                    "aspect-square flex flex-col items-center justify-center rounded-xl border text-xs transition-all relative",
                                    isSelected
                                        ? "border-2 border-[#6f8d76] ring-2 ring-[#6f8d76]/20"
                                        : isTodayDate
                                            ? "border-[1.5px] border-stone-400"
                                            : "border border-[#ebe8df]",
                                    ratio === 0 ? "bg-white" : "",
                                    ratio > 0.5 ? "text-white font-bold" : "text-stone-600"
                                )}
                            >
                                <span className={clsx(isTodayDate && "underline font-semibold")}>{i + 1}</span>
                                {score > 0 && (
                                    <span className={clsx("text-[9px] mt-0.5", ratio > 0.5 ? "text-white/90" : "text-[#4f6b56]")}>
                                        {score}/{activeHabits.length}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Habit Quick Adder inside Left Column */}
            <div className="flex flex-col gap-2 border-t border-[#ebe8df] pt-4">
                <div className="flex items-center gap-2">
                    <input
                        className="flex-1 rounded-xl border border-[#e0ddd2] bg-[#faf9f5] px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#a9c0ab] text-stone-800"
                        placeholder="New Habit..."
                        value={newHabitName}
                        onChange={e => setNewHabitName(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Enter' && newHabitName.trim()) {
                                onAddHabit({ name: newHabitName.trim(), color: selectedColor });
                                setNewHabitName('');
                            }
                        }}
                    />
                    <button
                        onClick={() => {
                            if (newHabitName.trim()) {
                                onAddHabit({ name: newHabitName.trim(), color: selectedColor });
                                setNewHabitName('');
                            }
                        }}
                        className="p-2 rounded-xl bg-[#6f8d76] hover:bg-[#5e7a65] text-white transition-colors"
                    >
                        <Plus size={16} />
                    </button>
                </div>
                {/* Preset Color Swatches */}
                <div className="flex gap-2 justify-center py-1">
                    {PRESET_COLORS.map(c => (
                        <button
                            key={c.hex}
                            type="button"
                            onClick={() => setSelectedColor(c.hex)}
                            style={{ backgroundColor: c.hex }}
                            className={clsx(
                                "w-4 h-4 rounded-full border border-[#e0ddd2] transition-transform focus:outline-none",
                                selectedColor === c.hex ? "scale-125 ring-2 ring-[#6f8d76] ring-offset-2 ring-offset-white" : "hover:scale-110"
                            )}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
