// Responsável: Gabriel Gazotti
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
  environment {
    COBERTURA_MINIMA = '80'
  }
  stages {
    stage('Preparar') {
      steps {
        script {
          ci = load 'ci/common.groovy'
          ci.prepare()
        }
        sh 'rm -rf frontend/reports frontend/coverage backend/reports backend/coverage && mkdir -p frontend/reports backend/reports'
      }
    }
    stage('cobertura-frontend') {
      steps {
        script {
          def minimo = env.COBERTURA_MINIMA
          ci.node("""
set +e
mkdir -p reports
{
  echo "== cobertura minima frontend (>= ${minimo}%) ==" &&
  corepack pnpm exec vitest run --coverage \\
    --coverage.reporter=text-summary \\
    --coverage.thresholds.lines=${minimo} \\
    --coverage.thresholds.statements=${minimo}
} > reports/cobertura-minima.txt 2>&1
status=\$?
cat reports/cobertura-minima.txt
exit "\$status"
""")
        }
      }
    }
    stage('cobertura-backend') {
      steps {
        script {
          def minimo = env.COBERTURA_MINIMA
          ci.python("""
set +e
mkdir -p reports
{
  echo "== cobertura minima backend (>= ${minimo}%) ==" &&
  pytest -q --cov=src --cov-report=term --cov-fail-under=${minimo}
} > reports/cobertura-minima.txt 2>&1
status=\$?
cat reports/cobertura-minima.txt
exit "\$status"
""")
        }
      }
      post {
        always {
          archiveArtifacts artifacts: 'frontend/reports/cobertura-minima.txt,backend/reports/cobertura-minima.txt', allowEmptyArchive: true
        }
      }
    }
  }
}
