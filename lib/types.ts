export type HabitDefinition = {
    id: string;
    name: string;
    category?: string; // e.g., "Health", "Learning"
    color?: string;
};

export type ProductivityBlock = {
    id: string;
    timeRange: string; // e.g., "09:00 - 11:00"
    activity: string;
    intensity: 'low' | 'medium' | 'high';
};

export type DayLog = {
    date: string; // YYYY-MM-DD
    habitsCompleted: string[]; // IDs of completed habits
    productivity: ProductivityBlock[];
    highlight: string;
    reflection: string;
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
