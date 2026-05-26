'use client';

import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, getDay, isToday } from 'date-fns';
import { clsx } from 'clsx';
import { Check, Plus, X, ChevronLeft, ChevronRight, Archive, RotateCcw, Flame, Award } from 'lucide-react';
import { JournalData, HabitDefinition, Completion } from '@/lib/types';

interface TrackerViewProps {
    currentDate: Date;
    onMonthChange: (date: Date) => void;
    data: JournalData;
    onToggleCompletion: (habitId: string, date: string) => void;
    onAddHabit: (habit: Omit<HabitDefinition, 'id' | 'createdAt' | 'archivedAt'>) => void;
    onUpdateHabit: (id: string, updates: Partial<HabitDefinition>) => void;
    onDeleteHabit: (id: string) => void;
}

// Robust local date streak calculator
const calculateStreak = (habitId: string, completions: Completion[]): number => {
    const completedDates = new Set(
        completions.filter(c => c.habitId === habitId).map(c => c.date)
    );
    
    let streak = 0;
    const checkDate = new Date();
    
    const formatDate = (d: Date) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const r = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${r}`;
    };

    const todayStr = formatDate(checkDate);
    
    if (completedDates.has(todayStr)) {
        streak = 1;
        checkDate.setDate(checkDate.getDate() - 1);
        while (completedDates.has(formatDate(checkDate))) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
        }
    } else {
        checkDate.setDate(checkDate.getDate() - 1);
        if (completedDates.has(formatDate(checkDate))) {
            streak = 1;
            checkDate.setDate(checkDate.getDate() - 1);
            while (completedDates.has(formatDate(checkDate))) {
                streak++;
                checkDate.setDate(checkDate.getDate() - 1);
            }
        }
    }
    return streak;
};

// Monthly completion rate calculator
const calculateMonthlyRate = (habitId: string, completions: Completion[], currentDate: Date): number => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    const monthStr = format(currentDate, 'yyyy-MM');
    const completionsInMonth = completions.filter(
        c => c.habitId === habitId && c.date.startsWith(monthStr)
    ).length;
    
    return days.length > 0 ? Math.round((completionsInMonth / days.length) * 100) : 0;
};

export function TrackerView({ currentDate, onMonthChange, data, onToggleCompletion, onAddHabit, onUpdateHabit, onDeleteHabit }: TrackerViewProps) {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const startDayOfWeek = getDay(monthStart);

    const [newHabitName, setNewHabitName] = useState('');
    const [editingHabit, setEditingHabit] = useState<string | null>(null);
    const [editName, setEditName] = useState('');

    const activeHabits = data.habits.filter(h => !h.archivedAt);
    const archivedHabits = data.habits.filter(h => h.archivedAt);

    const todayKey = format(new Date(), 'yyyy-MM-dd');

    const startEditing = (habit: HabitDefinition) => {
        setEditingHabit(habit.id);
        setEditName(habit.name);
    }

    const saveEditing = (id: string) => {
        if (editName.trim()) {
            onUpdateHabit(id, { name: editName.trim() });
        }
        setEditingHabit(null);
    }

    const WEEK_DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    return (
        <div className="h-full flex flex-col justify-between space-y-6">
            <div className="flex-1 flex flex-col min-h-0 space-y-6">
                {/* Header */}
                <header className="flex items-center justify-between border-b border-stone-200 dark:border-stone-850 pb-3">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onMonthChange(subMonths(currentDate, 1))}
                            className="rounded-lg p-1 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-400"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <h2 className="font-serif text-xl font-bold text-stone-900 dark:text-stone-100">
                            {format(currentDate, 'MMMM yyyy')}
                        </h2>
                        <button
                            onClick={() => onMonthChange(addMonths(currentDate, 1))}
                            className="rounded-lg p-1 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-400"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>

                    {/* Habit Quick Adder */}
                    <div className="flex items-center gap-1.5">
                        <input
                            className="w-32 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 px-2.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-stone-400 dark:focus:ring-stone-600 text-stone-900 dark:text-stone-100"
                            placeholder="Add habit..."
                            value={newHabitName}
                            onChange={e => setNewHabitName(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Enter' && newHabitName.trim()) {
                                    onAddHabit({ name: newHabitName.trim(), color: 'stone' });
                                    setNewHabitName('');
                                }
                            }}
                        />
                        <button
                            onClick={() => {
                                if (newHabitName.trim()) {
                                    onAddHabit({ name: newHabitName.trim(), color: 'stone' });
                                    setNewHabitName('');
                                }
                            }}
                            className="p-1 rounded-lg bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-stone-250 text-white dark:text-stone-950"
                        >
                            <Plus size={14} />
                        </button>
                    </div>
                </header>

                {activeHabits.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <p className="text-sm font-medium text-stone-400 italic mb-1">No active habits yet.</p>
                        <p className="text-xs text-stone-500">Create one in the top right to start tracking!</p>
                    </div>
                ) : (
                    <div className="space-y-6 overflow-y-auto pr-1 custom-scrollbar">
                        {/* 1. Today's Checkoff (Top Touch Target Area) */}
                        <section className="bg-stone-50 dark:bg-stone-950/40 p-4 rounded-xl border border-stone-200 dark:border-stone-850">
                            <h3 className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-3">Today's Checklist</h3>
                            <div className="space-y-2">
                                {activeHabits.map(habit => {
                                    const isDoneToday = data.completions.some(c => c.habitId === habit.id && c.date === todayKey);
                                    const streak = calculateStreak(habit.id, data.completions);
                                    const rate = calculateMonthlyRate(habit.id, data.completions, currentDate);

                                    return (
                                        <div 
                                            key={`today-${habit.id}`}
                                            className="flex items-center justify-between bg-white dark:bg-stone-900 p-3 rounded-lg border border-stone-150 dark:border-stone-800 shadow-sm"
                                        >
                                            <div className="flex flex-col min-w-0 pr-2">
                                                <span className="font-semibold text-stone-800 dark:text-stone-150 text-sm truncate">{habit.name}</span>
                                                <div className="flex items-center gap-3 mt-1 text-[11px] text-stone-500 dark:text-stone-450">
                                                    <span className="flex items-center gap-0.5 text-amber-600 dark:text-amber-500">
                                                        <Flame size={12} className="fill-current" /> {streak}d streak
                                                    </span>
                                                    <span className="flex items-center gap-0.5 text-stone-500">
                                                        <Award size={12} /> {rate}% completion
                                                    </span>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => onToggleCompletion(habit.id, todayKey)}
                                                className={clsx(
                                                    "h-10 w-10 flex items-center justify-center rounded-xl border-2 transition-all duration-150 active:scale-95",
                                                    isDoneToday
                                                        ? "border-stone-900 bg-stone-900 text-white dark:border-stone-100 dark:bg-stone-100 dark:text-stone-950"
                                                        : "border-stone-300 dark:border-stone-700 hover:border-stone-400 dark:hover:border-stone-500 bg-transparent"
                                                )}
                                            >
                                                <Check size={20} className={clsx("transition-transform", isDoneToday ? "scale-100" : "scale-0")} />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>

                        {/* 2. Monthly Consistency Day-Grids */}
                        <section className="space-y-4">
                            <h3 className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Monthly Consistency</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {activeHabits.map(habit => {
                                    const streak = calculateStreak(habit.id, data.completions);
                                    const rate = calculateMonthlyRate(habit.id, data.completions, currentDate);

                                    return (
                                        <div 
                                            key={`grid-${habit.id}`}
                                            className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-850 shadow-sm flex flex-col justify-between"
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="min-w-0 pr-2">
                                                    {editingHabit === habit.id ? (
                                                        <input
                                                            autoFocus
                                                            className="bg-transparent border-b border-stone-400 focus:outline-none font-semibold text-stone-900 dark:text-stone-100 text-sm w-full"
                                                            value={editName}
                                                            onChange={e => setEditName(e.target.value)}
                                                            onBlur={() => saveEditing(habit.id)}
                                                            onKeyDown={e => {
                                                                if (e.key === 'Enter') saveEditing(habit.id);
                                                            }}
                                                        />
                                                    ) : (
                                                        <h4 
                                                            className="font-semibold text-stone-850 dark:text-stone-100 text-sm truncate cursor-pointer hover:underline"
                                                            onDoubleClick={() => startEditing(habit)}
                                                            title="Double click to edit"
                                                        >
                                                            {habit.name}
                                                        </h4>
                                                    )}
                                                    <div className="flex gap-2 text-[10px] text-stone-500 mt-0.5">
                                                        <span>🔥 {streak}d</span>
                                                        <span>🎯 {rate}%</span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => {
                                                            if (confirm(`Archive ${habit.name}? History logs will be preserved.`)) {
                                                                onUpdateHabit(habit.id, { archivedAt: new Date().toISOString() });
                                                            }
                                                        }}
                                                        className="p-1 hover:text-amber-600 text-stone-400 dark:text-stone-600 transition-colors"
                                                        title="Archive"
                                                    >
                                                        <Archive size={13} />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            if (confirm(`Permanently delete ${habit.name}?`)) {
                                                                onDeleteHabit(habit.id);
                                                            }
                                                        }}
                                                        className="p-1 hover:text-red-650 text-stone-400 dark:text-stone-600 transition-colors"
                                                        title="Delete"
                                                    >
                                                        <X size={13} />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Interactive Day Grid */}
                                            <div className="grid grid-cols-7 gap-1 text-[9px] font-mono text-center">
                                                {WEEK_DAYS.map(wd => (
                                                    <div key={wd} className="text-stone-400 dark:text-stone-600 font-bold mb-1">{wd}</div>
                                                ))}
                                                {Array.from({ length: startDayOfWeek }).map((_, i) => (
                                                    <div key={`empty-${i}`} className="aspect-square" />
                                                ))}
                                                {daysInMonth.map(day => {
                                                    const dateKey = format(day, 'yyyy-MM-dd');
                                                    const isCompleted = data.completions.some(c => c.habitId === habit.id && c.date === dateKey);
                                                    const isFuture = day > new Date();
                                                    const isTodayDate = isToday(day);

                                                    return (
                                                        <button
                                                            key={dateKey}
                                                            onClick={() => {
                                                                if (!isFuture) {
                                                                    onToggleCompletion(habit.id, dateKey);
                                                                }
                                                            }}
                                                            disabled={isFuture}
                                                            className={clsx(
                                                                "aspect-square flex flex-col items-center justify-center rounded-md border text-[9px] transition-all",
                                                                isCompleted
                                                                    ? "bg-stone-900 border-stone-900 text-white dark:bg-stone-100 dark:border-stone-100 dark:text-stone-950 font-bold"
                                                                    : "border-stone-150 dark:border-stone-800 text-stone-600 dark:text-stone-450 hover:bg-stone-50 dark:hover:bg-stone-850",
                                                                isTodayDate && !isCompleted && "ring-1.5 ring-stone-900 dark:ring-stone-100 font-bold",
                                                                isFuture && "opacity-20 cursor-not-allowed bg-stone-50/50 dark:bg-stone-950/20 border-stone-150 dark:border-stone-900"
                                                            )}
                                                            title={isFuture ? `${format(day, 'MMM d')} (Future)` : format(day, 'MMM d')}
                                                        >
                                                            {format(day, 'd')}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    </div>
                )}
            </div>

            {/* Archived Habits List */}
            {archivedHabits.length > 0 && (
                <div className="pt-4 border-t border-stone-200 dark:border-stone-800">
                    <h3 className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-2">Archived Habits</h3>
                    <div className="flex flex-wrap gap-2">
                        {archivedHabits.map(habit => (
                            <div key={habit.id} className="flex items-center gap-1.5 bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 px-2.5 py-1 rounded-full text-xs">
                                <span className="text-stone-600 dark:text-stone-400">{habit.name}</span>
                                <button
                                    onClick={() => onUpdateHabit(habit.id, { archivedAt: null })}
                                    className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
                                    title="Restore Habit"
                                >
                                    <RotateCcw size={11} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
