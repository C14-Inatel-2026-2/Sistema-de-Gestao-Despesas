import { MOCK_EXPENSES, resolveExpenses, STORAGE_KEY } from "@/data/mock";
import type { Expense } from "@/types/expense";

const EMPTY: Expense[] = [];

const listeners = new Set<() => void>();

/**
 * `useSyncExternalStore` exige que o snapshot seja estável entre renders, então
 * guardamos o último texto lido do localStorage e só reprocessamos quando ele muda.
 */
let cachedRaw: string | null = null;
let cachedExpenses: Expense[] = EMPTY;
let mockApplied = false;

function trySave(raw: string): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, raw);
    return true;
  } catch {
    return false;
  }
}

function applyFirstVisitMock(): Expense[] {
  mockApplied = true;
  const mockRaw = JSON.stringify(MOCK_EXPENSES);
  cachedRaw = trySave(mockRaw) ? mockRaw : null;
  cachedExpenses = MOCK_EXPENSES;
  return cachedExpenses;
}

export function readStore(): Expense[] {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return EMPTY;
  }

  if (raw === null && !mockApplied) {
    return applyFirstVisitMock();
  }

  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedExpenses = resolveExpenses(raw);
  }
  return cachedExpenses;
}

export function writeStore(expenses: Expense[]) {
  cachedExpenses = expenses;
  cachedRaw = JSON.stringify(expenses);
  trySave(cachedRaw);
  for (const listener of listeners) listener();
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  // Mantém as abas abertas em sincronia.
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

/** No servidor não existe localStorage, então a primeira renderização é sempre vazia. */
export function serverSnapshot(): Expense[] {
  return EMPTY;
}
