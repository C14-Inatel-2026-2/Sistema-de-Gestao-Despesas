"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EXPENSE_CATEGORIES } from "@/types/expense";

interface CategorySelectProps {
  id: string;
  value: string;
  onValueChange: (value: string) => void;
  /** Adiciona a opção "Todas" (valor `todas`), usada nos filtros. */
  includeAll?: boolean;
  placeholder?: string;
}

export function CategorySelect({
  id,
  value,
  onValueChange,
  includeAll = false,
  placeholder,
}: CategorySelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger id={id} className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {includeAll ? <SelectItem value="todas">Todas</SelectItem> : null}
        {EXPENSE_CATEGORIES.map((category) => (
          <SelectItem key={category.id} value={category.id}>
            {category.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
