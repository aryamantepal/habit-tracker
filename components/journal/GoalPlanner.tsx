'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Sparkles } from 'lucide-react';
import { Goal } from '@/lib/types';
import { clsx } from 'clsx';

interface GoalPlannerProps {
    goals: Goal[];
    onAddGoal: (goal: Omit<Goal, 'id' | 'completed'>) => void;
    onToggleGoal: (id: string) => void;
    onDeleteGoal: (id: string) => void;
    onEditGoal: (id: string, newTitle: string) => void;
}

export function GoalPlanner({ goals, onAddGoal, onToggleGoal, onDeleteGoal, onEditGoal }: GoalPlannerProps) {
    const [newGoalTitle, setNewGoalTitle] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
    const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState('');

    const startEditing = (goal: Goal) => {
        setEditingGoalId(goal.id);
        setEditTitle(goal.title);
    };

    const saveEdit = () => {
        if (editingGoalId && editTitle.trim()) {
            onEditGoal(editingGoalId, editTitle.trim());
            setEditingGoalId(null);
            setEditTitle('');
        }
    };

    const handleAddStart = () => {
        if (newGoalTitle.trim()) {
            onAddGoal({
                title: newGoalTitle.trim(),
                description: '',
                month: '2026-02', // Mock month
            });
            setNewGoalTitle('');
        }
    };

    const generateAiRoadmap = () => {
        setIsGenerating(true);
        // Mock AI delay
        setTimeout(() => {
            setIsGenerating(false);
            setAiSuggestion("Based on your habits, try aiming for consistent 30-minute reading sessions 3x a week to improve focus.");
        }, 2000);
    };

    return (
        <div className="space-y-8">
            <header className="mb-6 border-b border-stone-300 pb-2 dark:border-stone-700">
                <h2 className="font-serif text-3xl font-bold text-stone-800 dark:text-stone-100">
                    Monthly Goals
                </h2>
            </header>

            {/* AI Roadmap Generator */}
            <section className="rounded-lg border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-900 dark:bg-indigo-900/20">
                <div className="flex items-center justify-between">
                    <h3 className="flex items-center gap-2 font-serif text-lg font-bold text-indigo-900 dark:text-indigo-200">
                        <Sparkles size={18} />
                        AI Roadmap
                    </h3>
                    <button
                        onClick={generateAiRoadmap}
                        disabled={isGenerating}
                        className="rounded-md bg-indigo-600 px-3 py-1 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {isGenerating ? 'Driving...' : 'Generate Roadmap'}
                    </button>
                </div>

                {isGenerating && (
                    <div className="mt-4 animate-pulse text-sm text-indigo-700 dark:text-indigo-300">
                        Analyzing your habits and past performance...
                    </div>
                )}

                {aiSuggestion && !isGenerating && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 rounded bg-white p-3 text-sm text-stone-700 shadow-sm dark:bg-stone-800 dark:text-stone-300"
                    >
                        <p className="font-bold text-indigo-600 dark:text-indigo-400">Suggestion:</p>
                        {aiSuggestion}
                        <div className="mt-2 text-right">
                            <button
                                onClick={() => {
                                    onAddGoal({
                                        title: "Read 30 mins, 3x/week",
                                        description: "AI Suggested goal for focus",
                                        month: '2026-02'
                                    });
                                    setAiSuggestion(null);
                                }}
                                className="text-xs text-indigo-600 underline hover:text-indigo-800 dark:text-indigo-400"
                            >
                                Accept Goal
                            </button>
                        </div>
                    </motion.div>
                )}
            </section>

            {/* Goal List */}
            <ul className="space-y-4">
                {goals.map((goal) => (
                    <li key={goal.id} className="group flex items-start gap-3 relative">
                        <button
                            onClick={() => onToggleGoal(goal.id)}
                            className={clsx(
                                "mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-all",
                                goal.completed
                                    ? "border-stone-800 bg-stone-800 text-white dark:border-stone-200 dark:bg-stone-200 dark:text-stone-900"
                                    : "border-stone-400 hover:border-stone-600 dark:border-stone-600"
                            )}
                        >
                            {goal.completed && <Check size={14} />}
                        </button>
                        <div className="flex-1">
                            {editingGoalId === goal.id ? (
                                <input
                                    autoFocus
                                    type="text"
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    onBlur={saveEdit}
                                    onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                                    className="w-full bg-transparent font-serif text-lg leading-tight focus:outline-none border-b border-stone-400"
                                />
                            ) : (
                                <p className={clsx(
                                    "font-serif text-lg leading-tight",
                                    goal.completed ? "text-stone-400 line-through" : "text-stone-800 dark:text-stone-200"
                                )}>
                                    {goal.title}
                                </p>
                            )}
                            {goal.description && (
                                <p className="text-sm text-stone-500">{goal.description}</p>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => startEditing(goal)}
                                className="p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
                            </button>
                            <button
                                onClick={() => onDeleteGoal(goal.id)}
                                className="p-1 text-stone-400 hover:text-red-500"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
                            </button>
                        </div>
                    </li>
                ))}
                {goals.length === 0 && (
                    <li className="text-center font-serif text-stone-400 italic">
                        No goals set for this month yet.
                    </li>
                )}
            </ul>

            {/* Add Goal Input */}
            <div className="flex items-center gap-2 border-t border-stone-200 pt-4 dark:border-stone-700">
                <input
                    type="text"
                    value={newGoalTitle}
                    onChange={(e) => setNewGoalTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddStart()}
                    placeholder="New Goal..."
                    className="flex-1 rounded-md border border-stone-300 bg-transparent px-3 py-2 font-serif text-stone-800 focus:border-stone-500 focus:outline-none dark:border-stone-600 dark:text-stone-200"
                />
                <button
                    onClick={handleAddStart}
                    className="rounded-full bg-stone-800 p-2 text-white hover:bg-stone-700 dark:bg-stone-200 dark:text-stone-900"
                >
                    <Plus size={20} />
                </button>
            </div>
        </div>
    );
}

function Check({ size }: { size: number }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <polyline points="20 6 9 17 4 12" />
        </svg>
    );
}
