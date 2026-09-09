"use client";

import { useMemo, useState } from "react";
import { ExpenseFiltersBar } from "@/components/ExpenseFilters";
import { ExpenseForm } from "@/components/ExpenseForm";
import { ExpenseList } from "@/components/ExpenseList";
import { ExpenseSummary } from "@/components/ExpenseSummary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
        <h1 className="text-2xl font-semibold tracking-tight">Gestão de Despesas</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Cadastre, filtre e acompanhe seus gastos.
        </p>
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-[380px_1fr] lg:items-start">
        <ExpenseForm onSubmit={addExpense} />

        <section className="space-y-6">
          <ExpenseSummary expenses={visible} />

          <Card>
            <CardHeader>
              <CardTitle>Filtros</CardTitle>
            </CardHeader>
            <CardContent>
              <ExpenseFiltersBar filters={filters} onChange={setFilters} />
            </CardContent>
          </Card>

          <ExpenseList
            expenses={visible}
            totalCount={expenses.length}
            onDelete={removeExpense}
          />
        </section>
      </div>
    </main>
  );
}
