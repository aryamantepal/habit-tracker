export type HabitDefinition = {
    id: string;
    name: string;
    color: string;
    createdAt: string;
    archivedAt: string | null;
};

export type Completion = {
    id: string;
    habitId: string;
    date: string; // YYYY-MM-DD
};

export type Goal = {
    id: string;
    title: string;
    month: string; // YYYY-MM
    completed: boolean;
};

export type JournalData = {
    habits: HabitDefinition[];
    completions: Completion[];
    monthlyGoals: Goal[];
};

