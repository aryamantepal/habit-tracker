import { format } from 'date-fns';
import type { Completion, Goal, HabitDefinition, JournalData } from './types';

const STORAGE_KEY = 'lockin-journal-v1';
const VERSION = 1;

const emptyJournal = (): JournalData => ({ habits: [], completions: [], monthlyGoals: [] });

const isRecord = (v: unknown): v is Record<string, unknown> =>
    typeof v === 'object' && v !== null && !Array.isArray(v);

const str = (v: unknown): v is string => typeof v === 'string';

// Keeps well-formed entries and drops the rest, so one bad row can't lose the journal.
function parseHabit(v: unknown): HabitDefinition | null {
    if (!isRecord(v) || !str(v.id) || !str(v.name)) return null;
    return {
        id: v.id,
        name: v.name,
        color: str(v.color) ? v.color : 'green',
        createdAt: str(v.createdAt) ? v.createdAt : new Date().toISOString(),
        archivedAt: str(v.archivedAt) ? v.archivedAt : null,
    };
}

function parseCompletion(v: unknown): Completion | null {
    if (!isRecord(v) || !str(v.id) || !str(v.habitId) || !str(v.date)) return null;
    return { id: v.id, habitId: v.habitId, date: v.date };
}

function parseGoal(v: unknown): Goal | null {
    if (!isRecord(v) || !str(v.id) || !str(v.title)) return null;
    return {
        id: v.id,
        title: v.title,
        month: str(v.month) ? v.month : '',
        completed: v.completed === true,
    };
}

function parseList<T>(v: unknown, parseItem: (item: unknown) => T | null): T[] | null {
    if (!Array.isArray(v)) return null;
    return v.map(parseItem).filter((item): item is T => item !== null);
}

// Returns null when the value is not journal-shaped at all.
function parseData(v: unknown): JournalData | null {
    if (!isRecord(v)) return null;
    const habits = parseList(v.habits, parseHabit);
    const completions = parseList(v.completions, parseCompletion);
    const monthlyGoals = parseList(v.monthlyGoals, parseGoal);
    if (!habits || !completions || !monthlyGoals) return null;
    return { habits, completions, monthlyGoals };
}

export function loadJournal(): JournalData {
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return emptyJournal();
        const parsed: unknown = JSON.parse(raw);
        return (isRecord(parsed) && parseData(parsed.data)) || emptyJournal();
    } catch {
        return emptyJournal();
    }
}

export function saveJournal(data: JournalData): void {
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: VERSION, data }));
    } catch {
        // Private mode or quota exceeded; the in-memory journal keeps working.
    }
}

export function exportJournal(data: JournalData): void {
    const json = JSON.stringify({ version: VERSION, data }, null, 2);
    const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `lockin-journal-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}

// Accepts an exported file ({ version, data }) or a bare journal object.
export function parseJournalImport(text: string): JournalData {
    let parsed: unknown;
    try {
        parsed = JSON.parse(text);
    } catch {
        throw new Error('That file is not valid JSON.');
    }
    const candidate = isRecord(parsed) && 'data' in parsed ? parsed.data : parsed;
    const data = parseData(candidate);
    if (!data) {
        throw new Error('That file is not a Lock-in journal backup (expected habits, completions and monthlyGoals lists).');
    }
    return data;
}
