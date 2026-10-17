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
    stage('lint-docker') {
      steps {
        sh '''#!/bin/sh
set -u
status=0
: > reports/lint-docker.txt
for f in frontend/Dockerfile backend/Dockerfile; do
  echo "== hadolint $f" >> reports/lint-docker.txt
  docker run --rm -i hadolint/hadolint:v2.12.0 < "$f" >> reports/lint-docker.txt 2>&1 || status=1
done
echo "== docker compose config" >> reports/lint-docker.txt
docker compose config --quiet >> reports/lint-docker.txt 2>&1 || status=1
cat reports/lint-docker.txt
exit $status
'''
      }
      post {
        always {
          archiveArtifacts artifacts: 'reports/lint-docker.txt', allowEmptyArchive: true
        }
      }
    }
  }
}
