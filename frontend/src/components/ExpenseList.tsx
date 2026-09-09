"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { categoryLabel, type Expense } from "@/types/expense";
import { formatCurrency, formatDate } from "@/lib/expenses";

interface ExpenseListProps {
  expenses: Expense[];
  totalCount: number;
  onDelete: (id: string) => void;
}

export function ExpenseList({ expenses, totalCount, onDelete }: ExpenseListProps) {
  if (expenses.length === 0) {
    const message =
      totalCount === 0
        ? "Nenhuma despesa cadastrada ainda. Use o formulário ao lado para adicionar a primeira."
        : "Nenhuma despesa encontrada para os filtros selecionados.";

    return (
      <p className="rounded-xl border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
        {message}
      </p>
    );
  }

  return (
    <ul className="divide-y overflow-hidden rounded-xl border bg-card">
      {expenses.map((expense) => (
        <li key={expense.id} className="flex items-center gap-4 px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{expense.description}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {categoryLabel(expense.category)} · {formatDate(expense.date)}
            </p>
          </div>

          <span className="shrink-0 text-sm font-semibold tabular-nums">
            {formatCurrency(expense.amount)}
          </span>

          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => onDelete(expense.id)}
            aria-label={`Excluir despesa ${expense.description}`}
            className="shrink-0 text-muted-foreground hover:text-destructive"
          >
            <Trash2 />
          </Button>
        </li>
      ))}
    </ul>
  );
}
