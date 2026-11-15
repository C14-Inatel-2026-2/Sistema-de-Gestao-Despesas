import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ExportCsvButton } from "@/components/ExportCsvButton";
import * as exportCsv from "@/lib/exportCsv";
import type { Expense } from "@/types/expense";

const expenses: Expense[] = [
  { id: "1", description: "Cinema", amount: 48, category: "lazer", date: "2026-08-22" },
];

describe("<ExportCsvButton />", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("fica desabilitado quando não há despesas para exportar", () => {
    render(<ExportCsvButton expenses={[]} />);

    expect(screen.getByRole("button", { name: /exportar csv/i })).toBeDisabled();
  });

  it("exporta exatamente as despesas recebidas ao clicar", async () => {
    const user = userEvent.setup();
    const download = vi.spyOn(exportCsv, "downloadCsv").mockImplementation(() => {});
    render(<ExportCsvButton expenses={expenses} />);

    await user.click(screen.getByRole("button", { name: /exportar csv/i }));

    expect(download).toHaveBeenCalledTimes(1);
    expect(download).toHaveBeenCalledWith(
      "Data;Descrição;Categoria;Valor\r\n22/08/2026;Cinema;Lazer;48,00",
      expect.stringMatching(/^despesas-\d{4}-\d{2}-\d{2}\.csv$/),
    );
  });
});
