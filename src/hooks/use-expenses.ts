import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect, useCallback } from 'react';
import type { Expense, Income, PlannedExpense, Priority } from '@/types/expense';

const EXPENSES_KEY = 'expenses';
const PLANNED_KEY = 'planned_expenses';
const INCOME_KEY = 'income_entries';

async function load<T>(key: string): Promise<T[]> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

async function save<T>(key: string, data: T[]): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(data));
}

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [planned, setPlanned] = useState<PlannedExpense[]>([]);
  const [income, setIncome] = useState<Income[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Load from storage on mount
  useEffect(() => {
    Promise.all([load<Expense>(EXPENSES_KEY), load<PlannedExpense>(PLANNED_KEY), load<Income>(INCOME_KEY)]).then(
      ([exp, pln, inc]) => {
        setExpenses(exp);
        setPlanned(pln);
        setIncome(inc);
        setLoaded(true);
      }
    );
  }, []);

  // Persist expenses whenever they change (skip before initial load)
  useEffect(() => {
    if (!loaded) return;
    save(EXPENSES_KEY, expenses);
  }, [expenses, loaded]);

  // Persist planned whenever they change
  useEffect(() => {
    if (!loaded) return;
    save(PLANNED_KEY, planned);
  }, [planned, loaded]);

  useEffect(() => { if (loaded) save(INCOME_KEY, income); }, [income, loaded]);

  const addExpense = useCallback((expense: Omit<Expense, 'id'>) => {
    const newExpense: Expense = { ...expense, id: Math.random().toString(36).slice(2) };
    setExpenses(prev => [newExpense, ...prev]);
  }, []);

  const deleteExpense = useCallback((id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  }, []);

  const addIncome = useCallback((entry: Omit<Income, 'id'>) => {
    setIncome(prev => [{ ...entry, id: Math.random().toString(36).slice(2) }, ...prev]);
  }, []);

  const deleteIncome = useCallback((id: string) => setIncome(prev => prev.filter(item => item.id !== id)), []);

  const addPlannedExpense = useCallback((expense: Omit<PlannedExpense, 'id'>) => {
    const newExpense: PlannedExpense = {
      ...expense,
      id: Math.random().toString(36).slice(2),
    };
    setPlanned(prev => [...prev, newExpense]);
  }, []);

  const deletePlannedExpense = useCallback((id: string) => {
    setPlanned(prev => prev.filter(e => e.id !== id));
  }, []);

  const updatePlannedPriority = useCallback((id: string, priority: Priority) => {
    setPlanned(prev => prev.map(e => (e.id === id ? { ...e, priority } : e)));
  }, []);

  return {
    expenses,
    planned,
    income,
    loaded,
    addExpense,
    deleteExpense,
    addIncome,
    deleteIncome,
    addPlannedExpense,
    deletePlannedExpense,
    updatePlannedPriority,
  };
}
