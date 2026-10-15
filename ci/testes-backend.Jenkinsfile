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
    stage('testes-backend') {
      steps {
        script { ci.python('pytest --junitxml=reports/junit.xml --cov=src --cov-report=term-missing --cov-report=html:coverage --cov-report=xml:reports/coverage.xml') }
      }
      post {
        always {
          junit testResults: 'backend/reports/junit.xml', allowEmptyResults: false
          publishHTML(target: [reportDir: 'backend/coverage', reportFiles: 'index.html', reportName: 'Cobertura Backend', keepAll: true, alwaysLinkToLastBuild: true, allowMissing: false])
          archiveArtifacts artifacts: 'backend/reports/**,backend/coverage/**', allowEmptyArchive: false
        }
      }
    }
  }
}
