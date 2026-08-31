"use client";

import { useCallback, useSyncExternalStore } from "react";
import { isExpenseCategory, type Expense, type ExpenseInput } from "@/types/expense";
import { createExpense, sortByDateDesc } from "@/lib/expenses";

const STORAGE_KEY = "gestao-despesas:expenses";
const EMPTY: Expense[] = [];

/** Descarta qualquer coisa no localStorage que não tenha o formato de despesa. */
function parseStored(raw: string): Expense[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return EMPTY;
  }
  if (!Array.isArray(parsed)) return EMPTY;

  return parsed.filter((item): item is Expense => {
    if (typeof item !== "object" || item === null) return false;
    const candidate = item as Record<string, unknown>;
    return (
      typeof candidate.id === "string" &&
      typeof candidate.description === "string" &&
      typeof candidate.amount === "number" &&
      typeof candidate.date === "string" &&
      typeof candidate.category === "string" &&
      isExpenseCategory(candidate.category)
    );
  });
}

const listeners = new Set<() => void>();

/**
 * `useSyncExternalStore` exige que o snapshot seja estável entre renders, então
 * guardamos o último texto lido do localStorage e só reprocessamos quando ele muda.
 */
let cachedRaw: string | null = null;
let cachedExpenses: Expense[] = EMPTY;

function readStore(): Expense[] {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return EMPTY;
  }

  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedExpenses = raw ? parseStored(raw) : EMPTY;
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
