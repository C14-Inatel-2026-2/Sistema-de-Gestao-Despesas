import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Expense, ExpenseInput } from "@/types/expense";

const STORAGE_KEY = "gestao-despesas:expenses";

const seed: Expense[] = [
  { id: "1", description: "Padaria", amount: 20, category: "alimentacao", date: "2026-08-10" },
];

const validInput: ExpenseInput = {
  description: "Cinema",
  amount: "45,90",
  category: "lazer",
  date: "2026-08-01",
};

async function loadHook() {
  const { useExpenses } = await import("@/hooks/useExpenses");
  const { MOCK_EXPENSES } = await import("@/data/mock");
  return { useExpenses, MOCK_EXPENSES };
}

function failOnSave() {
  return vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw new Error("localStorage cheio");
  });
}

describe("useExpenses — persistência no localStorage", () => {
  beforeEach(() => {
    vi.resetModules();
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("na primeira visita grava as despesas de exemplo no localStorage", async () => {
    const { useExpenses, MOCK_EXPENSES } = await loadHook();

    const { result } = renderHook(() => useExpenses());

    expect(result.current.expenses).toEqual(MOCK_EXPENSES);
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "null")).toEqual(MOCK_EXPENSES);
  });

  it("na primeira visita, se salvar falhar, ainda mostra as despesas de exemplo", async () => {
    const { useExpenses, MOCK_EXPENSES } = await loadHook();
    const setItem = failOnSave();

    const { result } = renderHook(() => useExpenses());

    expect(result.current.expenses).toEqual(MOCK_EXPENSES);
    expect(setItem).toHaveBeenCalledTimes(1);
    setItem.mockRestore();
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("ao adicionar, grava a nova lista no localStorage", async () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    const { useExpenses } = await loadHook();
    const { result } = renderHook(() => useExpenses());

    act(() => {
      result.current.addExpense(validInput);
    });

    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]") as Expense[];
    expect(stored).toHaveLength(2);
    expect(stored.map((expense) => expense.description)).toEqual(["Padaria", "Cinema"]);
    expect(result.current.expenses).toEqual(stored);
  });

  it("se salvar falhar ao adicionar, não quebra e a lista volta ao que está salvo", async () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    const { useExpenses } = await loadHook();
    const { result } = renderHook(() => useExpenses());
    failOnSave();

    expect(() => {
      act(() => {
        result.current.addExpense(validInput);
      });
    }).not.toThrow();

    expect(result.current.expenses).toEqual(seed);
  });
});
