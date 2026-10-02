import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { validateExpense } from "@/lib/expenses";
import type { ExpenseInput } from "@/types/expense";

const input: ExpenseInput = {
  description: "Cinema",
  amount: "45,90",
  category: "lazer",
  date: "2026-10-02",
};

// Sem passar `today`, validateExpense usa o relógio do sistema.
// Congelamos a data para o resultado não depender do dia em que o teste roda.
describe("validateExpense usando a data atual", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 2, 12, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("aceita uma despesa com a data de hoje", () => {
    expect(validateExpense(input)).toEqual({});
  });

  it("rejeita uma despesa com a data de amanhã", () => {
    const errors = validateExpense({ ...input, date: "2026-10-03" });

    expect(errors.date).toMatch(/futuro/i);
  });

  it("volta a aceitar a mesma data quando o relógio avança um dia", () => {
    const amanha = { ...input, date: "2026-10-03" };
    vi.setSystemTime(new Date(2026, 9, 3, 12, 0, 0));

    expect(validateExpense(amanha)).toEqual({});
  });
});
