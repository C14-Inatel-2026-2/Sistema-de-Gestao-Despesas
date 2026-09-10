import { describe, expect, it } from "vitest";
import { MOCK_EXPENSES, parseStored, resolveExpenses } from "@/data/mock";

describe("parseStored", () => {
  it("aceita um array de despesas válidas", () => {
    const raw = JSON.stringify([
      {
        id: "1",
        description: "Café",
        amount: 8.5,
        category: "alimentacao",
        date: "2026-08-10",
      },
    ]);

    expect(parseStored(raw)).toEqual([
      {
        id: "1",
        description: "Café",
        amount: 8.5,
        category: "alimentacao",
        date: "2026-08-10",
      },
    ]);
  });

  it("descarta itens com formato inválido", () => {
    const raw = JSON.stringify([
      { id: "1", description: "Ok", amount: 10, category: "lazer", date: "2026-08-01" },
      { id: 2, description: "sem id string" },
      null,
      "texto",
      { id: "3", description: "X", amount: 1, category: "categoria-falsa", date: "2026-08-01" },
    ]);

    expect(parseStored(raw)).toHaveLength(1);
    expect(parseStored(raw)[0].id).toBe("1");
  });

  it("retorna lista vazia para JSON inválido ou que não é array", () => {
    expect(parseStored("não é json")).toEqual([]);
    expect(parseStored("{}")).toEqual([]);
    expect(parseStored("null")).toEqual([]);
  });

  it("preserva lista vazia válida", () => {
    expect(parseStored("[]")).toEqual([]);
  });
});

describe("resolveExpenses", () => {
  it("usa o mock quando a chave ainda não existe", () => {
    expect(resolveExpenses(null)).toEqual(MOCK_EXPENSES);
    expect(resolveExpenses(null).length).toBeGreaterThanOrEqual(6);
  });

  it("não reaplica o mock quando a chave existe, mesmo vazia", () => {
    expect(resolveExpenses("[]")).toEqual([]);
  });

  it("carrega as despesas já gravadas", () => {
    const raw = JSON.stringify([
      {
        id: "user-1",
        description: "Minha despesa",
        amount: 20,
        category: "outros",
        date: "2026-08-01",
      },
    ]);

    expect(resolveExpenses(raw)).toEqual([
      {
        id: "user-1",
        description: "Minha despesa",
        amount: 20,
        category: "outros",
        date: "2026-08-01",
      },
    ]);
  });
});
