"use client";

import { useId } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EXPENSE_CATEGORIES, type ExpenseFilters } from "@/types/expense";

interface ExpenseFiltersBarProps {
  filters: ExpenseFilters;
  onChange: (filters: ExpenseFilters) => void;
}

export function ExpenseFiltersBar({ filters, onChange }: ExpenseFiltersBarProps) {
  const fieldId = useId();
  const hasFilters =
    filters.category !== "todas" || filters.from !== "" || filters.to !== "";

  return (
    <div className="grid gap-3 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end">
      <div>
        <Label htmlFor={`${fieldId}-category`} className="mb-2">
          Categoria
        </Label>
        <Select
          value={filters.category}
          onValueChange={(value) =>
            onChange({ ...filters, category: value as ExpenseFilters["category"] })
          }
        >
          <SelectTrigger id={`${fieldId}-category`} className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas</SelectItem>
            {EXPENSE_CATEGORIES.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor={`${fieldId}-from`} className="mb-2">
          De
        </Label>
        <Input
          id={`${fieldId}-from`}
          type="date"
          value={filters.from}
          max={filters.to || undefined}
          onChange={(e) => onChange({ ...filters, from: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor={`${fieldId}-to`} className="mb-2">
          Até
        </Label>
        <Input
          id={`${fieldId}-to`}
          type="date"
          value={filters.to}
          min={filters.from || undefined}
          onChange={(e) => onChange({ ...filters, to: e.target.value })}
        />
      </div>

      <Button
        type="button"
        variant="outline"
        size="lg"
        disabled={!hasFilters}
        onClick={() => onChange({ category: "todas", from: "", to: "" })}
      >
        Limpar
      </Button>
    </div>
  );
}
