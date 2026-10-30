import { afterEach, describe, expect, it, vi } from "vitest";
import {
  csvFileName,
  downloadCsv,
  expensesToCsv,
  formatCsvAmount,
} from "@/lib/exportCsv";
import type { Expense } from "@/types/expense";

const expenses: Expense[] = [
  { id: "1", description: "Supermercado", amount: 1500, category: "alimentacao", date: "2026-08-15" },
  { id: "2", description: "Farmácia", amount: 67.4, category: "saude", date: "2026-08-20" },
];

describe("expensesToCsv", () => {
  it("gera cabeçalho e uma linha por despesa no formato brasileiro", () => {
    const csv = expensesToCsv(expenses);

    expect(csv.split("\r\n")).toEqual([
      "Data;Descrição;Categoria;Valor",
      "15/08/2026;Supermercado;Alimentação;1500,00",
      "20/08/2026;Farmácia;Saúde;67,40",
    ]);
  });

  it("devolve apenas o cabeçalho quando a lista está vazia", () => {
    expect(expensesToCsv([])).toBe("Data;Descrição;Categoria;Valor");
  });

  it("coloca entre aspas descrições com ponto e vírgula ou aspas", () => {
    const csv = expensesToCsv([
      { id: "3", description: 'Pizza; refri e "sobremesa"', amount: 80, category: "lazer", date: "2026-08-01" },
    ]);

    expect(csv.split("\r\n")[1]).toBe('01/08/2026;"Pizza; refri e ""sobremesa""";Lazer;80,00');
  });

  it("neutraliza descrições que o Excel interpretaria como fórmula", () => {
    const csv = expensesToCsv([
      { id: "4", description: "=SOMA(A1:A9)", amount: 10, category: "outros", date: "2026-08-02" },
    ]);

    expect(csv.split("\r\n")[1]).toBe("02/08/2026;'=SOMA(A1:A9);Outros;10,00");
  });
});

describe("formatCsvAmount e csvFileName", () => {
  it("usa vírgula decimal com duas casas", () => {
    expect(formatCsvAmount(0.5)).toBe("0,50");
    expect(formatCsvAmount(1234.567)).toBe("1234,57");
  });

  it("monta o nome do arquivo com a data", () => {
    expect(csvFileName("2026-10-30")).toBe("despesas-2026-10-30.csv");
  });
});

describe("downloadCsv", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("baixa um arquivo CSV em UTF-8 com BOM e libera a URL criada", async () => {
    const createObjectURL = vi.fn<(blob: Blob) => string>(() => "blob:despesas");
    const revokeObjectURL = vi.fn();
    vi.stubGlobal("URL", { ...URL, createObjectURL, revokeObjectURL });
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});

    downloadCsv("Data;Valor", "despesas-2026-10-30.csv");

    const blob = createObjectURL.mock.calls[0][0];
    expect(blob.type).toBe("text/csv;charset=utf-8");
    const bytes = new Uint8Array(await blob.arrayBuffer());
    expect([...bytes.slice(0, 3)]).toEqual([0xef, 0xbb, 0xbf]);
    expect(new TextDecoder().decode(bytes)).toBe("Data;Valor");

    const link = click.mock.contexts[0] as HTMLAnchorElement;
    expect(link.download).toBe("despesas-2026-10-30.csv");
    expect(link.getAttribute("href")).toBe("blob:despesas");
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:despesas");
    expect(document.querySelector("a[download]")).toBeNull();
  });
});
