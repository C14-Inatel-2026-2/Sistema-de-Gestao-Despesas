import { describe, expect, it } from "vitest";
import type { Expense } from "@/types/expense";
import {
  calculateTotal,
  createExpense,
  filterExpenses,
  formatDate,
  isValid,
  parseAmount,
  roundToCents,
  sortByDateDesc,
  totalsByCategory,
  validateExpense,
} from "./expenses";

const HOJE = "2026-08-31";

function despesa(overrides: Partial<Expense> = {}): Expense {
  return {
    id: "1",
    description: "Almoço",
    amount: 25,
    category: "alimentacao",
    date: "2026-08-10",
    ...overrides,
  };
}

describe("parseAmount", () => {
  it("aceita o formato americano", () => {
    expect(parseAmount("1234.56")).toBe(1234.56);
  });

  it("aceita o formato brasileiro com separador de milhar", () => {
    expect(parseAmount("1.234,56")).toBe(1234.56);
  });

  it("ignora espaços em volta do valor", () => {
    expect(parseAmount("  99,90  ")).toBe(99.9);
  });

  it("rejeita texto que não é número", () => {
    expect(parseAmount("abc")).toBeNull();
    expect(parseAmount("12,3,4")).toBeNull();
    expect(parseAmount("")).toBeNull();
  });
});

describe("roundToCents", () => {
  it("corrige o erro de ponto flutuante", () => {
    expect(roundToCents(0.1 + 0.2)).toBe(0.3);
  });
});

describe("validateExpense", () => {
  const valido = {
    description: "Supermercado",
    amount: "150,90",
    category: "alimentacao",
    date: "2026-08-30",
  };

  it("não retorna erros para uma despesa válida", () => {
    const errors = validateExpense(valido, HOJE);
    expect(isValid(errors)).toBe(true);
  });

  it("exige descrição com pelo menos 3 caracteres", () => {
    const errors = validateExpense({ ...valido, description: "ab" }, HOJE);
    expect(errors.description).toBeDefined();
  });

  it("rejeita valor zero ou negativo", () => {
    expect(validateExpense({ ...valido, amount: "0" }, HOJE).amount).toBeDefined();
    expect(validateExpense({ ...valido, amount: "-10" }, HOJE).amount).toBeDefined();
  });

  it("rejeita valor não numérico", () => {
    expect(validateExpense({ ...valido, amount: "dez reais" }, HOJE).amount).toBeDefined();
  });

  it("rejeita categoria desconhecida", () => {
    expect(validateExpense({ ...valido, category: "viagem" }, HOJE).category).toBeDefined();
  });

  it("rejeita data no futuro", () => {
    expect(validateExpense({ ...valido, date: "2026-09-01" }, HOJE).date).toBeDefined();
  });

  it("aceita a data de hoje", () => {
    expect(validateExpense({ ...valido, date: HOJE }, HOJE).date).toBeUndefined();
  });

  it("rejeita data inexistente no calendário", () => {
    expect(validateExpense({ ...valido, date: "2026-02-30" }, HOJE).date).toBeDefined();
  });
});

describe("createExpense", () => {
  it("normaliza descrição e valor", () => {
    const nova = createExpense(
      {
        description: "  Uber para a faculdade  ",
        amount: "1.234,567",
        category: "transporte",
        date: "2026-08-20",
      },
      "abc",
    );

    expect(nova).toEqual({
      id: "abc",
      description: "Uber para a faculdade",
      amount: 1234.57,
      category: "transporte",
      date: "2026-08-20",
    });
  });

  it("lança erro quando os dados são inválidos", () => {
    expect(() =>
      createExpense(
        { description: "x", amount: "abc", category: "alimentacao", date: HOJE },
        "abc",
      ),
    ).toThrow();
  });
});

describe("calculateTotal", () => {
  it("soma os valores das despesas", () => {
    const total = calculateTotal([
      despesa({ id: "1", amount: 25.5 }),
      despesa({ id: "2", amount: 10.25 }),
      despesa({ id: "3", amount: 4.25 }),
    ]);
    expect(total).toBe(40);
  });

  it("retorna zero para uma lista vazia", () => {
    expect(calculateTotal([])).toBe(0);
  });

  it("não acumula erro de ponto flutuante", () => {
    expect(calculateTotal([despesa({ amount: 0.1 }), despesa({ amount: 0.2 })])).toBe(0.3);
  });
});

describe("filterExpenses", () => {
  const lista = [
    despesa({ id: "1", category: "alimentacao", date: "2026-08-01" }),
    despesa({ id: "2", category: "transporte", date: "2026-08-15" }),
    despesa({ id: "3", category: "alimentacao", date: "2026-08-31" }),
  ];

  it("retorna tudo quando a categoria é 'todas' e não há período", () => {
    const resultado = filterExpenses(lista, { category: "todas", from: "", to: "" });
    expect(resultado).toHaveLength(3);
  });

  it("filtra por categoria", () => {
    const resultado = filterExpenses(lista, { category: "alimentacao", from: "", to: "" });
    expect(resultado.map((d) => d.id)).toEqual(["1", "3"]);
  });

  it("filtra por período, incluindo as datas limite", () => {
    const resultado = filterExpenses(lista, {
      category: "todas",
      from: "2026-08-15",
      to: "2026-08-31",
    });
    expect(resultado.map((d) => d.id)).toEqual(["2", "3"]);
  });

  it("combina categoria e período", () => {
    const resultado = filterExpenses(lista, {
      category: "alimentacao",
      from: "2026-08-02",
      to: "",
    });
    expect(resultado.map((d) => d.id)).toEqual(["3"]);
  });

  it("não modifica a lista original", () => {
    filterExpenses(lista, { category: "transporte", from: "", to: "" });
    expect(lista).toHaveLength(3);
  });
});

describe("totalsByCategory", () => {
  it("agrupa por categoria e ordena do maior para o menor", () => {
    const resultado = totalsByCategory([
      despesa({ id: "1", category: "alimentacao", amount: 30 }),
      despesa({ id: "2", category: "transporte", amount: 100 }),
      despesa({ id: "3", category: "alimentacao", amount: 20 }),
    ]);

    expect(resultado).toEqual([
      { category: "transporte", total: 100 },
      { category: "alimentacao", total: 50 },
    ]);
  });

  it("retorna lista vazia quando não há despesas", () => {
    expect(totalsByCategory([])).toEqual([]);
  });
});

describe("sortByDateDesc", () => {
  it("ordena da mais recente para a mais antiga sem mutar a original", () => {
    const lista = [
      despesa({ id: "1", date: "2026-08-01" }),
      despesa({ id: "2", date: "2026-08-31" }),
    ];
    expect(sortByDateDesc(lista).map((d) => d.id)).toEqual(["2", "1"]);
    expect(lista.map((d) => d.id)).toEqual(["1", "2"]);
  });
});

describe("formatDate", () => {
  it("converte ISO para o formato brasileiro", () => {
    expect(formatDate("2026-08-31")).toBe("31/08/2026");
  });
});
