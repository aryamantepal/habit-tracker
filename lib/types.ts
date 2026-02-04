export type HabitDefinition = {
    id: string;
    name: string;
    category?: string; // e.g., "Health", "Learning"
    color?: string;
    type: 'boolean' | 'number' | 'text';
    target?: string; // e.g. "10 pages", "30 mins"
};

export type PaperColor = '#fefce8' | '#ffffff' | '#eff6ff' | '#fdf2f8' | '#f0fdf4';
export const PAPER_COLORS: { name: string; value: PaperColor }[] = [
    { name: 'Yellow', value: '#fefce8' },
    { name: 'White', value: '#ffffff' },
    { name: 'Blue', value: '#eff6ff' },
    { name: 'Pink', value: '#fdf2f8' },
    { name: 'Green', value: '#f0fdf4' },
];

export type ProductivityBlock = {
    id: string;
    timeRange: string; // e.g., "09:00 - 11:00"
    activity: string;
    intensity: 'low' | 'medium' | 'high';
};

export type DayLog = {
    date: string; // YYYY-MM-DD
    habitsCompleted: string[]; // IDs of completed habits (backwards compat)
    habitValues?: Record<string, string | number | boolean>; // id -> value
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
    themeColor?: PaperColor;
};
