"use client";

import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { categoryLabel, type Expense } from "@/types/expense";
import { formatCurrency, formatDate } from "@/lib/expenses";

interface ExpenseListProps {
  expenses: Expense[];
  totalCount: number;
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
  /** Id da despesa em edição, destacada na lista. */
  editingId?: string | null;
}

export function ExpenseList({
  expenses,
  totalCount,
  onEdit,
  onDelete,
  editingId,
}: ExpenseListProps) {
  if (expenses.length === 0) {
    const message =
      totalCount === 0
        ? "Nenhuma despesa cadastrada ainda. Use o formulário ao lado para adicionar a primeira."
        : "Nenhuma despesa encontrada para os filtros selecionados.";

    return (
      <p className="rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
        {message}
      </p>
    );
  }

  return (
    <ul className="divide-y overflow-hidden rounded-xl border bg-card">
      {expenses.map((expense) => (
        <li
          key={expense.id}
          aria-current={expense.id === editingId ? "true" : undefined}
          className={cn(
            "flex items-center gap-4 px-4 py-3",
            expense.id === editingId && "bg-muted",
          )}
        >
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{expense.description}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {categoryLabel(expense.category)} · {formatDate(expense.date)}
            </p>
          </div>

          <span className="shrink-0 text-sm font-semibold tabular-nums">
            {formatCurrency(expense.amount)}
          </span>

          <div className="flex shrink-0 items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => onEdit(expense)}
              aria-label={`Editar despesa ${expense.description}`}
              className="text-muted-foreground hover:text-foreground"
            >
              <Pencil />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => onDelete(expense.id)}
              aria-label={`Excluir despesa ${expense.description}`}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 />
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}
