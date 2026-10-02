import { describe, expect, it } from "vitest";
import { categoryLabel, isExpenseCategory } from "@/types/expense";

describe("categoryLabel", () => {
  it("devolve o nome da categoria com acento", () => {
    expect(categoryLabel("alimentacao")).toBe("Alimentação");
    expect(categoryLabel("saude")).toBe("Saúde");
  });
});

describe("isExpenseCategory", () => {
  it("aceita os ids das categorias cadastradas", () => {
    expect(isExpenseCategory("transporte")).toBe(true);
  });

  it("rejeita texto que não é categoria", () => {
    expect(isExpenseCategory("viagens")).toBe(false);
    expect(isExpenseCategory("")).toBe(false);
    // "todas" só existe como opção de filtro, não como categoria de despesa
    expect(isExpenseCategory("todas")).toBe(false);
  });

  it("não aceita o nome de exibição no lugar do id", () => {
    expect(isExpenseCategory("Alimentação")).toBe(false);
  });
});
