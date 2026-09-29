export type Category = string;
export type Priority = 'High' | 'Medium' | 'Low';
export interface Expense { id: string; name: string; amount: number; date: string; category: Category; paymentMethod?: string; notes?: string; receiptUri?: string }
export interface PlannedExpense { id: string; name: string; amount: number; category: Category; priority: Priority; dueDate?: string; savedAmount?: number }
export interface Income { id: string; name: string; amount: number; date: string; source: string }
export interface Budget { category: string; limit: number }
export interface AppSettings { currency: string; name: string; email: string; weeklyAlert: boolean; monthlyAlert: boolean; extraMoney: number; darkMode: boolean; paymentMethods?: string[]; incomeSources?: string[] }
export const CATEGORIES: Category[] = ['Food & Dining', 'Transportation', 'Housing', 'Utilities', 'Healthcare', 'Entertainment', 'Shopping', 'Subscriptions', 'Savings', 'Other'];
export const PRIORITIES: Priority[] = ['High', 'Medium', 'Low'];
export const PRIORITY_ORDER: Record<Priority, number> = { High: 0, Medium: 1, Low: 2 };
export const PAYMENT_METHODS = ['Cash', 'Debit card', 'Credit card', 'Bank transfer', 'Apple Pay', 'Google Pay', 'PayPal', 'Other'];


