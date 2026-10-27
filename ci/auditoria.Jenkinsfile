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
        sh 'rm -rf reports frontend/reports backend/reports && mkdir -p reports'
      }
    }
    stage('auditoria') {
      steps {
        catchError(buildResult: 'SUCCESS', stageResult: 'UNSTABLE') {
          script {
            ci.node('''
mkdir -p reports
corepack pnpm audit --json > reports/auditoria-frontend.json || true
if corepack pnpm audit > reports/auditoria-frontend.txt; then
  cat reports/auditoria-frontend.txt
else
  cat reports/auditoria-frontend.txt
  exit 1
fi
''')
          }
        }
        catchError(buildResult: 'SUCCESS', stageResult: 'UNSTABLE') {
          script {
            ci.python('''
mkdir -p reports
pip install --no-cache-dir pip-audit==2.7.3 > /dev/null
pip-audit -r requirements.txt -f json -o reports/auditoria-backend.json || true
if pip-audit -r requirements.txt > reports/auditoria-backend.txt 2>&1; then
  cat reports/auditoria-backend.txt
else
  cat reports/auditoria-backend.txt
  exit 1
fi
''')
          }
        }
      }
      post {
        always {
          sh '''#!/bin/sh
{
  echo "Auditoria de dependencias do commit $IMAGE_TAG"
  echo
  echo "Frontend (pnpm audit):"
  tail -n 2 frontend/reports/auditoria-frontend.txt 2>/dev/null || echo "sem relatorio"
  echo
  echo "Backend (pip-audit):"
  grep -E "Found|No known" backend/reports/auditoria-backend.txt 2>/dev/null || echo "sem relatorio"
} > reports/auditoria.txt
cat reports/auditoria.txt
'''
          archiveArtifacts artifacts: 'reports/auditoria.txt,frontend/reports/auditoria-frontend.*,backend/reports/auditoria-backend.*', allowEmptyArchive: true
        }
      }
    }
  }
}
