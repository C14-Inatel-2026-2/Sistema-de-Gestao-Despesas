"use client";

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
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/60">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Gastos por categoria
          </h2>

          <ul className="mt-4 space-y-3">
            {byCategory.map(({ category, total: categoryTotal }) => {
              const percent = total > 0 ? (categoryTotal / total) * 100 : 0;

              return (
                <li key={category}>
                  <div className="flex items-baseline justify-between text-sm">
                    <span className="text-slate-700 dark:text-slate-300">
                      {categoryLabel(category)}
                    </span>
                    <span className="font-medium tabular-nums text-slate-900 dark:text-slate-100">
                      {formatCurrency(categoryTotal)}
                      <span className="ml-2 text-xs font-normal text-slate-500 dark:text-slate-400">
                        {percent.toFixed(0)}%
                      </span>
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
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
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/60">
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
      <p
        className={`mt-1 text-xl font-semibold tabular-nums ${
          highlight
            ? "text-emerald-600 dark:text-emerald-400"
            : "text-slate-900 dark:text-slate-100"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
