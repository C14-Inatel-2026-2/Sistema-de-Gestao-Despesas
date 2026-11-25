def ci
pipeline {
  agent { label 'despesas-docker' }
  options {
    timestamps()
    disableConcurrentBuilds()
    buildDiscarder(logRotator(numToKeepStr: '20'))
    timeout(time: 10, unit: 'MINUTES')
  }
  parameters { string(name: 'SOURCE_COMMIT', defaultValue: '', description: 'SHA completo recebido do pipeline coordenador') }
  stages {
    stage('Preparar') {
      steps {
        script {
          ci = load 'ci/common.groovy'
          ci.prepare()
        }
        sh 'rm -rf reports && mkdir -p reports'
      }
    }
    stage('smoke-test') {
      steps {
        sh '''#!/bin/sh
set -u
PUBLIC_FRONT="${PUBLIC_FRONTEND_URL:-https://sistema-de-gestao-despesas.vercel.app}"
FRONT="http://127.0.0.1:${FRONTEND_PORT:-3000}"
API="http://127.0.0.1:${BACKEND_PORT:-8000}"
REPORT=reports/smoke-test.txt
FALHAS=0

req() {
  docker run --rm --network host curlimages/curl:8.11.1 -sS --location --max-time 20 "$@"
}

checar() {
  if [ "$2" = "$3" ]; then
    echo "OK     $1" | tee -a "$REPORT"
  else
    echo "FALHA  $1 (esperado: $3, recebido: $2)" | tee -a "$REPORT"
    FALHAS=$((FALHAS + 1))
  fi
}

echo "Smoke test do commit $IMAGE_TAG" | tee "$REPORT"
date -u '+Data UTC: %Y-%m-%dT%H:%M:%SZ' | tee -a "$REPORT"
echo "Frontend publico: $PUBLIC_FRONT" | tee -a "$REPORT"
echo "Frontend Docker: $FRONT; API: $API" | tee -a "$REPORT"

STATUS=$(req -o /dev/null -w '%{http_code}' "$PUBLIC_FRONT/")
checar "GET / (Vercel publico)" "$STATUS" "200"

STATUS=$(req -o /dev/null -w '%{http_code}' "$FRONT/")
checar "GET / (frontend)" "$STATUS" "200"

if req --fail "$API/health" | grep -Eq '"status"[[:space:]]*:[[:space:]]*"ok"'; then
  checar "GET /health" "ok" "ok"
else
  checar "GET /health" "sem status ok" "ok"
fi

STATUS=$(req -o /dev/null -w '%{http_code}' "$API/despesas")
checar "GET /despesas" "$STATUS" "200"

STATUS=$(req -o /dev/null -w '%{http_code}' -X POST "$API/despesas" \
  -H 'Content-Type: application/json' \
  -d '{"descricao":"","valor":-10,"categoria":"outros","data":"2026-01-01"}')
checar "POST /despesas invalido e recusado" "$STATUS" "422"

echo "Falhas: $FALHAS" | tee -a "$REPORT"
[ "$FALHAS" -eq 0 ]
'''
      }
      post {
        always {
          archiveArtifacts artifacts: 'reports/smoke-test.txt', allowEmptyArchive: true
        }
      }
    }
  }
}
