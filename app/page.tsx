'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { NotebookLayout } from '@/components/notebook/Notebook';
import { TrackerView } from '@/components/journal/TrackerView';
import { GoalPlanner } from '@/components/journal/GoalPlanner';
import { JournalData, HabitDefinition } from '@/lib/types';
import { Download, Upload } from 'lucide-react';
import { format, isSameMonth, startOfMonth } from 'date-fns';
import { loadJournal, saveJournal, exportJournal, parseJournalImport } from '@/lib/storage';

const INITIAL_DATA: JournalData = {
  habits: [],
  completions: [],
  monthlyGoals: []
};

const controlClass =
  'p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-[#eef2ec] hover:text-[#6f8d76] text-stone-500 transition-all border border-[#e7e4da]';

export default function Home() {
  const [data, setData] = useState<JournalData>(INITIAL_DATA);
  // Stays false until localStorage has been read, so the empty initial state is never saved over real data.
  const [hydrated, setHydrated] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const r = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${r}`;
  });
  const importInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // localStorage only exists in the browser, so it can't be read during the first render without a hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setData(loadJournal());
    setHydrated(true);
    // Ask the browser not to evict our data under storage pressure; best effort.
    navigator.storage?.persist?.().catch(() => {});
  }, []);

  useEffect(() => {
    if (hydrated) saveJournal(data);
  }, [data, hydrated]);

  const handleMonthChange = (date: Date) => {
    setCurrentDate(date);
    // Keep the right page on the month the calendar shows: today in the current month, else the 1st.
    const today = new Date();
    const target = isSameMonth(date, today) ? today : startOfMonth(date);
    setSelectedDate(format(target, 'yyyy-MM-dd'));
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const file = input.files?.[0];
    input.value = ''; // allow re-importing the same file
    if (!file) return;
    try {
      const imported = parseJournalImport(await file.text());
      if (confirm('Importing replaces all of your current habits, completions and goals. Continue?')) {
        setData(imported);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Could not import that file.');
    }
  };

  if (!hydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f4f3ee]">
        <div className="animate-pulse text-stone-400">Loading your journal...</div>
      </div>
    );
  }

  const handleToggleCompletion = (habitId: string, dateKey: string) => {
    const newId = crypto.randomUUID();
    setData(prev => {
      const exists = prev.completions.some(c => c.habitId === habitId && c.date === dateKey);
      return {
        ...prev,
        completions: exists
          ? prev.completions.filter(c => !(c.habitId === habitId && c.date === dateKey))
          : [...prev.completions, { id: newId, habitId, date: dateKey }]
      };
    });
  };

  const handleAddHabit = (habit: Omit<HabitDefinition, 'id' | 'createdAt' | 'archivedAt'>) => {
    const newHabit = {
      ...habit,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      archivedAt: null
    };
    setData(prev => ({ ...prev, habits: [...prev.habits, newHabit] }));
  };

  const handleAddGoal = (title: string) => {
    const newGoal = {
      id: crypto.randomUUID(),
      title,
      month: format(currentDate, 'yyyy-MM'),
      completed: false
    };
    setData(prev => ({ ...prev, monthlyGoals: [...prev.monthlyGoals, newGoal] }));
  };

  const handleToggleGoal = (id: string) => {
    setData(prev => ({
      ...prev,
      monthlyGoals: prev.monthlyGoals.map(g => g.id === id ? { ...g, completed: !g.completed } : g)
    }));
  };

  const handleDeleteGoal = (id: string) => {
    setData(prev => ({ ...prev, monthlyGoals: prev.monthlyGoals.filter(g => g.id !== id) }));
  };

  const handleEditGoal = (id: string, newTitle: string) => {
    setData(prev => ({
      ...prev,
      monthlyGoals: prev.monthlyGoals.map(g => g.id === id ? { ...g, title: newTitle } : g)
    }));
  };

  const handleUpdateHabit = (id: string, updates: Partial<HabitDefinition>) => {
    setData(prev => ({
      ...prev,
      habits: prev.habits.map(h => h.id === id ? { ...h, ...updates } : h)
    }));
  };

  const handleDeleteHabit = (id: string) => {
    setData(prev => ({
      ...prev,
      habits: prev.habits.filter(h => h.id !== id),
      completions: prev.completions.filter(c => c.habitId !== id)
    }));
  };

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
    const currentMonthStr = format(currentDate, 'yyyy-MM');
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
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <button
          onClick={() => exportJournal(data)}
          className={controlClass}
          title="Export backup"
          aria-label="Export backup"
        >
          <Download className="w-5 h-5" />
        </button>
        <button
          onClick={() => importInputRef.current?.click()}
          className={controlClass}
          title="Import backup"
          aria-label="Import backup"
        >
          <Upload className="w-5 h-5" />
        </button>
        <input
          ref={importInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleImportFile}
          className="hidden"
          aria-hidden="true"
          tabIndex={-1}
        />
      </div>

      <NotebookLayout
        leftPage={renderLeftPage()}
        rightPage={renderRightPage()}
      />

      <div className="bg-[#f4f3ee] pb-6 text-center">
        <Link href="/privacy" className="text-xs text-stone-400 hover:text-[#6f8d76] hover:underline">
          Privacy Policy
        </Link>
      </div>
    </main>
  );
}
