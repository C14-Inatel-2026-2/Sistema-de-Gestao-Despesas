"use client";

import { useId } from "react";
import { CategorySelect } from "@/components/CategorySelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EMPTY_FILTERS, type ExpenseFilters } from "@/types/expense";

interface ExpenseFiltersBarProps {
  filters: ExpenseFilters;
  onChange: (filters: ExpenseFilters) => void;
}

export function ExpenseFiltersBar({ filters, onChange }: ExpenseFiltersBarProps) {
  const fieldId = useId();
  const hasFilters =
    filters.category !== "todas" || filters.from !== "" || filters.to !== "";

  return (
    <div className="grid grid-cols-2 gap-3 @lg:grid-cols-[1fr_1fr_1fr_auto] @lg:items-end">
      <div className="col-span-2 @lg:col-span-1">
        <Label htmlFor={`${fieldId}-category`} className="mb-2">
          Categoria
        </Label>
        <CategorySelect
          id={`${fieldId}-category`}
          value={filters.category}
          onValueChange={(value) =>
            onChange({ ...filters, category: value as ExpenseFilters["category"] })
          }
          includeAll
        />
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
        className="col-span-2 @lg:col-span-1"
        onClick={() => onChange(EMPTY_FILTERS)}
      >
        Limpar
      </Button>
    </div>
  );
}
