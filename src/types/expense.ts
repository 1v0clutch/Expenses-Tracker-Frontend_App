export type Category = string;

export type Priority = 'High' | 'Medium' | 'Low';

export interface Expense {
  id: string;
  name: string;
  amount: number;
  date: string;       // ISO date string e.g. "2026-09-09"
  category: Category;
  paymentMethod?: string;
  notes?: string;
}

export interface Income { id: string; name: string; amount: number; date: string; source: string }

export interface PlannedExpense {
  id: string;
  name: string;
  amount: number;
  category: Category;
  priority: Priority;
  dueDate?: string;   // ISO date string, optional
}

export const CATEGORIES: Category[] = [
  'Food',
  'Transport',
  'Utilities',
  'Health',
  'Entertainment',
  'Other',
];

export const PRIORITIES: Priority[] = ['High', 'Medium', 'Low'];

export const PRIORITY_ORDER: Record<Priority, number> = {
  High: 0,
  Medium: 1,
  Low: 2,
};
