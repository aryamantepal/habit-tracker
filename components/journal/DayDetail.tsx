'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Check, Plus, Trash2 } from 'lucide-react';
import { clsx } from 'clsx';
import { JournalData, DayLog, HabitDefinition } from '@/lib/types';

interface DayDetailProps {
    date: Date;
    data: JournalData;
    onUpdateDay: (date: string, updates: Partial<DayLog>) => void;
    onAddHabit: (habit: Omit<HabitDefinition, 'id'>) => void;
}

export function DayDetail({ date, data, onUpdateDay, onAddHabit }: DayDetailProps) {
    const dateKey = format(date, 'yyyy-MM-dd');
    const dayLog = data.days[dateKey] || {
        date: dateKey,
        habitsCompleted: [],
        productivity: [],
        highlight: '',
        reflection: ''
    };

    const [highlight, setHighlight] = useState(dayLog.highlight);
    const [reflection, setReflection] = useState(dayLog.reflection);
    const [newHabitName, setNewHabitName] = useState('');

    const handleBlur = () => {
        onUpdateDay(dateKey, { highlight, reflection });
    };

    const toggleHabit = (habitId: string) => {
        const currentCompleted = dayLog.habitsCompleted || [];
        const isCompleted = currentCompleted.includes(habitId);

        let newCompleted;
        if (isCompleted) {
            newCompleted = currentCompleted.filter(id => id !== habitId);
        } else {
            newCompleted = [...currentCompleted, habitId];
        }

        onUpdateDay(dateKey, { habitsCompleted: newCompleted });
    };

    return (
        <div className="space-y-8">
            <header className="mb-6 border-b border-stone-300 pb-2 dark:border-stone-700">
                <h2 className="font-serif text-3xl font-bold text-stone-800 dark:text-stone-100">
                    {format(date, 'EEEE, MMMM do')}
                </h2>
            </header>

            {/* Daily Highlight */}
            <section className="space-y-2">
                <h3 className="font-serif text-xl italic text-stone-600 dark:text-stone-400">Daily Highlight</h3>
                <div className="relative">
                    <textarea
                        className="w-full resize-none rounded-md border border-stone-300 bg-white/50 p-3 shadow-inner ring-offset-2 focus:ring-2 focus:ring-stone-400 focus:outline-none dark:border-stone-700 dark:bg-stone-800/50"
                        rows={2}
                        placeholder="What was the best part of today?"
                        value={highlight}
                        onChange={(e) => setHighlight(e.target.value)}
                        onBlur={handleBlur}
                    />
                </div>
            </section>

            {/* Habit Tracker */}
            <section className="space-y-3">
                <h3 className="font-serif text-xl italic text-stone-600 dark:text-stone-400 justify-between flex">
                    <span>Habits</span>
                </h3>

                <div className="space-y-2">
                    {data.habits.map((habit) => {
                        const isCompleted = dayLog.habitsCompleted?.includes(habit.id);
                        return (
                            <div key={habit.id} className="flex items-center justify-between rounded-md border border-stone-200 bg-white px-3 py-2 shadow-sm dark:border-stone-700 dark:bg-stone-800">
                                <span className="font-serif text-stone-700 dark:text-stone-200">{habit.name}</span>
                                <button
                                    onClick={() => toggleHabit(habit.id)}
                                    className={clsx(
                                        "flex h-6 w-6 items-center justify-center rounded border transition-colors",
                                        isCompleted
                                            ? "border-green-600 bg-green-50 text-green-600 dark:border-green-400 dark:bg-green-900/30 dark:text-green-400"
                                            : "border-stone-300 hover:border-stone-400 dark:border-stone-600"
                                    )}
                                >
                                    {isCompleted && <Check size={16} />}
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* Quick Add Habit */}
                <div className="flex items-center gap-2 pt-2">
                    <input
                        type="text"
                        className="flex-1 rounded-md border border-stone-300 bg-transparent px-2 py-1 text-sm focus:outline-none dark:border-stone-600"
                        placeholder="Add new habit..."
                        value={newHabitName}
                        onChange={(e) => setNewHabitName(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && newHabitName.trim()) {
                                onAddHabit({ name: newHabitName.trim() });
                                setNewHabitName('');
                            }
                        }}
                    />
                    <button
                        onClick={() => {
                            if (newHabitName.trim()) {
                                onAddHabit({ name: newHabitName.trim() });
                                setNewHabitName('');
                            }
                        }}
                        className="rounded-full bg-stone-200 p-1 hover:bg-stone-300 dark:bg-stone-700 dark:hover:bg-stone-600"
                    >
                        <Plus size={16} />
                    </button>
                </div>
            </section>

            {/* Reflection / Productivity Notes */}
            <section className="space-y-2">
                <h3 className="font-serif text-xl italic text-stone-600 dark:text-stone-400">Reflection & Notes</h3>
                <textarea
                    className="w-full resize-none rounded-md border border-stone-300 bg-white/50 p-3 shadow-inner ring-offset-2 focus:ring-2 focus:ring-stone-400 focus:outline-none dark:border-stone-700 dark:bg-stone-800/50"
                    rows={6}
                    placeholder="Log your productivity or reflect on the day..."
                    value={reflection}
                    onChange={(e) => setReflection(e.target.value)}
                    onBlur={handleBlur}
                />
            </section>

        </div>
    );
}
