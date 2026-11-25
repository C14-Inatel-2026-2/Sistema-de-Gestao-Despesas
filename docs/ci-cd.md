# CI/CD — configuração do Jenkins

Roteiro para montar o pipeline da Entrega 4. A descrição dos jobs e do fluxo está no [README](../README.md#pipeline-de-cicd--entrega-4).

## Preparar o Jenkins

1. Instale Jenkins LTS com os plugins **Pipeline**, **Pipeline: Multibranch**, **Git**, **GitHub Branch Source**, **JUnit**, **HTML Publisher** e **Job DSL**.
2. Disponibilize um agente Linux com Git, Docker Engine e Docker Compose v2, e dê a ele o label `despesas-docker`. Use **um único agente**: build e deploy precisam do mesmo daemon Docker, porque as imagens não vão para um registry. Reserve pelo menos dois executores.
3. Se o agente rodar em container, o caminho do workspace deve ser o mesmo no host Docker, pois os testes usam bind mounts.
4. Libere as portas 3000 e 8000 no host de deploy (ou defina `FRONTEND_PORT` e `BACKEND_PORT`). O volume `despesas_backend-data` guarda o SQLite entre os deploys. Não são necessários segredos.

## Criar os dez jobs

1. Crie um job Freestyle `despesas-seed`, com SCM Git apontando para este repositório.
2. Adicione a etapa **Process Job DSLs** com o arquivo `ci/jobs.groovy` e execute. Se o Jenkins pedir, um administrador precisa aprovar o script. O seed pode ser reexecutado para atualizar a configuração.
3. Confirme os jobs na pasta `despesas`. Os responsáveis de cada um estão no `ci/jobs.groovy` e no README.

## Criar o coordenador e disparar

1. Crie um **Multibranch Pipeline** `despesas-pipeline` com **GitHub Branch Source** para `C14-Inatel-2026-2/Sistema-de-Gestao-Despesas` e `Jenkinsfile` como Script Path.
2. Habilite a descoberta de branches e PRs do próprio repositório, usando a revisão da branch de origem (head). Restrinja a execução a branches da equipe, pois os jobs acessam o Docker do host.
3. Configure o webhook em `https://SEU-JENKINS/github-webhook/` ou uma varredura periódica.
4. Execute **Scan Multibranch Pipeline Now** e **Build Now** na branch.

Branches e PRs rodam até o build; o deploy e o smoke test só rodam na `main`, sem contexto de PR, e recusam um SHA que não seja mais a ponta da `main`.

## Evidências para a entrega

Registre a tela do coordenador, os dez jobs, os resultados JUnit, as duas coberturas, o deploy saudável e os arquivos em **Artifacts** (`cobertura-minima.txt`, `auditoria.txt`, `lint-docker.txt`, `smoke-test.txt`). No host, confira `http://localhost:3000` e `http://localhost:8000/health`.

## Reproduzir localmente

Frontend (Node 22 e pnpm 11.10.0):

```bash
cd frontend
corepack pnpm install --frozen-lockfile
corepack pnpm lint
corepack pnpm type-check
corepack pnpm test:ci
```

Backend (Python 3.12):

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements-ci.txt
ruff check src tests
pytest --cov=src --cov-report=term --cov-fail-under=80
```

Containers:

```bash
docker compose config --quiet
docker compose build
docker compose -p despesas-validacao up -d --no-build --wait --wait-timeout 180
docker compose -p despesas-validacao down
```

A exigência de duas aprovações por PR só bloqueia o merge se um administrador configurar a proteção da `main`.

## US06 — comprovação e limites

O Jenkins local verifica novos commits na `main` a cada minuto. Mantenha a
instância ligada para executar testes, build, deploy Docker e smoke após merges.
Falhas dos jobs são propagadas ao coordenador e impedem deploy e smoke.

O job de deploy arquiva `reports/deploy.txt` com SHA, data UTC e estado dos
containers. O smoke arquiva `reports/smoke-test.txt` com SHA, data UTC, URLs e
resultados; verifica também o endereço público da Vercel (substituível pela
variável `PUBLIC_FRONTEND_URL`). Falhas HTTP ou de conexão reprovam o smoke.

O deploy cria uma publicação de produção na Vercel pela API, usando o SHA
aprovado, aguarda `READY` e a atribuição de domínio e verifica o SHA retornado.
O artefato `reports/vercel-deploy.json` registra ID, URL, SHA e data UTC.
`frontend/vercel.json` desativa os deploys automáticos da integração Git,
impedindo que ela publique antes dos testes do Jenkins.

Antes do merge, configure no Jenkins:

- credencial **Secret text** de ID `vercel-token`, com token da conta Vercel;
- variável global `VERCEL_PROJECT_ID`, com o ID do projeto existente;
- `VERCEL_TEAM_ID` se o projeto pertencer a uma equipe.

O projeto Vercel deve continuar vinculado a este repositório, com Root Directory
`frontend` e domínio `sistema-de-gestao-despesas.vercel.app`. Sem credencial ou
projeto, o deploy falha; não há fallback que ignore a publicação. Mantenha o
Jenkins ligado antes do merge: os deploys automáticos da Vercel serão desativados.
A API permanece no host Docker do Jenkins, verificada pelo smoke local.

Referências: [criação de deploy](https://vercel.com/docs/rest-api/deployments/create-a-new-deployment)
e [controle de deploy automático](https://vercel.com/docs/project-configuration/git-configuration).

Para encerrar a #31, registre uma execução bem-sucedida do coordenador na
`main`, anexe os dois artefatos e demonstre que um teste falhando impede a
publicação de produção. Não marque a história concluída apenas com base no
smoke da versão que já está no ar.
