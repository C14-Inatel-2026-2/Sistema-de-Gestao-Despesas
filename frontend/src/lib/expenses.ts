import {
  isExpenseCategory,
  type Expense,
  type ExpenseCategory,
  type ExpenseErrors,
  type ExpenseFilters,
  type ExpenseInput,
} from "@/types/expense";

export const MAX_DESCRIPTION_LENGTH = 60;
export const MIN_DESCRIPTION_LENGTH = 3;
export const MAX_AMOUNT = 1_000_000;

/**
 * Converte o valor digitado pelo usuário em número.
 * Aceita tanto o formato brasileiro ("1.234,56") quanto o americano ("1234.56").
 * Retorna `null` quando o texto não representa um número válido.
 */
export function parseAmount(raw: string): number | null {
  const text = raw.trim();
  if (text === "") return null;

  const hasComma = text.includes(",");
  const normalized = hasComma
    ? text.replace(/\./g, "").replace(",", ".")
    : text;

  if (!/^-?\d+(\.\d+)?$/.test(normalized)) return null;

  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
}

/** Arredonda para duas casas evitando o erro de ponto flutuante (0.1 + 0.2). */
export function roundToCents(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function isValidIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00`);
  return !Number.isNaN(date.getTime()) && value === toIsoDate(date);
}

export function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function validateDescription(raw: string): string | undefined {
  const description = raw.trim();
  if (description.length < MIN_DESCRIPTION_LENGTH) {
    return `A descrição precisa ter pelo menos ${MIN_DESCRIPTION_LENGTH} caracteres.`;
  }
  if (description.length > MAX_DESCRIPTION_LENGTH) {
    return `A descrição pode ter no máximo ${MAX_DESCRIPTION_LENGTH} caracteres.`;
  }
  return undefined;
}

function validateAmount(raw: string): string | undefined {
  const amount = parseAmount(raw);
  if (amount === null) return "Informe um valor numérico válido.";
  if (amount <= 0) return "O valor deve ser maior que zero.";
  if (amount > MAX_AMOUNT) {
    return `O valor deve ser menor que ${formatCurrency(MAX_AMOUNT)}.`;
  }
  return undefined;
}

function validateCategory(value: string): string | undefined {
  if (!isExpenseCategory(value)) return "Selecione uma categoria.";
  return undefined;
}

function validateDate(value: string, today: string): string | undefined {
  if (!isValidIsoDate(value)) return "Informe uma data válida.";
  if (value > today) return "A data não pode estar no futuro.";
  return undefined;
}

/**
 * Valida os dados de uma despesa vindos do formulário.
 * `today` é injetado para manter a função pura e testável.
 */
export function validateExpense(
  input: ExpenseInput,
  today: string = toIsoDate(new Date()),
): ExpenseErrors {
  const errors: ExpenseErrors = {};

  const descriptionError = validateDescription(input.description);
  if (descriptionError) errors.description = descriptionError;

  const amountError = validateAmount(input.amount);
  if (amountError) errors.amount = amountError;

  const categoryError = validateCategory(input.category);
  if (categoryError) errors.category = categoryError;

  const dateError = validateDate(input.date, today);
  if (dateError) errors.date = dateError;

  return errors;
}

export function isValid(errors: ExpenseErrors): boolean {
  return Object.keys(errors).length === 0;
}

/** Converte um input já validado em uma despesa. Lança se o input for inválido. */
export function createExpense(input: ExpenseInput, id: string): Expense {
  const amount = parseAmount(input.amount);
  if (amount === null || !isExpenseCategory(input.category)) {
    throw new Error("Não é possível criar uma despesa a partir de dados inválidos.");
  }

  return {
    id,
    description: input.description.trim(),
    amount: roundToCents(amount),
    category: input.category,
    date: input.date,
  };
}

/** Converte uma despesa salva de volta para o formato do formulário (usado na edição). */
export function expenseToInput(expense: Expense): ExpenseInput {
  return {
    description: expense.description,
    amount: expense.amount.toFixed(2).replace(".", ","),
    category: expense.category,
    date: expense.date,
  };
}

/**
 * Substitui a despesa com o `id` informado pelos novos dados, mantendo a ordenação por data.
 * Se o id não existir, devolve a lista sem alterações.
 */
export function replaceExpense(
  expenses: readonly Expense[],
  id: string,
  input: ExpenseInput,
): Expense[] {
  if (!expenses.some((expense) => expense.id === id)) return [...expenses];
  const updated = createExpense(input, id);
  return sortByDateDesc(expenses.map((expense) => (expense.id === id ? updated : expense)));
}

export function calculateTotal(expenses: readonly Expense[]): number {
  return roundToCents(expenses.reduce((total, expense) => total + expense.amount, 0));
}

export function filterExpenses(
  expenses: readonly Expense[],
  filters: ExpenseFilters,
): Expense[] {
  return expenses.filter((expense) => {
    if (filters.category !== "todas" && expense.category !== filters.category) {
      return false;
    }
    if (filters.from && expense.date < filters.from) return false;
    if (filters.to && expense.date > filters.to) return false;
    return true;
  });
}

/** Total por categoria, ordenado do maior para o menor. Categorias sem gasto ficam de fora. */
export function totalsByCategory(
  expenses: readonly Expense[],
): { category: ExpenseCategory; total: number }[] {
  const totals = new Map<ExpenseCategory, number>();

  for (const expense of expenses) {
    totals.set(expense.category, (totals.get(expense.category) ?? 0) + expense.amount);
  }

  return [...totals.entries()]
    .map(([category, total]) => ({ category, total: roundToCents(total) }))
    .sort((a, b) => b.total - a.total);
}

/** Ordena por data (mais recente primeiro) sem mutar o array original. */
export function sortByDateDesc(expenses: readonly Expense[]): Expense[] {
  return [...expenses].sort((a, b) => b.date.localeCompare(a.date));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
}
