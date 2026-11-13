import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ExpenseForm } from "@/components/ExpenseForm";
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

  describe("modo de edição", () => {
    const atual = {
      description: "Supermercado",
      amount: "150,40",
      category: "alimentacao",
      date: "2026-08-15",
    };

    it("abre preenchido com os dados atuais da despesa", () => {
      render(<ExpenseForm onSubmit={vi.fn()} initialValues={atual} onCancel={vi.fn()} />);

      expect(screen.getByText("Editar despesa")).toBeInTheDocument();
      expect(screen.getByLabelText(/descrição/i)).toHaveValue("Supermercado");
      expect(screen.getByLabelText(/valor/i)).toHaveValue("150,40");
      expect(screen.getByLabelText(/data/i)).toHaveValue("2026-08-15");
      expect(screen.getByRole("combobox", { name: /categoria/i })).toHaveTextContent(
        "Alimentação",
      );
      expect(screen.getByRole("button", { name: /salvar alterações/i })).toBeInTheDocument();
    });

    it("envia os dados alterados", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<ExpenseForm onSubmit={onSubmit} initialValues={atual} onCancel={vi.fn()} />);

      const valor = screen.getByLabelText(/valor/i);
      await user.clear(valor);
      await user.type(valor, "99,90");
      await user.click(screen.getByRole("combobox", { name: /categoria/i }));
      await user.click(await screen.findByRole("option", { name: "Moradia" }));
      await user.click(screen.getByRole("button", { name: /salvar alterações/i }));

      expect(onSubmit).toHaveBeenCalledWith({
        ...atual,
        amount: "99,90",
        category: "moradia",
      });
    });

    it("aplica as mesmas validações do cadastro", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<ExpenseForm onSubmit={onSubmit} initialValues={atual} onCancel={vi.fn()} />);

      await user.clear(screen.getByLabelText(/descrição/i));
      const valor = screen.getByLabelText(/valor/i);
      await user.clear(valor);
      await user.type(valor, "0");
      await user.click(screen.getByRole("button", { name: /salvar alterações/i }));

      expect(onSubmit).not.toHaveBeenCalled();
      expect(screen.getByText(/a descrição precisa ter pelo menos/i)).toBeInTheDocument();
      expect(screen.getByText(/o valor deve ser maior que zero/i)).toBeInTheDocument();
    });

    it("rejeita data no futuro na edição", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(
        <ExpenseForm
          onSubmit={onSubmit}
          initialValues={{ ...atual, date: "2999-01-01" }}
          onCancel={vi.fn()}
        />,
      );

      await user.click(screen.getByRole("button", { name: /salvar alterações/i }));

      expect(onSubmit).not.toHaveBeenCalled();
      expect(screen.getByText(/a data não pode estar no futuro/i)).toBeInTheDocument();
    });

    it("chama onCancel ao cancelar a edição", async () => {
      const user = userEvent.setup();
      const onCancel = vi.fn();
      const onSubmit = vi.fn();
      render(<ExpenseForm onSubmit={onSubmit} initialValues={atual} onCancel={onCancel} />);

      await user.click(screen.getByRole("button", { name: /cancelar edição/i }));

      expect(onCancel).toHaveBeenCalledTimes(1);
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });
});
