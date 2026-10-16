# Sistema de Gestão de Despesas

Aplicação web para controle de despesas pessoais: cadastro, categorização, filtros por período e acompanhamento dos gastos.

Frontend em Next.js hospedado na Vercel, backend em Python com API REST.

## Integrantes

| Integrante                    | Responsabilidades      |
| ----------------------------- | ---------------------- |
| **Marco Di Toro**               | UI/UX, Backend e QA    |
| **Gabriel Texeira**           | Frontend e QA          |
| **Paulo Vicente**             | DevOps, CI/CD e QA     |
| **André Dias Balbino**        | Frontend, Backend e QA |
| **João Victor Siécola Souza** | Frontend, Backend e QA |

## Objetivo

Permitir que o usuário registre seus gastos e visualize suas informações financeiras de forma organizada.

Funcionalidades previstas:

* Cadastro, edição, exclusão e listagem de despesas;
* Categorização de gastos;
* Filtros por período e categoria;
* Visualização do total de despesas;
* Dashboard para acompanhamento;
* Interface responsiva.

---

## Tecnologias

### Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS
* shadcn/ui
* Node.js
* pnpm

### Backend

* Python
* FastAPI
* SQLAlchemy
* Alembic
* PostgreSQL
* Swagger / OpenAPI
* Ruff

### Testes

* Vitest
* pytest
* Playwright
* Postman

### DevOps

* Git e GitHub
* Jenkins
* Docker e Docker Compose
* Vercel

---

## Arquitetura

O sistema é dividido em duas aplicações independentes que conversam por HTTP/JSON. O frontend não acessa o banco diretamente: tudo passa pela API.

```mermaid
flowchart LR
    user["Usuário<br/>navegador"]

    subgraph vercel["Vercel"]
        front["Frontend<br/>Next.js + TypeScript"]
    end

    subgraph infra["Servidor / Container"]
        api["Backend<br/>FastAPI"]
        docs["Swagger UI<br/>/docs"]
        db[("PostgreSQL")]
    end

    user -->|HTTPS| front
    front -->|"JSON via NEXT_PUBLIC_API_URL"| api
    api -->|SQLAlchemy| db
    api -.->|gera automaticamente| docs
    docs -.->|contrato da API| front
```

### Fluxo de uma requisição

Cadastro de uma despesa, do clique até a tela atualizada:

```mermaid
sequenceDiagram
    actor U as Usuário
    participant F as Frontend
    participant A as API
    participant D as Banco

    U->>F: Preenche o formulário
    F->>F: Valida os dados no cliente
    F->>A: POST /despesas
    A->>A: Valida os dados no servidor
    A->>D: Grava a despesa
    D-->>A: Despesa criada
    A-->>F: 201 Created + JSON
    F-->>U: Atualiza a lista e o total
```

A validação acontece dos dois lados: no frontend para dar retorno imediato ao usuário, e no backend porque a API pode ser chamada por qualquer cliente.

---

## API e documentação

O FastAPI gera a documentação a partir do próprio código, então ela não desatualiza em relação aos endpoints reais. Quem trabalha no frontend consulta o `/docs` para saber o formato de cada requisição, sem precisar ler o código do backend.

| Rota            | Para que serve                                   |
| --------------- | ------------------------------------------------ |
| `/docs`         | Swagger UI, permite testar os endpoints no navegador |
| `/openapi.json` | Contrato da API em JSON                          |

Endpoints previstos:

| Método   | Rota             | Descrição            |
| -------- | ---------------- | -------------------- |
| `GET`    | `/despesas`      | Lista as despesas    |
| `POST`   | `/despesas`      | Cadastra uma despesa |
| `PUT`    | `/despesas/{id}` | Edita uma despesa    |
| `DELETE` | `/despesas/{id}` | Exclui uma despesa   |
| `GET`    | `/categorias`    | Lista as categorias  |

---

## Estrutura do projeto

