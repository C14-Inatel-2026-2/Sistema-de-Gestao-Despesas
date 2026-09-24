import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MOCK_EXPENSES, STORAGE_KEY } from "@/data/mock";
import { useExpenses } from "@/hooks/useExpenses";
import type { Expense, ExpenseInput } from "@/types/expense";

const validInput: ExpenseInput = {
  description: "Cinema",
  amount: "45,90",
  category: "lazer",
  date: "2026-08-01",
};

describe("useExpenses", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("carrega as despesas mockadas quando o localStorage está vazio", () => {
    const { result } = renderHook(() => useExpenses());

    expect(result.current.expenses).toEqual(MOCK_EXPENSES);
  });

  it("removeExpense com um id inexistente não altera a lista", () => {
    const seed: Expense[] = [
      { id: "1", description: "Padaria", amount: 20, category: "alimentacao", date: "2026-08-10" },
    ];
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    const { result } = renderHook(() => useExpenses());

    act(() => {
      result.current.removeExpense("id-que-nao-existe");
    });

    expect(result.current.expenses).toEqual(seed);
  });

  it("addExpense usa o id gerado por crypto.randomUUID", () => {
    vi.spyOn(crypto, "randomUUID").mockReturnValue("00000000-0000-4000-8000-000000000000");
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    const { result } = renderHook(() => useExpenses());

    act(() => {
      result.current.addExpense(validInput);
    });

    expect(result.current.expenses).toHaveLength(1);
    expect(result.current.expenses[0].id).toBe("00000000-0000-4000-8000-000000000000");
    expect(crypto.randomUUID).toHaveBeenCalledTimes(1);
  });

  it("se o localStorage lançar erro, o hook devolve lista vazia em vez de quebrar", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("localStorage bloqueado");
    });

    const { result } = renderHook(() => useExpenses());

    expect(result.current.expenses).toEqual([]);
  });
});
