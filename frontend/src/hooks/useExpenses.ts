"use client";

import { useCallback, useSyncExternalStore } from "react";
import { MOCK_EXPENSES, resolveExpenses, STORAGE_KEY } from "@/data/mock";
import { createExpense, sortByDateDesc } from "@/lib/expenses";
import type { Expense, ExpenseInput } from "@/types/expense";

const EMPTY: Expense[] = [];

const listeners = new Set<() => void>();

/**
 * `useSyncExternalStore` exige que o snapshot seja estável entre renders, então
 * guardamos o último texto lido do localStorage e só reprocessamos quando ele muda.
 */
let cachedRaw: string | null = null;
let cachedExpenses: Expense[] = EMPTY;
let mockApplied = false;

function readStore(): Expense[] {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return EMPTY;
  }

  // Primeira visita: grava o mock para as próximas leituras e recargas.
  if (raw === null && !mockApplied) {
    mockApplied = true;
    try {
      const mockRaw = JSON.stringify(MOCK_EXPENSES);
      window.localStorage.setItem(STORAGE_KEY, mockRaw);
      cachedRaw = mockRaw;
      cachedExpenses = MOCK_EXPENSES;
      return cachedExpenses;
    } catch {
      cachedRaw = null;
      cachedExpenses = MOCK_EXPENSES;
      return cachedExpenses;
    }
  }

  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedExpenses = resolveExpenses(raw);
  }
  return cachedExpenses;
}

function writeStore(expenses: Expense[]) {
  cachedExpenses = expenses;
  try {
    cachedRaw = JSON.stringify(expenses);
    window.localStorage.setItem(STORAGE_KEY, cachedRaw);
  } catch {
    // Sem persistência, o app continua funcionando em memória.
  }
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // Mantém as abas abertas em sincronia.
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

/** No servidor não existe localStorage, então a primeira renderização é sempre vazia. */
function serverSnapshot(): Expense[] {
  return EMPTY;
}

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

  const removeExpense = useCallback((id: string) => {
    writeStore(readStore().filter((expense) => expense.id !== id));
  }, []);

  return { expenses, addExpense, removeExpense };
}
