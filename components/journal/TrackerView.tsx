'use client';

import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, addMonths, subMonths } from 'date-fns';
import { clsx } from 'clsx';
import { Check, Plus, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { JournalData, DayLog, HabitDefinition } from '@/lib/types';

interface TrackerViewProps {
    currentDate: Date;
    onMonthChange: (date: Date) => void;
    data: JournalData;
    onUpdateDay: (date: string, updates: Partial<DayLog>) => void;
    onAddHabit: (habit: Omit<HabitDefinition, 'id'>) => void;
    paperColor?: string;
}

export function TrackerView({ currentDate, onMonthChange, data, onUpdateDay, onAddHabit, paperColor = '#fefce8' }: TrackerViewProps) {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const [newHabitName, setNewHabitName] = useState('');

    const handleValueChange = (dateKey: string, habitId: string, value: any) => {
        // Retrieve existing day data or create fresh
        const existingDay = data.days[dateKey] || {
            date: dateKey,
            habitsCompleted: [],
            productivity: [],
            highlight: '',
            reflection: ''
        };

        const currentValues = existingDay.habitValues || {};
        const newValues = { ...currentValues, [habitId]: value };

        // Also update legacy completed array for backward compat if boolean
        let newCompleted = existingDay.habitsCompleted || [];
        if (typeof value === 'boolean') {
            if (value) {
                if (!newCompleted.includes(habitId)) newCompleted = [...newCompleted, habitId];
            } else {
                newCompleted = newCompleted.filter(id => id !== habitId);
            }
        }

        onUpdateDay(dateKey, { habitValues: newValues, habitsCompleted: newCompleted });
    };

    const handleTopicBlur = (dateKey: string, text: string) => {
        onUpdateDay(dateKey, { highlight: text });
    }

    return (
        <div className="h-full flex flex-col">
            <header className="mb-4 flex items-baseline justify-between border-b border-stone-900/10 pb-2">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onMonthChange(subMonths(currentDate, 1))}
                            className="rounded-full p-1 hover:bg-stone-900/5"
                        >
                            <ChevronLeft size={20} className="text-stone-700" />
                        </button>
                        <h2 className="font-serif text-2xl font-bold text-stone-900">
                            {format(currentDate, 'MMMM yyyy')}
                        </h2>
                        <button
                            onClick={() => onMonthChange(addMonths(currentDate, 1))}
                            className="rounded-full p-1 hover:bg-stone-900/5"
                        >
                            <ChevronRight size={20} className="text-stone-700" />
                        </button>
                    </div>
                </div>
                {/* Simple Habit Adder */}
                <div className="flex items-center gap-2">
                    <input
                        className="w-32 rounded border border-stone-300 bg-transparent px-2 py-1 text-xs focus:outline-none dark:border-stone-600"
                        placeholder="New Habit..."
                        value={newHabitName}
                        onChange={e => setNewHabitName(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Enter' && newHabitName.trim()) {
                                onAddHabit({ name: newHabitName.trim(), type: 'boolean' });
                                setNewHabitName('');
                            }
                        }}
                    />
                    <button onClick={() => {
                        if (newHabitName.trim()) {
                            onAddHabit({ name: newHabitName.trim(), type: 'boolean' });
                            setNewHabitName('');
                        }
                    }}>
                        <Plus size={14} />
                    </button>
                </div>
            </header>

            <div className="flex-1 overflow-auto custom-scrollbar">
                <table className="w-full border-collapse text-sm">
                    <thead>
                        <tr>
                            <th
                                className="sticky top-0 z-10 w-12 border-b border-stone-900/20 p-2 text-left font-serif font-bold text-stone-800"
                                style={{ backgroundColor: paperColor }}
                            >
                                Day
                            </th>
                            <th
                                className="sticky top-0 z-10 border-b border-stone-900/20 p-2 text-left font-serif font-bold text-stone-800 min-w-[150px]"
                                style={{ backgroundColor: paperColor }}
                            >
                                Topic / Highlight
                            </th>
                            {data.habits.map(habit => (
                                <th
                                    key={habit.id}
                                    className="sticky top-0 z-10 w-20 border-b border-stone-900/20 p-2 text-center font-serif font-bold text-stone-800"
                                    style={{ backgroundColor: paperColor }}
                                >
                                    <div className="flex flex-col items-center">
                                        <span>{habit.name}</span>
                                        {habit.target && <span className="text-[10px] text-stone-500 font-normal">{habit.target}</span>}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {days.map((day) => {
                            const dateKey = format(day, 'yyyy-MM-dd');
                            const dayData = data.days[dateKey];
                            const highlight = dayData?.highlight || '';
                            const values = dayData?.habitValues || {};

                            return (
                                <tr key={dateKey} className="group hover:bg-stone-100 dark:hover:bg-stone-700/30">
                                    <td className="border-b border-stone-200 p-2 font-mono text-xs text-stone-500 dark:border-stone-800">
                                        {format(day, 'dd')} <span className="text-[10px] opacity-50">{format(day, 'EEE')}</span>
                                    </td>
                                    <td className="border-b border-stone-200 p-1 dark:border-stone-800">
                                        <input
                                            type="text"
                                            className="w-full bg-transparent px-1 py-0.5 text-stone-900 focus:outline-none"
                                            defaultValue={highlight}
                                            onBlur={(e) => handleTopicBlur(dateKey, e.target.value)}
                                        />
                                    </td>
                                    {data.habits.map(habit => {
                                        const val = values[habit.id];
                                        // Backwards compatibility check
                                        const isCompletedLegacy = dayData?.habitsCompleted?.includes(habit.id);
                                        const displayValue = val !== undefined ? val : (isCompletedLegacy ? true : undefined);

                                        return (
                                            <td key={habit.id} className="border-b border-stone-200 p-1 text-center dark:border-stone-800">
                                                {habit.type === 'boolean' ? (
                                                    <button
                                                        onClick={() => handleValueChange(dateKey, habit.id, !displayValue)}
                                                        className={clsx(
                                                            "mx-auto flex h-5 w-5 items-center justify-center rounded-full border transition-all",
                                                            displayValue
                                                                ? "border-stone-800 bg-stone-800 text-white"
                                                                : "border-stone-300 group-hover:border-stone-400"
                                                        )}
                                                    >
                                                        {displayValue && <Check size={12} />}
                                                    </button>
                                                ) : (
                                                    <input
                                                        type="text" // using text for flexibility even for numbers
                                                        className="w-full text-center bg-transparent text-xs focus:outline-none"
                                                        placeholder="-"
                                                        value={displayValue as string || ''}
                                                        onChange={(e) => handleValueChange(dateKey, habit.id, e.target.value)}
                                                    />
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
