'use client';

import React, { useState, useEffect } from 'react';
import { NotebookLayout } from '@/components/notebook/Notebook';
import { TrackerView } from '@/components/journal/TrackerView';
import { GoalPlanner } from '@/components/journal/GoalPlanner';
import { JournalData, HabitDefinition, Goal } from '@/lib/types';
import { LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import Auth from '@/components/auth/Auth';
import { Session } from '@supabase/supabase-js';
import { fetchJournalData, createHabit, updateHabit, deleteHabit, addCompletion, removeCompletion, createGoal, updateGoal, deleteGoal } from '@/lib/api';



// Mock Initial Data
const INITIAL_DATA: JournalData = {
  habits: [],
  completions: [],
  monthlyGoals: []
};

export default function Home() {
  const [session, setSession] = useState<Session | null>(null);
  const [data, setData] = useState<JournalData>(INITIAL_DATA);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const r = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${r}`;
  });
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

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



  // Fetch from Supabase on session change
  useEffect(() => {
    if (session?.user) {
      setLoading(true);
      setFetchError(false);
      fetchJournalData(session.user.id)
        .then(fetchedData => {
          setData(fetchedData);
        })
        .catch(err => {
          console.error('Failed to load data:', err?.message ?? err);
          setFetchError(true);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [session]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f4f3ee]">
        <div className="animate-pulse text-stone-400">Loading your journal...</div>
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  if (fetchError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#f4f3ee] gap-4 px-6 text-center">
        <p className="text-stone-600">Couldn&apos;t load your data. Check your connection and try again.</p>
        <button
          onClick={() => setSession(s => (s ? { ...s } : s))}
          className="px-4 py-2 rounded-xl bg-[#6f8d76] text-white text-sm font-semibold hover:bg-[#5e7a65] transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const handleToggleCompletion = async (habitId: string, dateKey: string) => {
    const existingCompletion = data.completions.find(c => c.habitId === habitId && c.date === dateKey);

    if (existingCompletion) {
      // Optimistic
      setData(prev => ({
        ...prev,
        completions: prev.completions.filter(c => c.id !== existingCompletion.id)
      }));

      if (session?.user) {
        try {
          await removeCompletion(habitId, dateKey, session.user.id);
        } catch {
          // Rollback
          setData(prev => ({
            ...prev,
            completions: [...prev.completions, existingCompletion]
          }));
        }
      }
    } else {
      const newCompletionId = crypto.randomUUID();
      const newCompletion = { id: newCompletionId, habitId, date: dateKey };
      // Optimistic
      setData(prev => ({
        ...prev,
        completions: [...prev.completions, newCompletion]
      }));

      if (session?.user) {
        try {
          await addCompletion(newCompletionId, habitId, dateKey, session.user.id);
        } catch {
          // Rollback
          setData(prev => ({
            ...prev,
            completions: prev.completions.filter(c => c.id !== newCompletionId)
          }));
        }
      }
    }
  };

  const handleAddHabit = async (habit: Omit<HabitDefinition, 'id' | 'createdAt' | 'archivedAt'>) => {
    const newHabit = { 
      ...habit, 
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      archivedAt: null
    };

    // Optimistic
    setData(prev => ({
      ...prev,
      habits: [...prev.habits, newHabit]
    }));

    if (session?.user) {
      try {
        await createHabit(newHabit, session.user.id);
      } catch {
        // Rollback
        setData(prev => ({
          ...prev,
          habits: prev.habits.filter(h => h.id !== newHabit.id)
        }));
      }
    }
  };

  const handleAddGoal = async (title: string) => {
    const currentMonthStr = currentDate.toISOString().slice(0, 7);
    const newGoal = {
      id: crypto.randomUUID(),
      title,
      month: currentMonthStr,
      completed: false
    };

    // Optimistic
    setData(prev => ({
      ...prev,
      monthlyGoals: [...prev.monthlyGoals, newGoal]
    }));

    if (session?.user) {
      try {
        await createGoal(newGoal, session.user.id);
      } catch {
        // Rollback
        setData(prev => ({
          ...prev,
          monthlyGoals: prev.monthlyGoals.filter(g => g.id !== newGoal.id)
        }));
      }
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

    if (session?.user) {
      try {
        await updateGoal(id, { completed: newCompleted }, session.user.id);
      } catch {
        // Rollback
        setData(prev => ({
          ...prev,
          monthlyGoals: prev.monthlyGoals.map(g =>
            g.id === id ? { ...g, completed: goal.completed } : g
          )
        }));
      }
    }
  };

  const handleDeleteGoal = async (id: string) => {
    const removedGoal = data.monthlyGoals.find(g => g.id === id);

    // Optimistic
    setData(prev => ({
      ...prev,
      monthlyGoals: prev.monthlyGoals.filter(g => g.id !== id)
    }));

    if (session?.user && removedGoal) {
      try {
        await deleteGoal(id, session.user.id);
      } catch {
        // Rollback
        setData(prev => ({
          ...prev,
          monthlyGoals: [...prev.monthlyGoals, removedGoal]
        }));
      }
    }
  };

  const handleEditGoal = async (id: string, newTitle: string) => {
    const prevTitle = data.monthlyGoals.find(g => g.id === id)?.title;

    // Optimistic
    setData(prev => ({
      ...prev,
      monthlyGoals: prev.monthlyGoals.map(g =>
        g.id === id ? { ...g, title: newTitle } : g
      )
    }));

    if (session?.user) {
      try {
        await updateGoal(id, { title: newTitle }, session.user.id);
      } catch {
        // Rollback
        if (prevTitle !== undefined) {
          setData(prev => ({
            ...prev,
            monthlyGoals: prev.monthlyGoals.map(g =>
              g.id === id ? { ...g, title: prevTitle } : g
            )
          }));
        }
      }
    }
  };

  const handleUpdateHabit = async (id: string, updates: Partial<HabitDefinition>) => {
    const prevHabit = data.habits.find(h => h.id === id);

    // Optimistic
    setData(prev => ({
      ...prev,
      habits: prev.habits.map(h => h.id === id ? { ...h, ...updates } : h)
    }));

    if (session?.user) {
      try {
        await updateHabit(id, updates, session.user.id);
      } catch {
        // Rollback
        if (prevHabit) {
          setData(prev => ({
            ...prev,
            habits: prev.habits.map(h => h.id === id ? prevHabit : h)
          }));
        }
      }
    }
  }

  const handleDeleteHabit = async (id: string) => {
    const removedHabit = data.habits.find(h => h.id === id);
    const removedCompletions = data.completions.filter(c => c.habitId === id);

    // Optimistic
    setData(prev => ({
      ...prev,
      habits: prev.habits.filter(h => h.id !== id),
      completions: prev.completions.filter(c => c.habitId !== id)
    }));

    if (session?.user && removedHabit) {
      try {
        await deleteHabit(id, session.user.id);
      } catch {
        // Rollback
        setData(prev => ({
          ...prev,
          habits: [...prev.habits, removedHabit],
          completions: [...prev.completions, ...removedCompletions]
        }));
      }
    }
  }

  // Left Page: Monthly Tracker Table
  const renderLeftPage = () => {
    return (
      <TrackerView
        currentDate={currentDate}
        onMonthChange={handleMonthChange}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        data={data}
        onAddHabit={handleAddHabit}
      />
    );
  };

  // Right Page: Monthly Goals
  const renderRightPage = () => {
    const currentMonthStr = currentDate.toISOString().slice(0, 7);
    const visibleGoals = data.monthlyGoals.filter(g => g.month === currentMonthStr || !g.month); // !g.month for backwards compat

    return (
      <GoalPlanner
        selectedDate={selectedDate}
        data={data}
        onToggleCompletion={handleToggleCompletion}
        onUpdateHabit={handleUpdateHabit}
        onDeleteHabit={handleDeleteHabit}
        onAddHabit={handleAddHabit}
        goals={visibleGoals}
        onAddGoal={handleAddGoal}
        onToggleGoal={handleToggleGoal}
        onDeleteGoal={handleDeleteGoal}
        onEditGoal={handleEditGoal}
      />
    );
  };

  return (
    <main>
      <button
        onClick={() => supabase.auth.signOut()}
        className="fixed top-4 right-4 z-50 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-[#eef2ec] hover:text-[#6f8d76] text-stone-500 transition-all border border-[#e7e4da]"
        title="Sign Out"
      >
        <LogOut className="w-5 h-5" />
      </button>

      <NotebookLayout
        leftPage={renderLeftPage()}
        rightPage={renderRightPage()}
      />
    </main>
  );
}
