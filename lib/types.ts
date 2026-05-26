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

export const PRESET_COLORS = [
    { hex: '#1D9E75', name: 'green' },
    { hex: '#D85A30', name: 'orange' },
    { hex: '#534AB7', name: 'purple' },
    { hex: '#185FA5', name: 'blue' },
    { hex: '#BA7517', name: 'gold' },
    { hex: '#C5376F', name: 'pink' },
    { hex: '#0F766E', name: 'teal' },
    { hex: '#78350F', name: 'brown' }
];

export const getHabitColorHex = (colorNameOrHex: string): string => {
    if (!colorNameOrHex) return '#1D9E75';
    if (colorNameOrHex.startsWith('#')) return colorNameOrHex;
    
    const found = PRESET_COLORS.find(c => c.name === colorNameOrHex.toLowerCase());
    if (found) return found.hex;
    
    const basicMapping: Record<string, string> = {
        red: '#D85A30',
        blue: '#185FA5',
        green: '#1D9E75',
        orange: '#D85A30',
        purple: '#534AB7',
        gold: '#BA7517',
        pink: '#C5376F',
        teal: '#0F766E',
        brown: '#78350F'
    };
    return basicMapping[colorNameOrHex.toLowerCase()] || '#1D9E75';
};
