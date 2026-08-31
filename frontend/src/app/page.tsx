"use client";

import { useMemo, useState } from "react";
import { ExpenseFiltersBar } from "@/components/ExpenseFilters";
import { ExpenseForm } from "@/components/ExpenseForm";
import { ExpenseList } from "@/components/ExpenseList";
import { ExpenseSummary } from "@/components/ExpenseSummary";
import { useExpenses } from "@/hooks/useExpenses";
import { filterExpenses } from "@/lib/expenses";
import type { ExpenseFilters } from "@/types/expense";

const NO_FILTERS: ExpenseFilters = { category: "todas", from: "", to: "" };

export default function Home() {
  const { expenses, addExpense, removeExpense } = useExpenses();
  const [filters, setFilters] = useState<ExpenseFilters>(NO_FILTERS);

  const visible = useMemo(
    () => filterExpenses(expenses, filters),
    [expenses, filters],
  );

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          Gestão de Despesas
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Cadastre, filtre e acompanhe seus gastos.
        </p>
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-[380px_1fr] lg:items-start">
        <ExpenseForm onSubmit={addExpense} />

        <section className="space-y-6">
          <ExpenseSummary expenses={visible} />

          <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/60">
            <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-slate-100">
              Filtros
            </h2>
            <ExpenseFiltersBar filters={filters} onChange={setFilters} />
          </div>

          <ExpenseList expenses={visible} onDelete={removeExpense} />
        </section>
      </div>
    </main>
  );
}
