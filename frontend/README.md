# Frontend — Sistema de Gestão de Despesas

Interface web construída com **Next.js (App Router)**, **React**, **TypeScript** e **Tailwind CSS**.

## Como rodar

```bash
pnpm install
pnpm dev          # http://localhost:3000
```

## Scripts

| Script             | O que faz                                    |
| ------------------ | -------------------------------------------- |
| `pnpm dev`         | Servidor de desenvolvimento                  |
| `pnpm build`       | Build de produção                            |
| `pnpm start`       | Sobe o build de produção                     |
| `pnpm lint`        | ESLint                                       |
| `pnpm type-check`  | Checagem de tipos do TypeScript              |
| `pnpm test`        | Testes (Vitest) uma vez                      |
| `pnpm test:watch`  | Testes em modo watch                         |

## Estrutura

```text
src/
├── app/                    # Rotas do App Router
│   ├── layout.tsx
│   ├── page.tsx            # Dashboard de despesas
│   └── globals.css
├── components/             # Componentes de UI
│   ├── ExpenseForm.tsx     # Cadastro com validação
│   ├── ExpenseFilters.tsx  # Filtros por categoria e período
│   ├── ExpenseList.tsx     # Listagem e exclusão
│   └── ExpenseSummary.tsx  # Total, média e gastos por categoria
├── hooks/
│   └── useExpenses.ts      # Estado das despesas (localStorage por enquanto)
├── lib/
│   ├── expenses.ts         # Regras de negócio (funções puras)
│   └── expenses.test.ts    # Testes unitários das regras
└── types/
    └── expense.ts          # Tipos e categorias
```

## Onde ficam as regras de negócio

Toda a lógica testável vive em [`src/lib/expenses.ts`](src/lib/expenses.ts), em funções puras, separada da UI:

- `parseAmount` — converte o valor digitado (aceita `1.234,56` e `1234.56`);
- `validateExpense` — valida descrição, valor, categoria e data;
- `calculateTotal` — soma as despesas sem erro de ponto flutuante;
- `filterExpenses` — filtra por categoria e por período;
- `totalsByCategory` — agrupa os gastos por categoria.

Isso mantém os testes rápidos e independentes de React.

## Persistência

Os dados ficam em `localStorage` (`src/hooks/useExpenses.ts`). Quando a API Python
existir, basta trocar a implementação desse hook — nada mais precisa mudar.
