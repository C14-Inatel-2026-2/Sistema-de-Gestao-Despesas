// Execute este arquivo em um seed job com o plugin Job DSL.
// Use main após o merge; para validar este PR, use ci/entrega-4-jenkins.
def pipelineBranch = 'main'
def repository = 'https://github.com/C14-Inatel-2026-2/Sistema-de-Gestao-Despesas.git'
folder('despesas') {
    description('Entrega 4 — jobs de CI/CD da equipe')
}
[
    'qualidade': 'Paulo Vicente',
    'testes-frontend': 'Paulo Vicente',
    'testes-backend': 'Paulo Vicente',
    'build': 'Paulo Vicente',
    'deploy': 'Paulo Vicente'
].each { jobName, owner ->
    pipelineJob("despesas/${jobName}") {
        description("Responsável: ${owner}. Executado pelo pipeline coordenador.")
        parameters {
            stringParam('SOURCE_COMMIT', '', 'SHA completo do commit validado')
        }
        definition {
            cpsScm {
                scm {
                    git {
                        remote { url(repository) }
                        branch("*/${pipelineBranch}")
                    }
                }
                scriptPath("ci/${jobName}.Jenkinsfile")
            }
        }
    }
}
