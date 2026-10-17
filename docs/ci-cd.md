# CI/CD — configuração e demonstração da Entrega 4

## Preparar o Jenkins

1. Instale Jenkins LTS com os plugins **Pipeline**, **Pipeline: Multibranch**, **Git**, **GitHub Branch Source**, **JUnit**, **HTML Publisher** e **Job DSL**.
2. Disponibilize um agente Linux com Git, Docker Engine e Docker Compose v2 com suporte a `up --wait`. O usuário do agente precisa executar Docker. Node e Python são usados em containers.
3. Atribua o label `despesas-docker` a **um único agente**: build e deploy precisam usar o mesmo daemon Docker, porque as imagens não são enviadas para registry. Reserve pelo menos dois executores para os jobs de testes em paralelo. O coordenador usa `agent none` e só ocupa executor durante o checkout, liberando-o antes de aguardar os outros jobs.
4. Se o agente estiver em container, o caminho absoluto do workspace deve existir com o mesmo caminho no host Docker, pois os testes usam bind mounts. Um agente instalado diretamente no host simplifica essa configuração.
5. Reserve as portas 3000 e 8000 no host de deploy. Para modificá-las, configure `FRONTEND_PORT` e `BACKEND_PORT` como variáveis do agente. O volume `despesas_backend-data` guarda o SQLite entre os deploys.

Este ambiente é uma demonstração em um único host. O frontend atual usa despesas no localStorage, como já acontece no desenvolvimento; subir a API não muda essa integração. O backend usa SQLite persistente por padrão; não são necessários segredos para esta configuração.

## Criar os oito jobs

1. Crie um job Freestyle chamado `despesas-seed`, com SCM Git apontando para este repositório.
2. Selecione a branch que contém a configuração. Para validar antes do merge, use `ci/entrega-4-jenkins` e altere `pipelineBranch` em `ci/jobs.groovy` para essa branch. Depois do merge, use `main` nos dois locais.
3. Adicione a etapa **Process Job DSLs**, escolha o arquivo `ci/jobs.groovy` e execute. Se a instalação exigir aprovação administrativa de scripts, o administrador deve revisar e aprovar o DSL no Jenkins.
4. Confirme os dez jobs na pasta `despesas`. Cada um tem um Jenkinsfile próprio. Paulo Vicente é responsável por `qualidade`, `testes-frontend`, `testes-backend`, `build` e `deploy`; João Victor Siécola Souza é responsável por `auditoria` e `smoke-test`; Gabriel Gazotti é responsável por `cobertura-minima`; André Dias Balbino é responsável por `migracoes`; Marco Di Toro é responsável por `lint-docker`. O seed pode ser executado novamente para atualizar a configuração.

## Criar o coordenador e disparar

1. Crie um **Multibranch Pipeline** chamado `despesas-pipeline` com **GitHub Branch Source** para `C14-Inatel-2026-2/Sistema-de-Gestao-Despesas`, usando `Jenkinsfile` como Script Path.
2. Habilite descoberta de branches e PRs do próprio repositório. Para os PRs, selecione a revisão da branch de origem (head), pois os jobs precisam receber um SHA existente no repositório. Restrinja a execução a branches e PRs confiáveis da equipe, já que os jobs têm acesso ao Docker do host.
3. Configure credenciais GitHub de leitura se necessárias para a descoberta. Habilite webhook de push e pull request em `https://SEU-JENKINS/github-webhook/`, ou configure varredura periódica no multibranch se o Jenkins não estiver acessível pelo GitHub.
4. Execute **Scan Multibranch Pipeline Now**, abra a branch e clique em **Build Now**. O coordenador chama os jobs por caminho absoluto `/despesas/...` e propaga falhas.

O coordenador faz qualidade → testes em paralelo → cobertura mínima → auditoria → lint Docker → build → deploy → smoke test. Branches e PRs rodam até o build. O deploy exige a branch `main`, sem contexto de PR, e verifica novamente que o SHA corresponde à ponta remota da `main`. Um build antigo é recusado se um novo commit já chegou à `main`. Os jobs não têm gatilhos próprios: o caminho normal é sempre pelo coordenador.

Cada job faz checkout do SHA recebido em `SOURCE_COMMIT`. O build cria `despesas-frontend:SHA` e `despesas-backend:SHA`. O deploy executa `docker compose -p despesas up -d --no-build --wait --wait-timeout 180`; não recompila e não remove o volume de dados. Em falhas, o Jenkins mostra o estado dos serviços e os últimos logs. Não há rollback automático; use uma imagem previamente validada em uma recuperação manual.

O job `cobertura-minima` roda depois dos testes, em todas as branches e PRs. Ele exige pelo menos 80% de cobertura de linhas e statements no frontend (Vitest) e no backend (pytest-cov). O limite fica na variável de ambiente `COBERTURA_MINIMA` do Jenkinsfile do job; altere esse valor e rode o seed novamente se a equipe quiser endurecer ou afrouxar o gate. Cobertura abaixo do limite deixa o job e o coordenador vermelhos e impede o build. Em **Artifacts** ficam `frontend/reports/cobertura-minima.txt` e `backend/reports/cobertura-minima.txt`.

