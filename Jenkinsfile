pipeline {
  agent any

  options {
    timestamps()
    skipDefaultCheckout(false)
  }

  stages {
    stage('Frontend — lint, types e testes') {
      steps {
        sh '''
          set -eu
          docker run --rm \
            -v "$PWD/frontend:/app" \
            -w /app \
            node:22-alpine \
            sh -c "corepack enable && pnpm install --frozen-lockfile && pnpm lint && pnpm type-check && pnpm test"
        '''
      }
    }

    stage('Backend — lint e testes') {
      when {
        expression { fileExists('backend/requirements.txt') }
      }
      steps {
        sh '''
          set -eu
          docker run --rm \
            -v "$PWD/backend:/app" \
            -w /app \
            python:3.12-slim \
            sh -c "pip install --no-cache-dir -r requirements.txt ruff && ruff check . && pytest"
        '''
      }
    }

    stage('Docker — build da imagem') {
      steps {
        sh '''
          set -eu
          docker compose build
        '''
      }
    }
  }
}
