import { createContext, useContext, type ReactNode } from "react";
import { useExpenses } from "@/hooks/use-expenses";

type ExpensesContextValue = ReturnType<typeof useExpenses>;

const ExpensesContext = createContext<ExpensesContextValue | null>(null);

export function ExpensesProvider({ children }: { children: ReactNode }) {
  const value = useExpenses();
  return (
    <ExpensesContext.Provider value={value}>
      {children}
    </ExpensesContext.Provider>
  );
}

export function useExpensesContext(): ExpensesContextValue {
  const ctx = useContext(ExpensesContext);
  if (!ctx)
    throw new Error("useExpensesContext must be used inside ExpensesProvider");
  return ctx;
}
