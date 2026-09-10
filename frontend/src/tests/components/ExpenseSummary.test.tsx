import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ExpenseSummary } from "@/components/ExpenseSummary";
import type { Expense } from "@/types/expense";

const expenses: Expense[] = [
  {
    id: "1",
    description: "Almoço",
    amount: 40,
    category: "alimentacao",
    date: "2026-08-10",
  },
  {
    id: "2",
    description: "Ônibus",
    amount: 10,
    category: "transporte",
    date: "2026-08-11",
  },
  {
    id: "3",
    description: "Mercado",
    amount: 50,
    category: "alimentacao",
    date: "2026-08-12",
  },
];

/** Intl.NumberFormat usa NBSP; normalizamos antes de comparar. */
function hasCurrency(amount: string) {
  return (_: string, element: Element | null) => {
    if (!(element instanceof HTMLElement)) return false;
    // Só o próprio nó de texto (ignora pais que agregam filhos).
    const own = Array.from(element.childNodes)
      .filter((node) => node.nodeType === Node.TEXT_NODE)
      .map((node) => node.textContent ?? "")
      .join("")
      .replace(/\u00a0/g, " ")
      .trim();
    return own === `R$ ${amount}`;
  };
}

describe("<ExpenseSummary />", () => {
  it("mostra total formatado, quantidade e gastos por categoria", () => {
    render(<ExpenseSummary expenses={expenses} />);

    expect(screen.getByText("Total")).toBeInTheDocument();
    expect(screen.getByText(hasCurrency("100,00"))).toBeInTheDocument();
    expect(screen.getByText("Despesas")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();

    expect(screen.getByText("Gastos por categoria")).toBeInTheDocument();
    expect(screen.getByText("Alimentação")).toBeInTheDocument();
    expect(screen.getByText("Transporte")).toBeInTheDocument();
    expect(screen.getByText(hasCurrency("90,00"))).toBeInTheDocument();
    expect(screen.getByText(hasCurrency("10,00"))).toBeInTheDocument();
  });

  it("mostra total zero quando a lista está vazia", () => {
    render(<ExpenseSummary expenses={[]} />);

    const zeros = screen.getAllByText(hasCurrency("0,00"));
    expect(zeros.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.queryByText("Gastos por categoria")).not.toBeInTheDocument();
  });
});
