// Coordenador: lê o Jenkinsfile da raiz do repositório, só na branch main.
multibranchPipelineJob('despesas-pipeline') {
    branchSources {
        branchSource {
            source {
                git {
                    id('despesas')
                    remote('https://github.com/C14-Inatel-2026-2/Sistema-de-Gestao-Despesas.git')
                    traits {
                        gitBranchDiscovery()
                        headWildcardFilter {
                            includes('main')
                            excludes('')
                        }
                    }
                }
            }
        }
    }
    triggers {
        periodicFolderTrigger { interval('1m') }
    }
    factory {
        workflowBranchProjectFactory {
            scriptPath('Jenkinsfile')
        }
    }
}
