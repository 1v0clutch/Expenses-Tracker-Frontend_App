import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import { useState, useEffect, useCallback } from 'react';
import type { AppSettings, Budget, Expense, Income, PlannedExpense, Priority } from '@/types/expense';

const KEYS = { expenses: 'expenses', planned: 'planned_expenses', income: 'income_entries', budgets: 'spendly.budgets', categories: 'spendly.categories', settings: 'spendly.settings' };
const DEFAULT_CATEGORIES = ['Food & Dining', 'Transportation', 'Housing', 'Utilities', 'Healthcare', 'Entertainment', 'Shopping', 'Subscriptions', 'Savings', 'Other'];
const DEFAULT_SETTINGS: AppSettings = { currency: 'PHP', name: 'Guest', email: '', weeklyAlert: true, monthlyAlert: true, extraMoney: 0, darkMode: true, paymentMethods: ['Cash','Debit card','Credit card','Bank transfer','Apple Pay','Google Pay','PayPal','Other'], incomeSources: ['Salary','Freelance','Business','Investment','Other'] };
const migrateCategory = (value: string) => ({ Food: 'Food & Dining', Transport: 'Transportation', Health: 'Healthcare' }[value] ?? value);
async function load<T>(key: string, fallback: T): Promise<T> { try { const raw = await AsyncStorage.getItem(key); return raw ? JSON.parse(raw) as T : fallback; } catch { return fallback; } }
async function save<T>(key: string, data: T): Promise<void> { try { await AsyncStorage.setItem(key, JSON.stringify(data)); } catch { /* Storage may be unavailable temporarily. */ } }
const makeId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
function removeReceipt(uri?: string) { if (uri?.startsWith('file://')) void FileSystem.deleteAsync(uri, { idempotent: true }).catch(() => {}); }

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [planned, setPlanned] = useState<PlannedExpense[]>([]);
  const [income, setIncome] = useState<Income[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([
      load<Expense[]>(KEYS.expenses, []), load<PlannedExpense[]>(KEYS.planned, []),
      load<Income[]>(KEYS.income, []), load<Budget[]>(KEYS.budgets, []),
      load<string[]>(KEYS.categories, DEFAULT_CATEGORIES), load<AppSettings>(KEYS.settings, DEFAULT_SETTINGS),
    ]).then(([exp, plans, incomes, limits, cats, prefs]) => {
      setExpenses(exp.map(item => ({ ...item, category: migrateCategory(item.category) }))); setPlanned(plans.map(item => ({ ...item, category: migrateCategory(item.category) }))); setIncome(incomes); setBudgets(limits.map(item => ({ ...item, category: migrateCategory(item.category) }))); setCategories(cats.map(migrateCategory)); setSettings({ ...DEFAULT_SETTINGS, ...prefs }); setLoaded(true);
    });
  }, []);

  useEffect(() => { if (!loaded) return; void save(KEYS.expenses, expenses); }, [expenses, loaded]);
  useEffect(() => { if (!loaded) return; void save(KEYS.planned, planned); }, [planned, loaded]);
  useEffect(() => { if (!loaded) return; void save(KEYS.income, income); }, [income, loaded]);
  useEffect(() => { if (!loaded) return; void save(KEYS.budgets, budgets); }, [budgets, loaded]);
  useEffect(() => { if (!loaded) return; void save(KEYS.categories, categories); }, [categories, loaded]);
  useEffect(() => { if (!loaded) return; void save(KEYS.settings, settings); }, [settings, loaded]);

  const addExpense = useCallback((item: Omit<Expense, 'id'>) => setExpenses(prev => [{ ...item, id: makeId() }, ...prev]), []);
  const updateExpense = useCallback((id: string, item: Omit<Expense, 'id'>) => { const old = expenses.find(e => e.id === id); if (old?.receiptUri && old.receiptUri !== item.receiptUri) removeReceipt(old.receiptUri); setExpenses(prev => prev.map(e => e.id === id ? { ...item, id } : e)); }, [expenses]);
  const deleteExpense = useCallback((id: string) => { removeReceipt(expenses.find(e => e.id === id)?.receiptUri); setExpenses(prev => prev.filter(e => e.id !== id)); }, [expenses]);
  const addIncome = useCallback((item: Omit<Income, 'id'>) => setIncome(prev => [{ ...item, id: makeId() }, ...prev]), []);
  const updateIncome = useCallback((id: string, item: Omit<Income, 'id'>) => setIncome(prev => prev.map(e => e.id === id ? { ...item, id } : e)), []);
  const deleteIncome = useCallback((id: string) => setIncome(prev => prev.filter(item => item.id !== id)), []);
  const addPlannedExpense = useCallback((item: Omit<PlannedExpense, 'id'>) => setPlanned(prev => [...prev, { ...item, id: makeId() }]), []);
  const updatePlannedExpense = useCallback((id: string, item: Omit<PlannedExpense, 'id'>) => setPlanned(prev => prev.map(e => e.id === id ? { ...item, id } : e)), []);
  const deletePlannedExpense = useCallback((id: string) => setPlanned(prev => prev.filter(e => e.id !== id)), []);
  const updatePlannedPriority = useCallback((id: string, priority: Priority) => setPlanned(prev => prev.map(e => e.id === id ? { ...e, priority } : e)), []);
  const clearFinanceData = useCallback(() => { expenses.forEach(e => removeReceipt(e.receiptUri)); setExpenses([]); setPlanned([]); setIncome([]); setBudgets([]); }, [expenses]);
  const saveBudget = useCallback((category: string, limit: number) => setBudgets(prev => [...prev.filter(b => b.category !== category), { category, limit: Math.max(0, limit) }]), []);
  const deleteBudget = useCallback((category: string) => setBudgets(prev => prev.filter(b => b.category !== category)), []);

  return { expenses, planned, income, budgets, categories, settings, loaded, setSettings, setCategories, addExpense, updateExpense, deleteExpense, addIncome, updateIncome, deleteIncome, addPlannedExpense, updatePlannedExpense, deletePlannedExpense, updatePlannedPriority, saveBudget, deleteBudget, clearFinanceData };
}







