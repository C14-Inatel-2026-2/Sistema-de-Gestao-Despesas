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
    stage('deploy') {
      steps {
        sh '''#!/bin/sh
set -eu
# Rejeita commits que não sejam a ponta atual da main.
git fetch origin main
[ "$(git rev-parse origin/main)" = "$IMAGE_TAG" ]
docker compose -p despesas up -d --no-build --wait --wait-timeout 180
docker compose -p despesas ps
'''
      }
      post {
        failure {
          sh 'docker compose -p despesas ps; docker compose -p despesas logs --tail=100'
        }
      }
    }
  }
}
