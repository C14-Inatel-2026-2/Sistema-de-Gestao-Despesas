"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { categoryLabel, type Expense } from "@/types/expense";
import { calculateTotal, formatCurrency, totalsByCategory } from "@/lib/expenses";

interface ExpenseSummaryProps {
  expenses: Expense[];
}

export function ExpenseSummary({ expenses }: ExpenseSummaryProps) {
  const total = calculateTotal(expenses);
  const byCategory = totalsByCategory(expenses);
  const average = expenses.length > 0 ? total / expenses.length : 0;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Total" value={formatCurrency(total)} highlight />
        <Stat label="Despesas" value={String(expenses.length)} />
        <Stat label="Média por despesa" value={formatCurrency(average)} />
      </div>

      {byCategory.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Gastos por categoria</CardTitle>
          </CardHeader>

          <CardContent>
            <ul className="space-y-3">
              {byCategory.map(({ category, total: categoryTotal }) => {
                const percent = total > 0 ? (categoryTotal / total) * 100 : 0;

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
      ) : null}
    </div>
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
    <Card className="gap-0 py-4">
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
