import { isExpenseCategory, type Expense } from "@/types/expense";

export const STORAGE_KEY = "gestao-despesas:expenses";

const EMPTY: Expense[] = [];

export const MOCK_EXPENSES: Expense[] = [
  {
    id: "mock-1",
    description: "Supermercado",
    amount: 248.9,
    category: "alimentacao",
    date: "2026-08-28",
  },
  {
    id: "mock-2",
    description: "Combustível",
    amount: 180,
    category: "transporte",
    date: "2026-08-25",
  },
  {
    id: "mock-3",
    description: "Aluguel",
    amount: 1500,
    category: "moradia",
    date: "2026-08-05",
  },
  {
    id: "mock-4",
    description: "Farmácia",
    amount: 67.4,
    category: "saude",
    date: "2026-08-20",
  },
  {
    id: "mock-5",
    description: "Curso online",
    amount: 99.9,
    category: "educacao",
    date: "2026-08-12",
  },
  {
    id: "mock-6",
    description: "Cinema",
    amount: 48,
    category: "lazer",
    date: "2026-08-22",
  },
  {
    id: "mock-7",
    description: "Assinatura de software",
    amount: 39.9,
    category: "outros",
    date: "2026-08-15",
  },
  {
    id: "mock-8",
    description: "Almoço no restaurante",
    amount: 52.5,
    category: "alimentacao",
    date: "2026-08-30",
  },
];

/** Descarta qualquer coisa no localStorage que não tenha o formato de despesa. */
export function parseStored(raw: string): Expense[] {
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

/**
 * Decide o que carregar a partir do valor bruto do localStorage.
 * - `null` (chave ausente) → mock da primeira visita
 * - string (mesmo `"[]"`) → parse; não reaplica o mock
 */
export function resolveExpenses(raw: string | null): Expense[] {
  if (raw === null) return MOCK_EXPENSES;
  return parseStored(raw);
}
