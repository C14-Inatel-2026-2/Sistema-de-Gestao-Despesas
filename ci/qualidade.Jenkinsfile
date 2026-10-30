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
    stage('Testes da automação de deploy') {
      steps {
        sh '''#!/bin/sh
set -eu
docker run --rm -v "$PWD/ci:/ci:ro" -w /ci python:3.12-slim \
  python -m unittest discover -s tests -v
'''
      }
    }
    stage('qualidade') {
      steps {
        script {
          ci.node('corepack pnpm lint && corepack pnpm type-check')
          ci.python('ruff check src tests')
        }
      }

    }
  }
}
