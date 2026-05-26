import { supabase } from './supabaseClient';
import { JournalData, HabitDefinition, DayLog, Goal } from './types';

export const fetchJournalData = async (userId: string): Promise<JournalData> => {
    // Fetch Habits
    const { data: habits } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', userId);

    // Fetch Day Logs
    const { data: dayLogs } = await supabase
        .from('day_logs')
        .select('*')
        .eq('user_id', userId);

    // Fetch Monthly Goals
    const { data: goals } = await supabase
        .from('monthly_goals')
        .select('*')
        .eq('user_id', userId);

    // Transform Day Logs array to Map/Object
    const daysMap: Record<string, DayLog> = {};
    dayLogs?.forEach((log) => {
        daysMap[log.date] = {
            date: log.date,
            habitsCompleted: log.habits_completed || [],
            habitValues: log.habit_values || {},
        };
    });

    return {
        habits: (habits as any[] || []).map(h => ({
            ...h,
            // Map any snake_case to camelCase if needed, but 'type', 'color', 'name' are same.
            // 'target' is same.
        })),
        days: daysMap,
        monthlyGoals: (goals as any[] || []).map(g => ({
            ...g,
            // 'completed', 'month', 'title' are same.
        }))
    };
};

export const createHabit = async (habit: HabitDefinition, userId: string) => {
    const { data, error } = await supabase
        .from('habits')
        .insert({
            id: habit.id,
            user_id: userId,
            name: habit.name,
            category: habit.category,
            color: habit.color,
            type: habit.type,
            target: habit.target
        })
        .select()
        .single();

    if (error) console.error('Error creating habit:', error);
    return data;
};

export const updateHabit = async (habitId: string, updates: Partial<HabitDefinition>, userId: string) => {
    const { data, error } = await supabase
        .from('habits')
        .update(updates)
        .eq('id', habitId)
        .eq('user_id', userId)
        .select()
        .single();

    if (error) console.error('Error updating habit:', error);
    return data;
};

export const deleteHabit = async (habitId: string, userId: string) => {
    const { error } = await supabase
        .from('habits')
        .delete()
        .eq('id', habitId)
        .eq('user_id', userId);

    if (error) console.error('Error deleting habit:', error);
};

export const updateDayLog = async (date: string, updates: Partial<DayLog>, userId: string) => {
    // We need to handle upsert carefully.
    // First, try to find if it exists is not needed if we use upsert with unique constraint (user_id, date).

    // Map camelCase to snake_case for DB
    const dbPayload: any = {
        user_id: userId,
        date: date,
        updated_at: new Date().toISOString()
    };

    if (updates.habitsCompleted !== undefined) dbPayload.habits_completed = updates.habitsCompleted;
    if (updates.habitValues !== undefined) dbPayload.habit_values = updates.habitValues;

    const { data, error } = await supabase
        .from('day_logs')
        .upsert(dbPayload, { onConflict: 'user_id, date' })
        .select()
        .single();

    if (error) console.error('Error updating day log:', error);
    return data;
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

    if (error) console.error('Error creating goal:', error);
    return data;
};

export const updateGoal = async (goalId: string, updates: Partial<Goal>, userId: string) => {
    const { data, error } = await supabase
        .from('monthly_goals')
        .update(updates)
        .eq('id', goalId)
        .eq('user_id', userId);

    if (error) console.error('Error updating goal:', error);
    return data;
};

export const deleteGoal = async (goalId: string, userId: string) => {
    const { error } = await supabase
        .from('monthly_goals')
        .delete()
        .eq('id', goalId)
        .eq('user_id', userId);

    if (error) console.error('Error deleting goal:', error);
};
