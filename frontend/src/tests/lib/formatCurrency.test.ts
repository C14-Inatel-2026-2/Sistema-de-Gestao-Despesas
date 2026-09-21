/**
 * Testes unitários de formatação — Entrega 3 (Paulo).
 *
 * Framework: Vitest (escolha do grupo para o frontend).
 *
 * Critérios:
 * - 2 testes COM mock
 * - 2 testes SEM mock
 * - 1 caso negativo
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { formatCurrency, formatDate } from "@/lib/expenses";

describe("formatDate (sem mock)", () => {
  it("converte ISO para o formato brasileiro dd/mm/aaaa", () => {
    expect(formatDate("2026-10-02")).toBe("02/10/2026");
  });
});

describe("formatCurrency (sem mock)", () => {
  it("formata número positivo em BRL", () => {
    const texto = formatCurrency(12.5).replace(/\u00a0/g, " ");
    expect(texto).toBe("R$ 12,50");
  });
});

describe("formatCurrency (com mock)", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("delega a formatação para Intl.NumberFormat", () => {
    const formatSpy = vi.fn().mockReturnValue("R$ 99,90");

    class NumberFormatMock {
      constructor(
        public locale: string,
        public options?: Intl.NumberFormatOptions,
      ) {}

      format(value: number) {
        return formatSpy(value);
      }
    }

    vi.stubGlobal("Intl", {
      ...Intl,
      NumberFormat: NumberFormatMock,
    });

    expect(formatCurrency(99.9)).toBe("R$ 99,90");
    expect(formatSpy).toHaveBeenCalledWith(99.9);
  });

  it("caso negativo: formata NaN sem lançar exceção", () => {
    const formatSpy = vi.fn().mockReturnValue("R$ NaN");

    class NumberFormatMock {
      format(value: number) {
        return formatSpy(value);
      }
    }

    vi.stubGlobal("Intl", {
      ...Intl,
      NumberFormat: NumberFormatMock,
    });

    expect(() => formatCurrency(Number.NaN)).not.toThrow();
    expect(formatSpy).toHaveBeenCalledWith(Number.NaN);
  });
});
