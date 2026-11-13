"use client";

import { useCallback, useSyncExternalStore } from "react";
import { createExpense, replaceExpense, sortByDateDesc } from "@/lib/expenses";
import { readStore, serverSnapshot, subscribe, writeStore } from "@/lib/expenseStore";
import type { ExpenseInput } from "@/types/expense";

/**
 * Estado das despesas persistido em localStorage.
 * Será substituído por chamadas à API Python quando o backend existir.
 */
export function useExpenses() {
  const expenses = useSyncExternalStore(subscribe, readStore, serverSnapshot);

  const addExpense = useCallback((input: ExpenseInput) => {
    const expense = createExpense(input, crypto.randomUUID());
    writeStore(sortByDateDesc([expense, ...readStore()]));
  }, []);

  const updateExpense = useCallback((id: string, input: ExpenseInput) => {
    writeStore(replaceExpense(readStore(), id, input));
  }, []);

  const removeExpense = useCallback((id: string) => {
    writeStore(readStore().filter((expense) => expense.id !== id));
  }, []);

  return { expenses, addExpense, updateExpense, removeExpense };
}
