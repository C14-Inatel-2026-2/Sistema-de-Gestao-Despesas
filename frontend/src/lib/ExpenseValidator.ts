import {
  isValid,
  toIsoDate,
  validateExpense,
} from "@/lib/expenses";
import type { ExpenseErrors, ExpenseInput } from "@/types/expense";

export class ExpenseValidationError extends Error {
  constructor(public readonly errors: ExpenseErrors) {
    super("Dados da despesa inválidos.");
    this.name = "ExpenseValidationError";
  }
}

export class ExpenseValidator {
  constructor(
    private readonly today: () => string = () => toIsoDate(new Date()),
  ) {}

  validate(input: ExpenseInput): ExpenseErrors {
    return validateExpense(input, this.today());
  }

  assertValid(input: ExpenseInput): void {
    const errors = this.validate(input);
    if (!isValid(errors)) {
      throw new ExpenseValidationError(errors);
    }
  }
}