O job `auditoria` roda em todas as branches e PRs. Ele executa `pnpm audit` no frontend e `pip-audit -r requirements.txt` no backend e consulta bases públicas de vulnerabilidades, por isso precisa de acesso à internet. Vulnerabilidades encontradas deixam o estágio amarelo (unstable), mas o job termina com sucesso e não bloqueia o build nem o deploy, porque novos alertas são publicados mesmo sem mudanças no código. Em **Artifacts** ficam `reports/auditoria.txt` (resumo por severidade) e os relatórios completos em texto e JSON de cada aplicação.

O job `lint-docker` roda antes do build, em todas as branches e PRs. Ele executa o hadolint (imagem `hadolint/hadolint:v2.12.0`) em `frontend/Dockerfile` e `backend/Dockerfile` e valida o `docker-compose.yml` com `docker compose config`. Qualquer aviso do hadolint ou erro no compose deixa o job vermelho. O resultado fica em **Artifacts** (`reports/lint-docker.txt`).

Depois do deploy, o job `smoke-test` faz quatro chamadas HTTP pelo container `curlimages/curl`, na rede do host: frontend com HTTP 200, `/health` com `status: ok`, `GET /despesas` com HTTP 200 e um `POST /despesas` inválido, que deve ser recusado com HTTP 422 sem gravar dados. Cada verificação é registrada em `reports/smoke-test.txt`, publicado em **Artifacts**; qualquer falha deixa o job e o coordenador vermelhos. As portas seguem `FRONTEND_PORT` e `BACKEND_PORT`, como no deploy.

## Relatórios e evidências

Nos jobs `testes-frontend` e `testes-backend`, abra a execução e consulte:

- **Test Result**: quantidade de testes, falhas e histórico JUnit;
- **Cobertura Frontend** / **Cobertura Backend**: relatório HTML com percentual por arquivo e linhas;
- **Artifacts**: download de JUnit XML, cobertura XML e todo o relatório HTML para abrir localmente.

O frontend usa V8 com Vitest; o backend usa pytest-cov. Os relatórios são publicados no `post { always }` da etapa de testes. Se a instalação de dependências impedir até mesmo a execução dos testes, a falta de relatório é tratada como falha, sem reaproveitar arquivos antigos. A política de segurança de conteúdo do Jenkins pode limitar recursos visuais do HTML; nesse caso, baixe os artefatos e abra `index.html` localmente, sem desativar a proteção global.

Para a entrega, registre a tela do coordenador, os dez jobs, resultados JUnit, as duas coberturas, os `cobertura-minima.txt` do gate de cobertura, o `auditoria.txt` da auditoria, o deploy saudável, o `smoke-test.txt` do smoke test e o `lint-docker.txt` do lint Docker. No host, confira `http://localhost:3000` e `http://localhost:8000/health`. O líder deve enviar o link do repositório; configurar o Jenkins e obter as aprovações são passos externos ao código.

## Reproduzir testes localmente

Use Node 22 e pnpm 11.10.0, conforme `packageManager` e as imagens do pipeline:

```bash
cd frontend
corepack pnpm install --frozen-lockfile
corepack pnpm lint
corepack pnpm type-check
corepack pnpm test:ci
corepack pnpm exec vitest run --coverage \
  --coverage.reporter=text-summary \
  --coverage.thresholds.lines=80 \
  --coverage.thresholds.statements=80
```

Use Python 3.12 em um ambiente virtual:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements-ci.txt
ruff check src tests
pytest --junitxml=reports/junit.xml --cov=src --cov-report=term-missing --cov-report=html:coverage --cov-report=xml:reports/coverage.xml
pytest -q --cov=src --cov-report=term --cov-fail-under=80
```

Para validar os containers localmente:

```bash
docker compose config --quiet
docker compose build
docker compose -p despesas-validacao up -d --no-build --wait --wait-timeout 180
docker compose -p despesas-validacao ps
docker compose -p despesas-validacao down
```

Os relatórios não são commitados. O commit segue Conventional Commits e o PR deve ter labels e dois revisores. A exigência de duas aprovações precisa ser configurada nas regras de proteção da `main` por um administrador, caso se queira bloqueio automático de merge; solicitar dois revisores por si só não impõe essa regra.

Referências: [HTML Publisher no Jenkins](https://www.jenkins.io/doc/pipeline/steps/htmlpublisher/) e [cobertura no Vitest](https://vitest.dev/guide/coverage.html).

## Validação desta implementação

| Verificação local | Resultado |
| --- | --- |
| Vitest no Node 22 | 65 testes aprovados; 85,84% das linhas cobertas |
| pytest no Python 3.12 | 21 testes aprovados; 86% de cobertura |
| ESLint, TypeScript e Ruff | Aprovados |
| Relatórios | JUnit XML, cobertura HTML e XML gerados nas duas aplicações |
| Docker Compose | Configuração validada e duas imagens construídas |
| Deploy de validação | Dois containers saudáveis; frontend HTTP 200 e API `/health` com `status: ok` |

A execução completa dos Jenkinsfiles, a criação dos jobs pelo seed e a publicação dentro do Jenkins dependem de uma instância Jenkins configurada conforme este roteiro. Esses passos ainda não foram executados. O deploy local foi encerrado após a validação.
