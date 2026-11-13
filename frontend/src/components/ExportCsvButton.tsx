"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toIsoDate } from "@/lib/expenses";
import { csvFileName, downloadCsv, expensesToCsv } from "@/lib/exportCsv";
import type { Expense } from "@/types/expense";

interface ExportCsvButtonProps {
  expenses: Expense[];
}

export function ExportCsvButton({ expenses }: ExportCsvButtonProps) {
  function handleExport() {
    downloadCsv(expensesToCsv(expenses), csvFileName(toIsoDate(new Date())));
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleExport}
      disabled={expenses.length === 0}
    >
      <Download />
      Exportar CSV
    </Button>
  );
}