```text
Sistema-de-Gestao-Despesas/
│
├── frontend/
│   ├── src/
│   │   ├── app/         # Rotas (App Router)
│   │   ├── components/  # Componentes de UI
│   │   ├── hooks/       # Estado compartilhado
│   │   ├── lib/         # Regras de negócio
│   │   ├── tests/       # Testes Vitest (components, data, lib)
│   │   └── types/       # Tipos do domínio
│   ├── public/
│   ├── Dockerfile
│   └── package.json
│
├── backend/
│   ├── src/
│   ├── tests/
│   ├── alembic/         # Migrações do banco
│   └── requirements.txt
│
├── docker-compose.yml
├── Jenkinsfile
├── .gitignore
└── README.md
```

---

## Testes

| Camada              | Ferramenta               | O que cobre                          |
| ------------------- | ------------------------ | ------------------------------------ |
| Unitário (frontend) | Vitest + Testing Library | Regras de negócio e componentes      |
| Unitário (backend)  | pytest                   | Validações e regras da API           |
| Integração (API)    | pytest + `TestClient`    | Endpoints reais, requisição/resposta |
| Ponta a ponta       | Playwright               | Fluxos completos no navegador        |
| Exploratório        | Postman                  | Testes manuais e demonstração        |

O `TestClient` do FastAPI usa httpx por baixo, então os testes de integração batem nos endpoints de verdade sem precisar subir um servidor. A collection do Postman deve ser importada do `/openapi.json`, para não ser mantida à mão quando a API mudar.

Rodando os testes do frontend:

```bash
cd frontend
pnpm install
pnpm test
```

Rodando o frontend em desenvolvimento:

```bash
cd frontend
pnpm install
pnpm dev
```

Se o comando `pnpm` não for reconhecido no Windows, instale uma vez com:

```bash
npm install -g pnpm
```

Abra `http://localhost:3000`. Na primeira visita o app carrega despesas mock no `localStorage` para facilitar a demonstração (cadastro, filtros, exclusão e totais).

Rodando os testes do backend:

```bash
cd backend
pip install -r requirements.txt
pytest
```

Funcionalidades já cobertas:

* Validação de valores de despesas;
* Cadastro de despesas (unitário e de componente);
* Listagem, exclusão e estados vazios (componente);
* Cálculo do total de despesas e resumo por categoria (domínio e componente);
* Filtro de despesas por categoria e por período (domínio e componente);
* Mock inicial.

---

## Pipeline de CI/CD — Entrega 4

O pipeline usa **Jenkins**, sem GitHub Actions. O `Jenkinsfile` coordena oito jobs independentes, definidos em `ci/`:

| Job | Responsável | Resultado |
| --- | --- | --- |
| `despesas/qualidade` | Paulo Vicente | ESLint, TypeScript e Ruff |
| `despesas/testes-frontend` | Paulo Vicente | Vitest, JUnit e cobertura HTML/XML |
| `despesas/testes-backend` | Paulo Vicente | pytest, JUnit e cobertura HTML/XML |
| `despesas/cobertura-minima` | Gabriel Gazotti | Vitest e pytest-cov com mínimo de 80% de cobertura; falha o pipeline abaixo disso |
| `despesas/auditoria` | João Victor Siécola Souza | `pnpm audit` e `pip-audit` sobre as dependências, sem bloquear o pipeline |
| `despesas/build` | Paulo Vicente | Imagens Docker do frontend e backend |
| `despesas/deploy` | Paulo Vicente | Deploy com healthchecks e volume persistente |
| `despesas/smoke-test` | João Victor Siécola Souza | Chamadas HTTP reais ao frontend e à API após o deploy |

Para atender ao requisito de pelo menos um job por integrante, os demais integrantes ainda devem definir e comprovar suas próprias contribuições.

```mermaid
flowchart LR
    A[Push / PR] --> B[Qualidade]
    B --> C[Testes frontend]
    B --> D[Testes backend]
    C --> M[Cobertura mínima]
    D --> M
    M --> X[Auditoria de dependências]
    X --> E[Build das imagens]
    E --> F{Branch main?}
    F -->|Sim| G[Deploy Docker Compose]
    F -->|Não| H[Aguarda revisão e merge]
    G --> I[Smoke test]
```

