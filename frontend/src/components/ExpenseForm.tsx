"use client";

import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  EXPENSE_CATEGORIES,
  type ExpenseErrors,
  type ExpenseInput,
} from "@/types/expense";
import { isValid, toIsoDate, validateExpense } from "@/lib/expenses";

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
  const fieldId = useId();

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

  const ids = {
    description: `${fieldId}-description`,
    amount: `${fieldId}-amount`,
    date: `${fieldId}-date`,
    category: `${fieldId}-category`,
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nova despesa</CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} noValidate className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Descrição"
            htmlFor={ids.description}
            error={errors.description}
            className="sm:col-span-2"
          >
            <Input
              id={ids.description}
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Ex.: Supermercado do mês"
              aria-invalid={Boolean(errors.description)}
            />
          </Field>

          <Field label="Valor (R$)" htmlFor={ids.amount} error={errors.amount}>
            <Input
              id={ids.amount}
              inputMode="decimal"
              value={form.amount}
              onChange={(e) => update("amount", e.target.value)}
              placeholder="0,00"
              aria-invalid={Boolean(errors.amount)}
            />
          </Field>

          <Field label="Data" htmlFor={ids.date} error={errors.date}>
            <Input
              id={ids.date}
              type="date"
              value={form.date}
              onChange={(e) => update("date", e.target.value)}
              aria-invalid={Boolean(errors.date)}
            />
          </Field>

          <Field
            label="Categoria"
            htmlFor={ids.category}
            error={errors.category}
            className="sm:col-span-2"
          >
            <Select
              value={form.category}
              onValueChange={(value) => update("category", value)}
            >
              <SelectTrigger id={ids.category} className="w-full">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {EXPENSE_CATEGORIES.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Button type="submit" size="lg" className="mt-1 w-full sm:col-span-2">
            Adicionar despesa
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

interface FieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}

function Field({ label, htmlFor, error, className, children }: FieldProps) {
  return (
    <div className={className}>
      <Label htmlFor={htmlFor} className="mb-2">
        {label}
      </Label>
      {children}
      {error ? (
        <p role="alert" className="mt-1.5 text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
