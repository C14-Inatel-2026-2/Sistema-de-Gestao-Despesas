pipeline {
  agent none
  options {
    timestamps()
    disableConcurrentBuilds()
    skipStagesAfterUnstable()
    buildDiscarder(logRotator(numToKeepStr: '20'))
    timeout(time: 45, unit: 'MINUTES')
  }
  stages {
    stage('Checkout') {
      agent { label 'despesas-docker' }
      steps {
        script {
          env.SOURCE_COMMIT = sh(script: 'git rev-parse HEAD', returnStdout: true).trim()
        }
      }
    }
    stage('Qualidade') {
      steps {
        build job: '/despesas/qualidade', parameters: [string(name: 'SOURCE_COMMIT', value: env.SOURCE_COMMIT)]
      }
    }
    stage('Testes') {
      parallel {
        stage('Frontend') {
          steps {
            build job: '/despesas/testes-frontend', parameters: [string(name: 'SOURCE_COMMIT', value: env.SOURCE_COMMIT)]
          }
        }
        stage('Backend') {
          steps {
            build job: '/despesas/testes-backend', parameters: [string(name: 'SOURCE_COMMIT', value: env.SOURCE_COMMIT)]
          }
        }
        stage('Migrações') {
          steps {
            build job: '/despesas/migracoes', parameters: [string(name: 'SOURCE_COMMIT', value: env.SOURCE_COMMIT)]
          }
        }
      }
    }
    stage('Cobertura mínima') {
      steps {
        build job: '/despesas/cobertura-minima', parameters: [string(name: 'SOURCE_COMMIT', value: env.SOURCE_COMMIT)]
      }
    }
    stage('Auditoria') {
      steps {
        build job: '/despesas/auditoria', parameters: [string(name: 'SOURCE_COMMIT', value: env.SOURCE_COMMIT)]
      }
    }
    stage('Build') {
      steps {
        build job: '/despesas/build', parameters: [string(name: 'SOURCE_COMMIT', value: env.SOURCE_COMMIT)]
      }
    }
    stage('Deploy') {
      when { allOf { branch 'main'; not { changeRequest() } } }
      steps {
        build job: '/despesas/deploy', parameters: [string(name: 'SOURCE_COMMIT', value: env.SOURCE_COMMIT)]
      }
    }
    stage('Smoke test') {
      when { allOf { branch 'main'; not { changeRequest() } } }
      steps {
        build job: '/despesas/smoke-test', parameters: [string(name: 'SOURCE_COMMIT', value: env.SOURCE_COMMIT)]
      }
    }
  }
}