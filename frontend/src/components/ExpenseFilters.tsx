"use client";

import { EXPENSE_CATEGORIES, type ExpenseFilters } from "@/types/expense";

const controlClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100";

interface ExpenseFiltersBarProps {
  filters: ExpenseFilters;
  onChange: (filters: ExpenseFilters) => void;
}

export function ExpenseFiltersBar({ filters, onChange }: ExpenseFiltersBarProps) {
  const hasFilters =
    filters.category !== "todas" || filters.from !== "" || filters.to !== "";

  return (
    <div className="grid gap-3 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end">
      <div>
        <label
          htmlFor="filter-category"
          className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400"
        >
          Categoria
        </label>
        <select
          id="filter-category"
          value={filters.category}
          onChange={(e) =>
            onChange({ ...filters, category: e.target.value as ExpenseFilters["category"] })
          }
          className={controlClass}
        >
          <option value="todas">Todas</option>
          {EXPENSE_CATEGORIES.map((category) => (
            <option key={category.id} value={category.id}>
              {category.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="filter-from"
          className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400"
        >
          De
        </label>
        <input
          id="filter-from"
          type="date"
          value={filters.from}
          onChange={(e) => onChange({ ...filters, from: e.target.value })}
          className={controlClass}
        />
      </div>

      <div>
        <label
          htmlFor="filter-to"
          className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400"
        >
          Até
        </label>
        <input
          id="filter-to"
          type="date"
          value={filters.to}
          onChange={(e) => onChange({ ...filters, to: e.target.value })}
          className={controlClass}
        />
      </div>

      <button
        type="button"
        disabled={!hasFilters}
        onClick={() => onChange({ category: "todas", from: "", to: "" })}
        className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        Limpar
      </button>
    </div>
  );
}
