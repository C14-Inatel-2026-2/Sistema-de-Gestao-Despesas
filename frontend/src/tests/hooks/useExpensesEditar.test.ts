/**
 * Testes unitários COM MOCK do `updateExpense`.
 *
 * O store (localStorage) é substituído por um mock, então o teste verifica
 * apenas o que o hook faz: ler a lista atual e gravar a lista atualizada.
 */
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { readStore, writeStore } from "@/lib/expenseStore";
import { useExpenses } from "@/hooks/useExpenses";
import type { Expense, ExpenseInput } from "@/types/expense";

vi.mock("@/lib/expenseStore", () => ({
  readStore: vi.fn(),
  writeStore: vi.fn(),
  subscribe: vi.fn(() => () => {}),
  serverSnapshot: vi.fn(() => []),
}));

const seed: Expense[] = [
  { id: "1", description: "Padaria", amount: 20, category: "alimentacao", date: "2026-08-10" },
  { id: "2", description: "Uber", amount: 30, category: "transporte", date: "2026-08-05" },
];

const edicao: ExpenseInput = {
  description: "Táxi",
  amount: "45,50",
  category: "transporte",
  date: "2026-08-20",
};

describe("useExpenses.updateExpense (com mock do store)", () => {
  beforeEach(() => {
    vi.mocked(readStore).mockReset().mockReturnValue(seed);
    vi.mocked(writeStore).mockReset();
  });

  it("grava a lista com a despesa alterada, mantendo o id e reordenando por data", () => {
    const { result } = renderHook(() => useExpenses());

    act(() => {
      result.current.updateExpense("2", edicao);
    });

    expect(writeStore).toHaveBeenCalledTimes(1);
    expect(writeStore).toHaveBeenCalledWith([
      { id: "2", description: "Táxi", amount: 45.5, category: "transporte", date: "2026-08-20" },
      seed[0],
    ]);
  });

  it("não altera a lista quando o id não existe", () => {
    const { result } = renderHook(() => useExpenses());

    act(() => {
      result.current.updateExpense("id-que-nao-existe", edicao);
    });

    expect(writeStore).toHaveBeenCalledWith(seed);
  });
});
