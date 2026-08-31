import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ExpenseForm } from "./ExpenseForm";
import { toIsoDate } from "@/lib/expenses";

describe("<ExpenseForm />", () => {
  it("não envia e mostra os erros quando o formulário está vazio", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<ExpenseForm onSubmit={onSubmit} />);

    await user.click(screen.getByRole("button", { name: /adicionar despesa/i }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(await screen.findAllByRole("alert")).toHaveLength(2);
    expect(screen.getByText(/a descrição precisa ter pelo menos/i)).toBeInTheDocument();
    expect(screen.getByText(/informe um valor numérico válido/i)).toBeInTheDocument();
  });

  it("envia os dados preenchidos e limpa o formulário", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<ExpenseForm onSubmit={onSubmit} />);

    const description = screen.getByLabelText(/descrição/i);
    await user.type(description, "Passagem de ônibus");
    await user.type(screen.getByLabelText(/valor/i), "12,50");
    // O Select do shadcn/ui e um combobox do Radix, nao um <select> nativo:
    // abre o menu e escolhe a opcao pelo texto.
    await user.click(screen.getByRole("combobox", { name: /categoria/i }));
    await user.click(await screen.findByRole("option", { name: "Transporte" }));

    await user.click(screen.getByRole("button", { name: /adicionar despesa/i }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith({
      description: "Passagem de ônibus",
      amount: "12,50",
      category: "transporte",
      date: toIsoDate(new Date()),
    });
    expect(description).toHaveValue("");
  });

  it("limpa o erro do campo assim que o usuário corrige o valor", async () => {
    const user = userEvent.setup();
    render(<ExpenseForm onSubmit={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: /adicionar despesa/i }));
    expect(screen.getByText(/informe um valor numérico válido/i)).toBeInTheDocument();

    await user.type(screen.getByLabelText(/valor/i), "40");
    expect(screen.queryByText(/informe um valor numérico válido/i)).not.toBeInTheDocument();
  });
});
