import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ExpenseFiltersBar } from "@/components/ExpenseFilters";
import type { ExpenseFilters } from "@/types/expense";

const NO_FILTERS: ExpenseFilters = { category: "todas", from: "", to: "" };

describe("<ExpenseFiltersBar />", () => {
  it("chama onChange ao mudar a categoria", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ExpenseFiltersBar filters={NO_FILTERS} onChange={onChange} />);

    await user.click(screen.getByRole("combobox", { name: /categoria/i }));
    await user.click(await screen.findByRole("option", { name: "Transporte" }));

    expect(onChange).toHaveBeenCalledWith({
      category: "transporte",
      from: "",
      to: "",
    });
  });

  it("desabilita Limpar quando não há filtros ativos", () => {
    render(<ExpenseFiltersBar filters={NO_FILTERS} onChange={vi.fn()} />);

    expect(screen.getByRole("button", { name: /limpar/i })).toBeDisabled();
  });

  it("habilita Limpar com filtro ativo e reseta ao clicar", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ExpenseFiltersBar
        filters={{ category: "saude", from: "2026-08-01", to: "2026-08-31" }}
        onChange={onChange}
      />,
    );

    const limpar = screen.getByRole("button", { name: /limpar/i });
    expect(limpar).toBeEnabled();

    await user.click(limpar);

    expect(onChange).toHaveBeenCalledWith({
      category: "todas",
      from: "",
      to: "",
    });
  });
});
