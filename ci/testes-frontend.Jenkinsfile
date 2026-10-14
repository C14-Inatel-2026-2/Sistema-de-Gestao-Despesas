// Responsável: Marco Di Toro
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
    stage('testes-frontend') {
      steps {
        script { ci.node('corepack pnpm test:ci') }
      }
      post {
        always {
          junit testResults: 'frontend/reports/junit.xml', allowEmptyResults: false
          publishHTML(target: [reportDir: 'frontend/coverage', reportFiles: 'index.html', reportName: 'Cobertura Frontend', keepAll: true, alwaysLinkToLastBuild: true, allowMissing: false])
          archiveArtifacts artifacts: 'frontend/reports/**,frontend/coverage/**', allowEmptyArchive: false
        }
      }
    }
  }
}
