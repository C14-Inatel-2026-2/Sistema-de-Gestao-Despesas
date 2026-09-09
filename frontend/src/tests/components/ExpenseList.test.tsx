import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ExpenseList } from "@/components/ExpenseList";
import type { Expense } from "@/types/expense";

const expenses: Expense[] = [
  {
    id: "exp-1",
    description: "Supermercado",
    amount: 150.4,
    category: "alimentacao",
    date: "2026-08-15",
  },
  {
    id: "exp-2",
    description: "Uber",
    amount: 32,
    category: "transporte",
    date: "2026-08-20",
  },
];

/** Intl.NumberFormat usa NBSP; normalizamos antes de comparar. */
function hasCurrency(amount: string) {
  return (_: string, element: Element | null) => {
    if (!element || element.children.length > 0) return false;
    const text = element.textContent?.replace(/\u00a0/g, " ") ?? "";
    return text === `R$ ${amount}`;
  };
}

describe("<ExpenseList />", () => {
  it("renderiza descrição, categoria, data e valor em BRL", () => {
    render(
      <ExpenseList expenses={expenses} totalCount={2} onDelete={vi.fn()} />,
    );

    expect(screen.getByText("Supermercado")).toBeInTheDocument();
    expect(screen.getByText(/Alimentação · 15\/08\/2026/)).toBeInTheDocument();
    expect(screen.getByText(hasCurrency("150,40"))).toBeInTheDocument();

    expect(screen.getByText("Uber")).toBeInTheDocument();
    expect(screen.getByText(/Transporte · 20\/08\/2026/)).toBeInTheDocument();
    expect(screen.getByText(hasCurrency("32,00"))).toBeInTheDocument();
  });

  it("chama onDelete com o id ao clicar em excluir", async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(
      <ExpenseList expenses={expenses} totalCount={2} onDelete={onDelete} />,
    );

    await user.click(
      screen.getByRole("button", { name: /excluir despesa supermercado/i }),
    );

    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledWith("exp-1");
  });

  it("mostra convite para cadastrar quando não há despesas na base", () => {
    render(<ExpenseList expenses={[]} totalCount={0} onDelete={vi.fn()} />);

    expect(
      screen.getByText(/nenhuma despesa cadastrada ainda/i),
    ).toBeInTheDocument();
  });

  it("mostra mensagem de filtros quando a base tem itens mas a lista filtrada está vazia", () => {
    render(<ExpenseList expenses={[]} totalCount={3} onDelete={vi.fn()} />);

    expect(
      screen.getByText(/nenhuma despesa encontrada para os filtros/i),
    ).toBeInTheDocument();
  });
});
