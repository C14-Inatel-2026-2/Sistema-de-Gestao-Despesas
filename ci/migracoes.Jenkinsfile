// Responsável: André Dias Balbino
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
        sh 'rm -rf backend/reports && mkdir -p backend/reports'
      }
    }
    stage('migracoes') {
      steps {
        script {
          // Usa um banco SQLite em arquivo (o padrão do ci.python é :memory:, que
          // some a cada comando do Alembic e impediria encadear as etapas).
          ci.python('''
set +e
export DATABASE_URL=sqlite:////tmp/migracoes.db
rm -f /tmp/migracoes.db
pip install --no-cache-dir -r requirements.txt > /dev/null
{
  echo "== 1/4 alembic upgrade head (banco limpo) ==" && alembic upgrade head &&
  echo "== 2/4 alembic check (models x migracoes) ==" && alembic check &&
  echo "== 3/4 alembic downgrade base (reversibilidade) ==" && alembic downgrade base &&
  echo "== 4/4 alembic upgrade head (reaplicar) ==" && alembic upgrade head &&
  echo "Migracoes OK"
} > reports/migracoes.txt 2>&1
status=$?
cat reports/migracoes.txt
exit "$status"
''')
        }
      }
      post {
        always {
          archiveArtifacts artifacts: 'backend/reports/migracoes.txt', allowEmptyArchive: true
        }
      }
    }
  }
}
