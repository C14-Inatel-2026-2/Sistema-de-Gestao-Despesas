import { afterEach, describe, expect, it, vi } from "vitest";
import {
  ExpenseValidationError,
  ExpenseValidator,
} from "@/lib/ExpenseValidator";
import { isValid } from "@/lib/expenses";
import type { ExpenseInput } from "@/types/expense";

const validInput: ExpenseInput = {
  description: "Supermercado",
  amount: "150,90",
  category: "alimentacao",
  date: "2026-08-01",
};

describe("ExpenseValidator (sem mock)", () => {
  it("validate aceita um input válido e não retorna erros", () => {
    const validator = new ExpenseValidator();

    const errors = validator.validate(validInput);

    expect(isValid(errors)).toBe(true);
  });

  it("caso negativo: assertValid lança quando o valor é zero", () => {
    const validator = new ExpenseValidator();
    const invalido: ExpenseInput = { ...validInput, amount: "0" };

    expect(() => validator.assertValid(invalido)).toThrow(ExpenseValidationError);

    try {
      validator.assertValid(invalido);
    } catch (error) {
      expect(error).toBeInstanceOf(ExpenseValidationError);
      expect((error as ExpenseValidationError).errors.amount).toBeDefined();
    }
  });
});

describe("ExpenseValidator (com mock)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("validate aceita a data de hoje quando today é mockado", () => {
    const today = vi.fn(() => "2026-08-01");
    const validator = new ExpenseValidator(today);

    const errors = validator.validate({
      ...validInput,
      date: "2026-08-01",
    });

    expect(isValid(errors)).toBe(true);
    expect(today).toHaveBeenCalled();
  });

  it("validate rejeita data futura quando today é mockado", () => {
    const today = vi.fn(() => "2026-08-01");
    const validator = new ExpenseValidator(today);

    const errors = validator.validate({
      ...validInput,
      date: "2026-08-02",
    });

    expect(errors.date).toBeDefined();
    expect(today).toHaveBeenCalled();
  });
});
