"use client";

import { useState } from "react";
import {
  EXPENSE_CATEGORIES,
  type ExpenseErrors,
  type ExpenseInput,
} from "@/types/expense";
import { isValid, toIsoDate, validateExpense } from "@/lib/expenses";

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100";

function emptyForm(): ExpenseInput {
  return {
    description: "",
    amount: "",
    category: "alimentacao",
    date: toIsoDate(new Date()),
  };
}

interface ExpenseFormProps {
  onSubmit: (input: ExpenseInput) => void;
}

export function ExpenseForm({ onSubmit }: ExpenseFormProps) {
  const [form, setForm] = useState<ExpenseInput>(emptyForm);
  const [errors, setErrors] = useState<ExpenseErrors>({});

  function update(field: keyof ExpenseInput, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const validation = validateExpense(form);
    setErrors(validation);
    if (!isValid(validation)) return;

    onSubmit(form);
    setForm(emptyForm());
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60"
    >
      <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
        Nova despesa
      </h2>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field
          label="Descrição"
          error={errors.description}
          className="sm:col-span-2"
        >
          <input
            id="description"
            type="text"
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder="Ex.: Supermercado do mês"
            className={inputClass}
          />
        </Field>

        <Field label="Valor (R$)" error={errors.amount}>
          <input
            id="amount"
            type="text"
            inputMode="decimal"
            value={form.amount}
            onChange={(e) => update("amount", e.target.value)}
            placeholder="0,00"
            className={inputClass}
          />
        </Field>

        <Field label="Data" error={errors.date}>
          <input
            id="date"
            type="date"
            value={form.date}
            onChange={(e) => update("date", e.target.value)}
            className={inputClass}
          />
        </Field>

        <Field label="Categoria" error={errors.category} className="sm:col-span-2">
          <select
            id="category"
            value={form.category}
            onChange={(e) => update("category", e.target.value)}
            className={inputClass}
          >
            {EXPENSE_CATEGORIES.map((category) => (
              <option key={category.id} value={category.id}>
                {category.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <button
        type="submit"
        className="mt-5 w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
      >
        Adicionar despesa
      </button>
    </form>
  );
}

interface FieldProps {
  label: string;
  error?: string;
  className?: string;
  children: React.ReactElement<{ id?: string }>;
}

function Field({ label, error, className = "", children }: FieldProps) {
  const id = children.props.id;

  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400"
      >
        {label}
      </label>
      {children}
      {error ? (
        <p role="alert" className="mt-1.5 text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  );
}
