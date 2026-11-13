"use client";

import { useMemo, useState } from "react";
import { ExpenseFiltersBar } from "@/components/ExpenseFilters";
import { ExpenseForm } from "@/components/ExpenseForm";
import { ExpenseList } from "@/components/ExpenseList";
import { CategoryBreakdown, SummaryStats } from "@/components/ExpenseSummary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useExpenses } from "@/hooks/useExpenses";
import { filterExpenses } from "@/lib/expenses";
import { EMPTY_FILTERS, type ExpenseFilters } from "@/types/expense";

export default function Home() {
  const { expenses, addExpense, removeExpense } = useExpenses();
  const [filters, setFilters] = useState<ExpenseFilters>(EMPTY_FILTERS);

  const visible = useMemo(
    () => filterExpenses(expenses, filters),
    [expenses, filters],
  );

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Gestão de Despesas</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Cadastre, filtre e acompanhe seus gastos.
        </p>
      </header>

      <SummaryStats expenses={visible} className="mt-6" />

      <div className="mt-4 grid gap-4 lg:grid-cols-[360px_1fr] lg:items-start">
        <aside className="space-y-4 lg:sticky lg:top-6">
          <ExpenseForm onSubmit={addExpense} />

          <Card>
            <CardHeader>
              <CardTitle>Filtros</CardTitle>
            </CardHeader>
            <CardContent className="@container">
              <ExpenseFiltersBar filters={filters} onChange={setFilters} />
            </CardContent>
          </Card>
        </aside>

        <section className="space-y-4">
          <ExpenseList
            expenses={visible}
            totalCount={expenses.length}
            onDelete={removeExpense}
          />

          <CategoryBreakdown expenses={visible} />
        </section>
      </div>
    </main>
  );
}
