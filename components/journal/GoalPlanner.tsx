'use client';

import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { clsx } from 'clsx';
import { Check, Plus, Trash2, Archive, RotateCcw, Pencil } from 'lucide-react';
import { Goal, HabitDefinition, Completion, JournalData, PRESET_COLORS, getHabitColorHex } from '@/lib/types';

interface GoalPlannerProps {
    selectedDate: string;
    data: JournalData;
    onToggleCompletion: (habitId: string, date: string) => void;
    onUpdateHabit: (id: string, updates: Partial<HabitDefinition>) => void;
    onDeleteHabit: (id: string) => void;
    onAddHabit: (habit: { name: string; color: string }) => void;
    goals: Goal[];
    onAddGoal: (title: string) => void;
    onToggleGoal: (id: string) => void;
    onDeleteGoal: (id: string) => void;
    onEditGoal: (id: string, newTitle: string) => void;
}

// Streak Calculator
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

export function GoalPlanner({
    selectedDate,
    data,
    onToggleCompletion,
    onUpdateHabit,
    onDeleteHabit,
    onAddHabit,
    goals,
    onAddGoal,
    onToggleGoal,
    onDeleteGoal,
    onEditGoal
}: GoalPlannerProps) {
    const [newGoalTitle, setNewGoalTitle] = useState('');
    const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
    const [editGoalTitle, setEditGoalTitle] = useState('');
    const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
    const [editHabitName, setEditHabitName] = useState('');
    const [newHabitName, setNewHabitName] = useState('');

    const activeHabits = data.habits.filter((h: HabitDefinition) => !h.archivedAt);
    const archivedHabits = data.habits.filter((h: HabitDefinition) => h.archivedAt);

    // Format selected date nicely
    const getSelectedDateLabel = () => {
        try {
            const date = new Date(selectedDate + "T00:00:00");
            return format(date, "EEEE, MMM d, yyyy");
        } catch (e) {
            return "Select a day";
        }
    };

    // Calculate completions in current month
    const currentDate = new Date(selectedDate + "T00:00:00");
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const totalDays = daysInMonth.length;
    const monthStr = selectedDate.slice(0, 7); // YYYY-MM

    const getHabitMonthCompletions = (habitId: string) => {
        return data.completions.filter((c: Completion) => c.habitId === habitId && c.date.startsWith(monthStr)).length;
    };

    const handleAddGoalSubmit = () => {
        if (newGoalTitle.trim()) {
            onAddGoal(newGoalTitle.trim());
            setNewGoalTitle('');
        }
    };

    const startEditingGoal = (goal: Goal) => {
        setEditingGoalId(goal.id);
        setEditGoalTitle(goal.title);
    };

    const saveGoalEdit = (id: string) => {
        if (editGoalTitle.trim()) {
            onEditGoal(id, editGoalTitle.trim());
        }
        setEditingGoalId(null);
    };

    const startEditingHabit = (habit: HabitDefinition) => {
        setEditingHabitId(habit.id);
        setEditHabitName(habit.name);
    };

    const saveHabitEdit = (id: string) => {
        if (editHabitName.trim()) {
            onUpdateHabit(id, { name: editHabitName.trim() });
        }
        setEditingHabitId(null);
    };

    const handleInlineAddHabit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newHabitName.trim()) {
            const nextColor = PRESET_COLORS[activeHabits.length % PRESET_COLORS.length].hex;
            onAddHabit({ name: newHabitName.trim(), color: nextColor });
            setNewHabitName('');
        }
    };

    const isFutureSelected = new Date(selectedDate + "T00:00:00") > new Date();

    return (
        <div className="space-y-6">
            {/* 1. Day Check-off Checklist */}
            <div className="bg-stone-50 dark:bg-stone-950/40 border border-stone-200 dark:border-stone-850 p-5 rounded-2xl">
                <div className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-3">
                    {getSelectedDateLabel()}
                </div>

                {isFutureSelected && (
                    <div className="mb-3 text-xs text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg px-3 py-2">
                        You can&apos;t check off habits for a future date. Pick today or a past day.
                    </div>
                )}

                {activeHabits.length === 0 ? (
                    <div className="text-center py-6">
                        <p className="text-xs text-stone-500 italic">No habits added yet. Type a habit below to get started!</p>
                    </div>
                ) : (
                    <div className="space-y-2 mb-4">
                        {activeHabits.map((habit: HabitDefinition) => {
                            const isDone = data.completions.some(
                                (c: Completion) => c.habitId === habit.id && c.date === selectedDate
                            );
                            const habitColor = getHabitColorHex(habit.color);

                            return (
                                <div
                                    key={habit.id}
                                    style={{
                                        borderColor: isDone ? habitColor : undefined,
                                        backgroundColor: isDone ? `${habitColor}1a` : undefined
                                    }}
                                    className={clsx(
                                        "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all border",
                                        isDone 
                                            ? "border-2" 
                                            : "border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-stone-300 dark:hover:border-stone-750",
                                        isFutureSelected && "opacity-40"
                                    )}
                                >
                                    {editingHabitId === habit.id ? (
                                        <div className="flex flex-col gap-2 w-full pr-2" onClick={e => e.stopPropagation()}>
                                            <input
                                                autoFocus
                                                value={editHabitName}
                                                onChange={e => setEditHabitName(e.target.value)}
                                                onKeyDown={e => {
                                                    if (e.key === 'Enter') saveHabitEdit(habit.id);
                                                    if (e.key === 'Escape') setEditingHabitId(null);
                                                }}
                                                className="bg-white dark:bg-stone-950 border border-stone-300 dark:border-stone-850 px-2.5 py-1.5 rounded-lg focus:outline-none text-stone-900 dark:text-stone-100 font-semibold text-xs w-full"
                                            />
                                            {/* Color swatches in edit mode */}
                                            <div className="flex gap-1.5 items-center mt-1">
                                                {PRESET_COLORS.map(c => (
                                                    <button
                                                        key={`edit-color-${habit.id}-${c.hex}`}
                                                        type="button"
                                                        onClick={() => {
                                                            onUpdateHabit(habit.id, { color: c.hex });
                                                        }}
                                                        style={{ backgroundColor: c.hex }}
                                                        className={clsx(
                                                            "w-4 h-4 rounded-full border border-stone-250 dark:border-stone-800 transition-transform focus:outline-none",
                                                            habitColor === c.hex ? "scale-125 ring-2 ring-indigo-500" : "hover:scale-110"
                                                        )}
                                                    />
                                                ))}
                                            </div>
                                            <div className="flex gap-2 mt-1 text-[10px] font-semibold">
                                                <button onClick={() => saveHabitEdit(habit.id)} className="text-indigo-600 hover:underline">Save</button>
                                                <span className="text-stone-300">|</span>
                                                <button onClick={() => setEditingHabitId(null)} className="text-stone-500 hover:underline">Cancel</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            disabled={isFutureSelected}
                                            onClick={() => onToggleCompletion(habit.id, selectedDate)}
                                            className="flex items-center gap-3 min-w-0 pr-2 flex-1 text-left focus:outline-none group/btn"
                                        >
                                            <span
                                                style={{
                                                    backgroundColor: isDone ? habitColor : 'transparent',
                                                    borderColor: isDone ? habitColor : '#B4B2A9'
                                                }}
                                                className="w-5 h-5 rounded-lg border-2 flex items-center justify-center text-white shrink-0 transition-all group-hover/btn:scale-105"
                                            >
                                                {isDone && <Check size={12} className="stroke-[3.5]" />}
                                            </span>
                                            <span 
                                                onDoubleClick={(e) => {
                                                    e.stopPropagation();
                                                    startEditingHabit(habit);
                                                }}
                                                className={clsx(
                                                    "text-sm truncate cursor-pointer hover:underline",
                                                    isDone ? "text-stone-900 dark:text-stone-50 font-bold" : "text-stone-600 dark:text-stone-400 font-medium"
                                                )}
                                                title="Click edit button or double click to edit name"
                                            >
                                                {habit.name}
                                            </span>
                                        </button>
                                    )}

                                    {/* Action Buttons for habit (edit/archive/delete) */}
                                    <div className="flex items-center gap-1.5 shrink-0 ml-2" onClick={e => e.stopPropagation()}>
                                        <button
                                            onClick={() => startEditingHabit(habit)}
                                            className="p-1 hover:text-indigo-650 text-stone-400 dark:text-stone-600 transition-colors"
                                            title="Edit Name & Color"
                                        >
                                            <Pencil size={13} />
                                        </button>
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
                                                if (confirm(`Delete ${habit.name} permanently?`)) {
                                                    onDeleteHabit(habit.id);
                                                }
                                            }}
                                            className="p-1 hover:text-red-650 text-stone-400 dark:text-stone-600 transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 size={13} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Inline Habit Adder */}
                <form onSubmit={handleInlineAddHabit} className="flex items-center gap-2 pt-3 border-t border-stone-200/60 dark:border-stone-800/60 mt-4">
                    <input
                        type="text"
                        placeholder="Add a new habit..."
                        value={newHabitName}
                        onChange={e => setNewHabitName(e.target.value)}
                        className="flex-1 rounded-lg border border-stone-250 dark:border-stone-850 bg-white dark:bg-stone-900 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-stone-400 dark:focus:ring-stone-600 text-stone-900 dark:text-stone-100 font-medium"
                    />
                    <button
                        type="submit"
                        className="px-3 py-1.5 rounded-lg bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-stone-200 text-white dark:text-stone-900 text-xs font-semibold shrink-0 transition-colors"
                    >
                        Add
                    </button>
                </form>
            </div>

            {/* 2. Habit Month Stats */}
            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 p-5 rounded-2xl shadow-sm">
                <div className="text-sm font-semibold text-stone-800 dark:text-stone-200 mb-3">
                    This month by habit
                </div>
                {activeHabits.length === 0 ? (
                    <p className="text-xs text-stone-500 italic text-center py-4">No metrics available.</p>
                ) : (
                    <div className="space-y-4">
                        {activeHabits.map((habit: HabitDefinition) => {
                            const done = getHabitMonthCompletions(habit.id);
                            const streak = calculateStreak(habit.id, data.completions);
                            const pct = totalDays ? Math.round((done / totalDays) * 100) : 0;
                            const habitColor = getHabitColorHex(habit.color);

                            return (
                                <div key={habit.id} className="space-y-1.5">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-medium text-stone-700 dark:text-stone-300">{habit.name}</span>
                                        <span className="text-stone-500 font-mono">
                                            {done}/{totalDays}{streak > 0 ? ` · 🔥 ${streak}d` : ''}
                                        </span>
                                    </div>
                                    <div className="h-2 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                                        <div 
                                            style={{ width: `${pct}%`, backgroundColor: habitColor }} 
                                            className="h-full rounded-full transition-all duration-300"
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* 3. Monthly Goals */}
            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 p-5 rounded-2xl shadow-sm">
                <div className="text-sm font-semibold text-stone-800 dark:text-stone-200 mb-3">
                    Monthly Goals
                </div>
                
                <ul className="space-y-2 mb-4">
                    {goals.map((goal) => (
                        <li key={goal.id} className="group flex items-start gap-2.5 relative">
                            <button
                                onClick={() => onToggleGoal(goal.id)}
                                className={clsx(
                                    "mt-1 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded border transition-all",
                                    goal.completed
                                        ? "border-stone-800 bg-stone-800 text-white dark:border-stone-100 dark:bg-stone-100 dark:text-stone-900"
                                        : "border-stone-400 hover:border-stone-600"
                                )}
                            >
                                {goal.completed && <Check size={12} />}
                            </button>
                            <div className="flex-1 min-w-0">
                                {editingGoalId === goal.id ? (
                                    <input
                                        autoFocus
                                        type="text"
                                        value={editGoalTitle}
                                        onChange={(e) => setEditGoalTitle(e.target.value)}
                                        onBlur={() => saveGoalEdit(goal.id)}
                                        onKeyDown={(e) => e.key === 'Enter' && saveGoalEdit(goal.id)}
                                        className="w-full bg-transparent font-medium text-sm leading-tight focus:outline-none border-b border-stone-400 text-stone-900 dark:text-stone-100"
                                    />
                                ) : (
                                    <p 
                                        onDoubleClick={() => startEditingGoal(goal)}
                                        className={clsx(
                                            "text-sm leading-tight cursor-pointer hover:underline truncate",
                                            goal.completed ? "text-stone-400 line-through" : "text-stone-800 dark:text-stone-200"
                                        )}
                                        title="Double click to edit"
                                    >
                                        {goal.title}
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={() => onDeleteGoal(goal.id)}
                                className="p-0.5 text-stone-400 hover:text-red-500 shrink-0 transition-colors"
                            >
                                <Trash2 size={12} />
                            </button>
                        </li>
                    ))}
                    {goals.length === 0 && (
                        <li className="text-center text-xs text-stone-400 italic py-2">
                            No goals set for this month yet.
                        </li>
                    )}
                </ul>

                {/* Add Goal Input */}
                <div className="flex items-center gap-2 pt-2 border-t border-stone-100 dark:border-stone-850">
                    <input
                        type="text"
                        value={newGoalTitle}
                        onChange={(e) => setNewGoalTitle(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddGoalSubmit()}
                        placeholder="Add goal..."
                        className="flex-1 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-stone-400 dark:focus:ring-stone-600 text-stone-900 dark:text-stone-100"
                    />
                    <button
                        onClick={handleAddGoalSubmit}
                        className="p-1.5 rounded-lg bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-stone-200 text-white dark:text-stone-900"
                    >
                        <Plus size={14} />
                    </button>
                </div>
            </div>

            {/* 4. Archived Habits Panel */}
            {archivedHabits.length > 0 && (
                <div className="bg-stone-50 dark:bg-stone-950/40 border border-stone-200 dark:border-stone-850 p-4 rounded-2xl">
                    <div className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-2">
                        Archived Habits
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {archivedHabits.map((habit: HabitDefinition) => (
                            <div key={habit.id} className="flex items-center gap-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 px-2.5 py-1 rounded-full text-xs shadow-sm">
                                <span className="text-stone-600 dark:text-stone-400 text-xs">{habit.name}</span>
                                <button
                                    onClick={() => onUpdateHabit(habit.id, { archivedAt: null })}
                                    className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
                                    title="Restore"
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