Falhas ou testes instáveis impedem as próximas etapas. Todos os jobs recebem o mesmo SHA; as imagens são identificadas por esse SHA. O deploy roda apenas na `main`, reutiliza as imagens do build e aguarda frontend e API ficarem saudáveis. Em seguida, o smoke test acessa o frontend, `/health` e `GET /despesas`, e confirma que um `POST /despesas` inválido é recusado com 422; o resultado fica em **Artifacts** (`reports/smoke-test.txt`). Este deploy usa Docker Compose no agente Jenkins; a hospedagem existente na Vercel continua independente.

Em cada execução dos jobs de testes, abra **Test Result** para consultar os resultados e **Cobertura Frontend** ou **Cobertura Backend** para visualizar os arquivos e linhas cobertas. Os relatórios HTML e XML também ficam disponíveis em **Artifacts**, inclusive quando há falha nos testes. A cobertura inclui arquivos da aplicação sem testes. O job `cobertura-minima` exige pelo menos 80% de cobertura de linhas e statements no frontend e no backend; abaixo disso o pipeline falha antes do build.

O roteiro de instalação, execução, evidências e limitações está em [docs/ci-cd.md](docs/ci-cd.md).

---

## Dependências

| Parte    | Arquivo                            | Observação                                        |
| -------- | ---------------------------------- | ------------------------------------------------- |
| Frontend | `package.json`, `pnpm-lock.yaml`   | Use sempre `pnpm`; o lockfile é dele              |
| Backend  | `requirements.txt`                 | Instalado com `pip install -r requirements.txt`   |

As mudanças no banco são versionadas com Alembic: toda alteração de tabela vira um arquivo de migração commitado junto com o código, e os integrantes atualizam o banco local com um comando.

```bash
alembic upgrade head
```

---

## Fluxo de trabalho

Cada integrante trabalha na própria branch e envia as alterações por Pull Request, que precisa ser aprovado por **dois outros integrantes** antes do merge na `main`. Cada integrante deve fazer no mínimo um commit no projeto.

```bash
git checkout -b feature/nome-da-feature
```

Os commits seguem o padrão Conventional Commits:

```bash
git commit -m "feat: adiciona cadastro de despesas"
git commit -m "fix: corrige cálculo do total"
git commit -m "ci: adiciona pipeline do Jenkins"
git commit -m "docs: atualiza documentação"
```

---

## Requisitos da Entrega Inicial

* [x] Definição do projeto;
* [x] Definição das tecnologias;
* [x] Definição inicial da arquitetura;
* [x] Definição das responsabilidades dos integrantes;
* [x] Criar estrutura inicial de pastas;
* [x] Desenvolver pelo menos uma pequena funcionalidade testável;
* [x] Criar `requirements.txt`;
* [x] Criar `package.json`;
* [ ] Cada integrante realizar pelo menos 1 commit;
* [ ] Cada alteração ser enviada através de Pull Request;
* [ ] Pull Requests serem aprovados por outro integrante;
* [x] Configurar CI/CD inicial.

---

## Requisitos da Entrega 4

* [x] Pipeline Jenkins com Build, Testes e Deploy;
* [x] Oito jobs independentes;
* [ ] Definir e comprovar pelo menos um job por integrante;
* [x] Relatórios JUnit e cobertura HTML/XML no frontend e backend;
* [x] Publicação dos relatórios e artefatos no Jenkins;
* [x] Deploy da `main` com Docker Compose e healthchecks;
* [ ] Configurar a instância Jenkins e executar o pipeline completo;
* [ ] Registrar evidências da execução e das coberturas;
* [ ] Obter duas aprovações no PR;
* [ ] Líder enviar o link do repositório até **17/10/2026 às 23:59**.

## Status

Em desenvolvimento. A configuração da Entrega 4 está versionada; a validação completa no Jenkins e as evidências da execução devem ser concluídas antes do envio.
