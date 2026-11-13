import { categoryLabel, type Expense } from "@/types/expense";
import { formatDate } from "@/lib/expenses";

export const CSV_SEPARATOR = ";";
export const CSV_HEADER = ["Data", "Descrição", "Categoria", "Valor"];

const UTF8_BOM = "﻿";

function escapeCell(value: string): string {
  const safe = /^[=+\-@]/.test(value) ? `'${value}` : value;
  if (/[";\r\n]/.test(safe)) {
    return `"${safe.replace(/"/g, '""')}"`;
  }
  return safe;
}

export function formatCsvAmount(amount: number): string {
  return amount.toFixed(2).replace(".", ",");
}

export function expensesToCsv(expenses: readonly Expense[]): string {
  const rows = expenses.map((expense) => [
    formatDate(expense.date),
    expense.description,
    categoryLabel(expense.category),
    formatCsvAmount(expense.amount),
  ]);

  return [CSV_HEADER, ...rows]
    .map((row) => row.map(escapeCell).join(CSV_SEPARATOR))
    .join("\r\n");
}

export function csvFileName(today: string): string {
  return `despesas-${today}.csv`;
}

export function downloadCsv(content: string, fileName: string): void {
  const blob = new Blob([UTF8_BOM + content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
