export const EXPENSE_CATEGORIES = [
  { id: "alimentacao", label: "Alimentação" },
  { id: "transporte", label: "Transporte" },
  { id: "moradia", label: "Moradia" },
  { id: "saude", label: "Saúde" },
  { id: "educacao", label: "Educação" },
  { id: "lazer", label: "Lazer" },
  { id: "outros", label: "Outros" },
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number]["id"];

export interface Expense {
  id: string;
  description: string;
  /** Valor em reais, sempre positivo. */
  amount: number;
  category: ExpenseCategory;
  /** Data no formato ISO `YYYY-MM-DD`. */
  date: string;
}

/** Dados crus vindos do formulário, antes da validação. */
export interface ExpenseInput {
  description: string;
  amount: string;
  category: string;
  date: string;
}

export type ExpenseErrors = Partial<Record<keyof ExpenseInput, string>>;

/** Valor do filtro de categoria que significa "sem filtro". */
export const ALL_CATEGORIES = "todas";

export interface ExpenseFilters {
  category: ExpenseCategory | typeof ALL_CATEGORIES;
  from: string;
  to: string;
}

export const EMPTY_FILTERS: ExpenseFilters = { category: ALL_CATEGORIES, from: "", to: "" };

export function categoryLabel(id: ExpenseCategory): string {
  return EXPENSE_CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

export function isExpenseCategory(value: string): value is ExpenseCategory {
  return EXPENSE_CATEGORIES.some((c) => c.id === value);
}
