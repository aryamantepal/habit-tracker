'use client';

import React, { useState, useEffect } from 'react';
import { NotebookLayout } from '@/components/notebook/Notebook';
import { TrackerView } from '@/components/journal/TrackerView';
import { GoalPlanner } from '@/components/journal/GoalPlanner';
import { JournalData, DayLog, HabitDefinition, Goal } from '@/lib/types';
import { BookOpen } from 'lucide-react';

// Mock Initial Data
const INITIAL_DATA: JournalData = {
  habits: [
    { id: 'h1', name: 'Work out', category: 'Health', color: 'red', type: 'boolean' },
    { id: 'h2', name: 'LeetCode', category: 'Career', color: 'blue', type: 'boolean' },
    { id: 'h3', name: 'Reading', category: 'Growth', color: 'green', type: 'number', target: 'pages' }
  ],
  days: {},
  monthlyGoals: []
};

export default function Home() {
  const [data, setData] = useState<JournalData>(INITIAL_DATA);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Load from local storage on mount (MVP persistence)
  useEffect(() => {
    const saved = localStorage.getItem('journalData');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure habits have types if loaded from old data
        const safeHabits = parsed.habits.map((h: any) => ({
          ...h,
          type: h.type || 'boolean'
        }));
        setData({ ...parsed, habits: safeHabits });
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

      const updatedDay = { ...existing, ...updates };
      // Ensure habitValues is initialized if missing
      if (!updatedDay.habitValues) updatedDay.habitValues = {};

      return {
        ...prev,
        days: {
          ...prev.days,
          [dateKey]: updatedDay
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

  // Left Page: Monthly Tracker Table
  const renderLeftPage = () => {
    return (
      <TrackerView
        currentDate={currentDate}
        data={data}
        onUpdateDay={handleUpdateDay}
        onAddHabit={handleAddHabit}
      />
    );
  };

  // Right Page: Monthly Goals
  const renderRightPage = () => {
    return (
      <GoalPlanner
        goals={data.monthlyGoals}
        onAddGoal={handleAddGoal}
        onToggleGoal={handleToggleGoal}
      />
    );
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
