def prepare() {
    if (!(params.SOURCE_COMMIT ==~ /[0-9a-f]{40}/)) {
        error('SOURCE_COMMIT deve ser o SHA completo do commit a validar.')
    }
    withEnv(["SOURCE_COMMIT=${params.SOURCE_COMMIT}"]) {
        sh 'git checkout --detach "$SOURCE_COMMIT"'
    }
    env.IMAGE_TAG = params.SOURCE_COMMIT
}

def node(String command) {
    withEnv(["CI_COMMAND=${command}"]) {
        sh '''#!/bin/sh
set -eu
docker run --rm --user "$(id -u):$(id -g)" \
  -e HOME=/tmp -e COREPACK_HOME=/tmp/corepack \
  -e COREPACK_ENABLE_DOWNLOAD_PROMPT=0 -e CI=true -e CI_COMMAND \
  -v "$PWD/frontend:/app" -w /app node:22-alpine \
  sh -ec 'corepack pnpm install --frozen-lockfile && eval "$CI_COMMAND"'
'''
    }
}

def python(String command) {
    withEnv(["CI_COMMAND=${command}"]) {
        sh '''#!/bin/sh
set -eu
docker run --rm --user "$(id -u):$(id -g)" \
  -e HOME=/tmp -e DATABASE_URL=sqlite:///:memory: -e CI_COMMAND \
  -v "$PWD/backend:/app" -w /app python:3.12-slim \
  sh -ec 'python -m venv /tmp/venv && . /tmp/venv/bin/activate && pip install --no-cache-dir -r requirements-ci.txt && eval "$CI_COMMAND"'
'''
    }
}

return this
