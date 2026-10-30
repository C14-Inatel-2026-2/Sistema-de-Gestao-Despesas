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
        sh 'rm -rf reports && mkdir -p reports'
      }
    }
    stage('Configuração Vercel') {
      steps {
        script {
          if (!env.VERCEL_PROJECT_ID?.trim()) {
            error('Configure VERCEL_PROJECT_ID e a credencial vercel-token antes do deploy.')
          }
        }
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
{
  echo "Commit: $IMAGE_TAG"
  date -u '+Data UTC: %Y-%m-%dT%H:%M:%SZ'
  docker compose -p despesas ps
} | tee reports/deploy.txt
'''
      }
      post {
        always {
          archiveArtifacts artifacts: 'reports/deploy.txt', allowEmptyArchive: true
        }
        failure {
          sh 'docker compose -p despesas ps; docker compose -p despesas logs --tail=100'
        }
      }
    }
    stage('Publicar Vercel') {
      steps {
        withCredentials([string(credentialsId: 'vercel-token', variable: 'VERCEL_TOKEN')]) {
          sh '''#!/bin/sh
set -eu
set +x
git fetch origin main
[ "$(git rev-parse origin/main)" = "$SOURCE_COMMIT" ]
docker run --rm --user "$(id -u):$(id -g)" \
  -e VERCEL_TOKEN -e VERCEL_PROJECT_ID -e VERCEL_TEAM_ID -e SOURCE_COMMIT \
  -v "$PWD:/app" -w /app python:3.12-slim python ci/deploy_vercel.py
'''
        }
      }
      post {
        always {
          archiveArtifacts artifacts: 'reports/vercel-deploy.json', allowEmptyArchive: true
        }
      }
    }
  }
}
