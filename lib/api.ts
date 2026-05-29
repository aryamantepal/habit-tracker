import { supabase } from './supabaseClient';
import { JournalData, HabitDefinition, Completion, Goal } from './types';

export const fetchJournalData = async (userId: string): Promise<JournalData> => {
    // Fetch Habits (including archived ones)
    const { data: habits } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', userId);

    // Fetch Completions
    const { data: completions } = await supabase
        .from('completions')
        .select('*')
        .eq('user_id', userId);

    // Fetch Monthly Goals
    const { data: goals } = await supabase
        .from('monthly_goals')
        .select('*')
        .eq('user_id', userId);

    return {
        habits: (habits as { id: string; name: string; color: string | null; created_at: string | null; archived_at: string | null }[] || []).map(h => ({
            id: h.id,
            name: h.name,
            color: h.color || 'stone',
            createdAt: h.created_at || new Date().toISOString(),
            archivedAt: h.archived_at || null
        })),
        completions: (completions as { id: string; habit_id: string; date: string }[] || []).map(c => ({
            id: c.id,
            habitId: c.habit_id,
            date: c.date
        })),
        monthlyGoals: (goals as { id: string; title: string; month: string; completed: boolean }[] || []).map(g => ({
            id: g.id,
            title: g.title,
            month: g.month,
            completed: g.completed
        }))
    };
};

export const createHabit = async (habit: Omit<HabitDefinition, 'createdAt'>, userId: string) => {
    const { data, error } = await supabase
        .from('habits')
        .insert({
            id: habit.id,
            user_id: userId,
            name: habit.name,
            color: habit.color,
            archived_at: habit.archivedAt
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating habit:', error.message ?? error);
        throw error;
    }
    return data;
};

export const updateHabit = async (habitId: string, updates: Partial<HabitDefinition>, userId: string) => {
    const dbPayload: { name?: string; color?: string; archived_at?: string | null } = {};
    if (updates.name !== undefined) dbPayload.name = updates.name;
    if (updates.color !== undefined) dbPayload.color = updates.color;
    if (updates.archivedAt !== undefined) dbPayload.archived_at = updates.archivedAt;

    const { data, error } = await supabase
        .from('habits')
        .update(dbPayload)
        .eq('id', habitId)
        .eq('user_id', userId)
        .select()
        .single();

    if (error) {
        console.error('Error updating habit:', error.message ?? error);
        throw error;
    }
    return data;
};

export const deleteHabit = async (habitId: string, userId: string) => {
    const { error } = await supabase
        .from('habits')
        .delete()
        .eq('id', habitId)
        .eq('user_id', userId);

    if (error) {
        console.error('Error deleting habit:', error.message ?? error);
        throw error;
    }
};

export const addCompletion = async (completionId: string, habitId: string, date: string, userId: string) => {
    const { data, error } = await supabase
        .from('completions')
        .upsert(
            { id: completionId, user_id: userId, habit_id: habitId, date },
            { onConflict: 'habit_id,date', ignoreDuplicates: true }
        )
        .select()
        .single();

    if (error) {
        console.error('Error adding completion:', error.message ?? error);
        throw error;
    }
    return data;
};

export const removeCompletion = async (habitId: string, date: string, userId: string) => {
    const { error } = await supabase
        .from('completions')
        .delete()
        .eq('habit_id', habitId)
        .eq('date', date)
        .eq('user_id', userId);

    if (error) {
        console.error('Error removing completion:', error.message ?? error);
        throw error;
    }
};

export const createGoal = async (goal: Goal, userId: string) => {
    const { data, error } = await supabase
        .from('monthly_goals')
        .insert({
            id: goal.id,
            user_id: userId,
            title: goal.title,
            completed: goal.completed,
            month: goal.month
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating goal:', error.message ?? error);
        throw error;
    }
    return data;
};

export const updateGoal = async (goalId: string, updates: Partial<Goal>, userId: string) => {
    const dbPayload: { title?: string; completed?: boolean; month?: string } = {};
    if (updates.title !== undefined) dbPayload.title = updates.title;
    if (updates.completed !== undefined) dbPayload.completed = updates.completed;
    if (updates.month !== undefined) dbPayload.month = updates.month;

    const { data, error } = await supabase
        .from('monthly_goals')
        .update(dbPayload)
        .eq('id', goalId)
        .eq('user_id', userId)
        .select()
        .single();

    if (error) {
        console.error('Error updating goal:', error.message ?? error);
        throw error;
    }
    return data;
};

export const deleteGoal = async (goalId: string, userId: string) => {
    const { error } = await supabase
        .from('monthly_goals')
        .delete()
        .eq('id', goalId)
        .eq('user_id', userId);

    if (error) {
        console.error('Error deleting goal:', error.message ?? error);
        throw error;
    }
};

