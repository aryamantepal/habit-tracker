'use client';

import React, { useState, useEffect } from 'react';
import { NotebookLayout } from '@/components/notebook/Notebook';
import { CoverPage } from '@/components/journal/CoverPage';
import { MonthGrid } from '@/components/journal/MonthGrid';
import { DayDetail } from '@/components/journal/DayDetail';
import { GoalPlanner } from '@/components/journal/GoalPlanner';
import { JournalData, DayLog, HabitDefinition, Goal } from '@/lib/types';
import { ArrowLeft, BookOpen, Calendar, Target } from 'lucide-react';
import { motion } from 'framer-motion';

// Mock Initial Data
const INITIAL_DATA: JournalData = {
  habits: [
    { id: 'h1', name: 'Work out', category: 'Health', color: 'red' },
    { id: 'h2', name: 'LeetCode', category: 'Career', color: 'blue' },
    { id: 'h3', name: 'Read Book', category: 'Growth', color: 'green' }
  ],
  days: {},
  monthlyGoals: []
};

type ViewState = 'COVER' | 'MONTH' | 'DAY' | 'GOALS';

export default function Home() {
  const [data, setData] = useState<JournalData>(INITIAL_DATA);
  const [view, setView] = useState<ViewState>('COVER');
  const [currentDate, setCurrentDate] = useState(new Date());

  // Load from local storage on mount (MVP persistence)
  useEffect(() => {
    const saved = localStorage.getItem('journalData');
    if (saved) {
      try {
        setData(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load journal data", e);
      }
    }
  }, []);

  // Save on change
  useEffect(() => {
    localStorage.setItem('journalData', JSON.stringify(data));
  }, [data]);

  const handleUpdateDay = (dateKey: string, updates: Partial<DayLog>) => {
    setData(prev => {
      const existing = prev.days[dateKey] || {
        date: dateKey,
        habitsCompleted: [],
        productivity: [],
        highlight: '',
        reflection: ''
      };

      return {
        ...prev,
        days: {
          ...prev.days,
          [dateKey]: { ...existing, ...updates }
        }
      };
    });
  };

  const handleAddHabit = (habit: Omit<HabitDefinition, 'id'>) => {
    setData(prev => ({
      ...prev,
      habits: [...prev.habits, { ...habit, id: crypto.randomUUID() }]
    }));
  };

  const handleAddGoal = (goal: Omit<Goal, 'id' | 'completed'>) => {
    setData(prev => ({
      ...prev,
      monthlyGoals: [...prev.monthlyGoals, { ...goal, id: crypto.randomUUID(), completed: false }]
    }));
  };

  const handleToggleGoal = (id: string) => {
    setData(prev => ({
      ...prev,
      monthlyGoals: prev.monthlyGoals.map(g =>
        g.id === id ? { ...g, completed: !g.completed } : g
      )
    }));
  };

  // -- Render Logic --

  // Left Page Content
  const renderLeftPage = () => {
    return (
      <div className="flex h-full flex-col justify-between">
        <div className="space-y-6">
          <nav className="flex flex-col gap-2 font-serif text-lg">
            <button
              onClick={() => setView('COVER')}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-left transition-colors hover:bg-stone-200 dark:hover:bg-stone-700 ${view === 'COVER' ? 'bg-stone-200 font-bold dark:bg-stone-700' : ''}`}
            >
              <BookOpen size={20} /> Cover
            </button>
            <button
              onClick={() => setView('MONTH')}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-left transition-colors hover:bg-stone-200 dark:hover:bg-stone-700 ${view === 'MONTH' ? 'bg-stone-200 font-bold dark:bg-stone-700' : ''}`}
            >
              <Calendar size={20} /> Calendar
            </button>
            <button
              onClick={() => setView('GOALS')}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-left transition-colors hover:bg-stone-200 dark:hover:bg-stone-700 ${view === 'GOALS' ? 'bg-stone-200 font-bold dark:bg-stone-700' : ''}`}
            >
              <Target size={20} /> Goals
            </button>
          </nav>

          <div className="my-6 border-t border-stone-300 dark:border-stone-700" />

          <div className="px-2">
            <h3 className="mb-2 font-serif font-bold text-stone-500">Quick Stats</h3>
            <div className="flex flex-col gap-1 text-sm text-stone-600 dark:text-stone-400">
              <p>Habits: {data.habits.length}</p>
              <p>Goals: {data.monthlyGoals.filter(g => g.completed).length}/{data.monthlyGoals.length}</p>
            </div>
          </div>
        </div>

        {/* Back Button Context */}
        {view === 'DAY' && (
          <button
            onClick={() => setView('MONTH')}
            className="flex items-center gap-2 rounded-md bg-stone-200 px-4 py-2 font-serif text-sm hover:bg-stone-300 dark:bg-stone-700 dark:hover:bg-stone-600"
          >
            <ArrowLeft size={16} /> Back to Month
          </button>
        )}
      </div>
    );
  };

  // Right Page Content
  const renderRightPage = () => {
    switch (view) {
      case 'COVER':
        return <CoverPage />;
      case 'MONTH':
        return (
          <MonthGrid
            currentDate={currentDate}
            data={data}
            onSelectDay={(date) => {
              setCurrentDate(date);
              setView('DAY');
            }}
          />
        );
      case 'DAY':
        return (
          <DayDetail
            date={currentDate}
            data={data}
            onUpdateDay={handleUpdateDay}
            onAddHabit={handleAddHabit}
          />
        );
      case 'GOALS':
        return (
          <GoalPlanner
            goals={data.monthlyGoals}
            onAddGoal={handleAddGoal}
            onToggleGoal={handleToggleGoal}
          />
        );
      default:
        return <CoverPage />;
    }
  };

  return (
    <main>
      <NotebookLayout
        leftPage={renderLeftPage()}
        rightPage={renderRightPage()}
      />
    </main>
  );
}
