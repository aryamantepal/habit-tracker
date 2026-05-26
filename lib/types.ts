export type HabitDefinition = {
    id: string;
    name: string;
    category?: string; // e.g., "Health", "Learning"
    color?: string;
    type: 'boolean' | 'number' | 'text';
    target?: string; // e.g. "10 pages", "30 mins"
};

export type DayLog = {
    date: string; // YYYY-MM-DD
    habitsCompleted: string[]; // IDs of completed habits (backwards compat)
    habitValues?: Record<string, string | number | boolean>; // id -> value
};

export type Goal = {
    id: string;
    title: string;
    description: string;
    month: string; // YYYY-MM
    completed: boolean;
};

export type JournalData = {
    habits: HabitDefinition[];
    days: Record<string, DayLog>;
    monthlyGoals: Goal[];
};

