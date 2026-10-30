# Jenkins local

Sobe um Jenkins em Docker já configurado para rodar o pipeline da Entrega 4 (`Jenkinsfile` e `ci/`), sem cliques na interface. A configuração é feita por JCasC: o label `despesas-docker`, os 10 jobs (`ci/jobs.groovy`) e o coordenador `despesas-pipeline`, que lê a branch `main` do GitHub.

## Requisitos

Docker com Compose v2 (OrbStack ou Docker Desktop). As portas 8080 (Jenkins), 3100 (frontend) e 8100 (API) precisam estar livres. As duas últimas são as do deploy do pipeline; mude-as em `casc/jenkins.yaml` se necessário.

## Subir

```bash
cd ci/jenkins-local
mkdir -p ~/jenkins-despesas-home
export JENKINS_HOME_DIR=$HOME/jenkins-despesas-home
docker compose up -d --build
```

Abra http://localhost:8080. Os jobs ficam na pasta `despesas` e o coordenador em `despesas-pipeline`. O scan da `main` dispara o primeiro build sozinho; para rodar de novo, use **Build Now** na branch `main`.

O `JENKINS_HOME_DIR` precisa existir com o mesmo caminho no host e no container, porque os jobs fazem `docker run -v $PWD/...` e quem resolve o caminho é o daemon Docker do host.

## Onde ver os resultados

Em cada execução de job: **Test Result**, **Cobertura Frontend** / **Cobertura Backend** e **Artifacts** (`lint-docker.txt`, `cobertura-minima.txt`, `auditoria.txt`, `smoke-test.txt`). Depois do deploy, o frontend fica em http://localhost:3100 e a API em http://localhost:8100/health.

## Observações

- Sem autenticação e só em `127.0.0.1`: serve apenas para uso local.
- O Jenkins usa o socket do Docker do host, então os containers de build e de deploy aparecem no seu Docker.
- Os jobs reinstalam as dependências a cada execução. Com internet lenta, o primeiro build pode levar vários minutos.

## Parar

```bash
docker compose down
```
