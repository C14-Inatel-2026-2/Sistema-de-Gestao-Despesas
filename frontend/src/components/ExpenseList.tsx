"use client";

import { categoryLabel, type Expense } from "@/types/expense";
import { formatCurrency, formatDate } from "@/lib/expenses";

interface ExpenseListProps {
  expenses: Expense[];
  onDelete: (id: string) => void;
}

export function ExpenseList({ expenses, onDelete }: ExpenseListProps) {
  if (expenses.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-slate-300 px-4 py-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
        Nenhuma despesa encontrada para os filtros selecionados.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
      {expenses.map((expense) => (
        <li
          key={expense.id}
          className="flex items-center gap-4 bg-white px-4 py-3 dark:bg-slate-900/60"
        >
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
              {expense.description}
            </p>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {categoryLabel(expense.category)} · {formatDate(expense.date)}
            </p>
          </div>

          <span className="shrink-0 text-sm font-semibold tabular-nums text-slate-900 dark:text-slate-100">
            {formatCurrency(expense.amount)}
          </span>

          <button
            type="button"
            onClick={() => onDelete(expense.id)}
            aria-label={`Excluir despesa ${expense.description}`}
            className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-slate-500 transition hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-950/40 dark:hover:text-red-400"
          >
            Excluir
          </button>
        </li>
      ))}
    </ul>
  );
}
