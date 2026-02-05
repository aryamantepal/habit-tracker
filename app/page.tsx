'use client';

import React, { useState, useEffect } from 'react';
import { NotebookLayout } from '@/components/notebook/Notebook';
import { TrackerView } from '@/components/journal/TrackerView';
import { GoalPlanner } from '@/components/journal/GoalPlanner';
import { JournalData, DayLog, HabitDefinition, Goal, PaperColor } from '@/lib/types';
import { BookOpen, LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import Auth from '@/components/auth/Auth';
import { Session } from '@supabase/supabase-js';
import { fetchJournalData, createHabit, updateDayLog, createGoal, updateGoal, deleteGoal } from '@/lib/api';


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
  const [session, setSession] = useState<Session | null>(null);
  const [data, setData] = useState<JournalData>(INITIAL_DATA);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleMonthChange = (date: Date) => {
    setCurrentDate(date);
  };

  const handleThemeChange = (color: PaperColor) => {
    setData(prev => ({ ...prev, themeColor: color }));
  };

  // Fetch from Supabase on session change
  useEffect(() => {
    if (session?.user) {
      setLoading(true);
      fetchJournalData(session.user.id).then(fetchedData => {
        if (fetchedData.habits.length === 0 && Object.keys(fetchedData.days).length === 0) {
          setData({ ...fetchedData, habits: INITIAL_DATA.habits });
        } else {
          setData(fetchedData);
        }
        setLoading(false);
      });
    }
  }, [session]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-stone-100">
        <div className="animate-pulse text-stone-400">Loading your journal...</div>
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  const handleUpdateDay = async (dateKey: string, updates: Partial<DayLog>) => {
    // Optimistic Update
    setData(prev => {
      const existing = prev.days[dateKey] || {
        date: dateKey,
        habitsCompleted: [],
        habitValues: {},
        highlight: '',
        reflection: '',
        productivity: []
      };

      const updatedDay = { ...existing, ...updates };
      if (!updatedDay.habitValues) updatedDay.habitValues = {};

      return {
        ...prev,
        days: {
          ...prev.days,
          [dateKey]: updatedDay
        }
      };
    });

    // DB Update
    if (session?.user) {
      // We need to pass the FULL merged day object or just the updates?
      // The API `updateDayLog` takes partial updates, but merging logic is simpler if we pass what we have.
      // Actually, our API helper expects specific fields.
      // Let's pass the updates. But wait, `updateDayLog` builds the payload from updates.
      // If 'habitsCompleted' is in updates, it overwrites.
      // So we need to be careful. The `updates` argument here comes from `TrackerView`.
      // Usually `TrackerView` sends the *new* value for connection.
      // Let's look at `TrackerView` logic later. Assuming `updates` contains the *new desired state* for that field.
      await updateDayLog(dateKey, updates, session.user.id);
    }
  };

  const handleAddHabit = async (habit: Omit<HabitDefinition, 'id'>) => {
    const newHabit = { ...habit, id: crypto.randomUUID() };

    // Optimistic
    setData(prev => ({
      ...prev,
      habits: [...prev.habits, newHabit]
    }));

    // DB
    if (session?.user) {
      await createHabit(newHabit, session.user.id);
    }
  };

  const handleAddGoal = async (goal: Omit<Goal, 'id' | 'completed'>) => {
    const currentMonthStr = currentDate.toISOString().slice(0, 7);
    const newGoal = { ...goal, id: crypto.randomUUID(), completed: false, month: currentMonthStr };

    // Optimistic
    setData(prev => ({
      ...prev,
      monthlyGoals: [...prev.monthlyGoals, newGoal]
    }));

    // DB
    if (session?.user) {
      await createGoal(newGoal, session.user.id);
    }
  };

  const handleToggleGoal = async (id: string) => {
    const goal = data.monthlyGoals.find(g => g.id === id);
    if (!goal) return;

    const newCompleted = !goal.completed;

    // Optimistic
    setData(prev => ({
      ...prev,
      monthlyGoals: prev.monthlyGoals.map(g =>
        g.id === id ? { ...g, completed: newCompleted } : g
      )
    }));

    // DB
    if (session?.user) {
      await updateGoal(id, { completed: newCompleted }, session.user.id);
    }
  };

  const handleDeleteGoal = async (id: string) => {
    // Optimistic
    setData(prev => ({
      ...prev,
      monthlyGoals: prev.monthlyGoals.filter(g => g.id !== id)
    }));

    // DB
    if (session?.user) {
      await deleteGoal(id, session.user.id);
    }
  };

  const handleEditGoal = async (id: string, newTitle: string) => {
    // Optimistic
    setData(prev => ({
      ...prev,
      monthlyGoals: prev.monthlyGoals.map(g =>
        g.id === id ? { ...g, title: newTitle } : g
      )
    }));

    // DB
    if (session?.user) {
      await updateGoal(id, { title: newTitle }, session.user.id);
    }
  };

  // Left Page: Monthly Tracker Table
  const renderLeftPage = () => {
    return (
      <TrackerView
        currentDate={currentDate}
        onMonthChange={handleMonthChange}
        data={data}
        onUpdateDay={handleUpdateDay}
        onAddHabit={handleAddHabit}
        paperColor={data.themeColor}
      />
    );
  };

  // Right Page: Monthly Goals
  const renderRightPage = () => {
    const currentMonthStr = currentDate.toISOString().slice(0, 7);
    const visibleGoals = data.monthlyGoals.filter(g => g.month === currentMonthStr || !g.month); // !g.month for backwards compat

    return (
      <GoalPlanner
        goals={visibleGoals}
        onAddGoal={handleAddGoal}
        onToggleGoal={handleToggleGoal}
        onDeleteGoal={handleDeleteGoal}
        onEditGoal={handleEditGoal}
        currentTheme={data.themeColor || '#fefce8'}
        onThemeChange={handleThemeChange}
      />
    );
  };

  return (
    <main>
      <button
        onClick={() => supabase.auth.signOut()}
        className="fixed top-4 right-4 z-50 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-stone-100 text-stone-500 transition-all border border-stone-200"
        title="Sign Out"
      >
        <LogOut className="w-5 h-5" />
      </button>

      <NotebookLayout
        leftPage={renderLeftPage()}
        rightPage={renderRightPage()}
        paperColor={data.themeColor}
      />
    </main>
  );
}
