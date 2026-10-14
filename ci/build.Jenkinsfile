// Responsável: Paulo Vicente
def ci
pipeline {
  agent { label 'despesas-docker' }
  options {
    timestamps()
    disableConcurrentBuilds()
    buildDiscarder(logRotator(numToKeepStr: '20'))
    timeout(time: 20, unit: 'MINUTES')
  }
  parameters { string(name: 'SOURCE_COMMIT', defaultValue: '', description: 'SHA completo recebido do pipeline coordenador') }
  stages {
    stage('Preparar') {
      steps {
        script {
          ci = load 'ci/common.groovy'
          ci.prepare()
        }
        sh 'rm -rf frontend/reports frontend/coverage backend/reports backend/coverage'
      }
    }
    stage('build') {
      steps {
        sh 'docker compose build'
      }

    }
  }
}
