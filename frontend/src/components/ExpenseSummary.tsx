"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { categoryLabel, type Expense } from "@/types/expense";
import {
  calculateAverage,
  calculatePercent,
  calculateTotal,
  formatCurrency,
  totalsByCategory,
} from "@/lib/expenses";
import { cn } from "@/lib/utils";

interface ExpenseSummaryProps {
  expenses: Expense[];
  className?: string;
}

export function ExpenseSummary({ expenses, className }: ExpenseSummaryProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <SummaryStats expenses={expenses} />
      <CategoryBreakdown expenses={expenses} />
    </div>
  );
}

export function SummaryStats({ expenses, className }: ExpenseSummaryProps) {
  return (
    <div className={cn("grid gap-3 sm:grid-cols-3", className)}>
      <Stat label="Total" value={formatCurrency(calculateTotal(expenses))} highlight />
      <Stat label="Despesas" value={String(expenses.length)} />
      <Stat label="Média por despesa" value={formatCurrency(calculateAverage(expenses))} />
    </div>
  );
}

export function CategoryBreakdown({ expenses, className }: ExpenseSummaryProps) {
  const total = calculateTotal(expenses);
  const byCategory = totalsByCategory(expenses);

  if (byCategory.length === 0) return null;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Gastos por categoria</CardTitle>
      </CardHeader>

      <CardContent>
        <ul className="space-y-3">
          {byCategory.map(({ category, total: categoryTotal }) => {
            const percent = calculatePercent(categoryTotal, total);

            return (
              <li key={category}>
                <div className="flex items-baseline justify-between text-sm">
                  <span>{categoryLabel(category)}</span>
                  <span className="font-medium tabular-nums">
                    {formatCurrency(categoryTotal)}
                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                      {percent.toFixed(0)}%
                    </span>
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}

function Stat({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <Card className="gap-0 py-3">
      <CardContent>
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p
          className={`mt-1 text-xl font-semibold tabular-nums ${
            highlight ? "text-primary" : ""
          }`}
        >
          {value}
        </p>
      </CardContent>
    </Card>
  );
}
