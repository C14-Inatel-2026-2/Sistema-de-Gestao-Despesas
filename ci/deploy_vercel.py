"""Publica exclusivamente o SHA aprovado pelo coordenador e aguarda produção."""
import json
import os
import re
import time
from datetime import datetime, timezone
from pathlib import Path
from urllib.error import HTTPError
from urllib.parse import urlencode
from urllib.request import Request, urlopen


def request(path, payload=None):
    query = urlencode({'teamId': os.environ['VERCEL_TEAM_ID']}) if os.getenv('VERCEL_TEAM_ID') else ''
    req = Request(
        f'https://api.vercel.com{path}?{query}',
        data=json.dumps(payload).encode() if payload is not None else None,
        headers={'Authorization': f'Bearer {os.environ["VERCEL_TOKEN"]}',
                 'Content-Type': 'application/json'},
    )
    try:
        with urlopen(req, timeout=30) as response:
            return json.load(response)
    except HTTPError as exc:
        # Não imprimir corpo ou headers: podem conter dados da conta.
        raise RuntimeError(f'API Vercel respondeu HTTP {exc.code}') from None


def deploy():
    sha = os.environ['SOURCE_COMMIT']
    if not re.fullmatch('[0-9a-f]{40}', sha):
        raise ValueError('SOURCE_COMMIT deve conter o SHA completo')
    project = request('/v9/projects/' + os.environ['VERCEL_PROJECT_ID'])
    link = project.get('link', {})
    if link.get('type') != 'github' or not link.get('repoId'):
        raise ValueError('O projeto Vercel deve estar vinculado ao repositório GitHub')
    deployment = request('/v13/deployments', {
        'name': project['name'], 'project': project['id'], 'target': 'production',
        'gitSource': {'type': 'github', 'repoId': str(link['repoId']),
                      'ref': sha, 'sha': sha},
    })
    deadline = time.monotonic() + 900
    while True:
        deployment = request('/v13/deployments/' + deployment['id'])
        state = deployment.get('readyState')
        if state in {'ERROR', 'CANCELED'}:
            raise RuntimeError(f'Deploy Vercel terminou em {state}')
        if state == 'READY' and deployment.get('aliasAssigned'):
            actual_sha = deployment.get('gitSource', {}).get('sha')
            if actual_sha != sha:
                raise RuntimeError('SHA publicado difere do SHA aprovado')
            report = Path('reports/vercel-deploy.json')
            report.parent.mkdir(parents=True, exist_ok=True)
            report.write_text(json.dumps({
                'commit': sha, 'deployment': deployment['id'],
                'url': 'https://' + deployment['url'], 'state': state,
                'date': datetime.now(timezone.utc).isoformat(),
            }, indent=2) + '\n')
            print(f'Vercel: {state}; commit: {sha}')
            return
        if time.monotonic() >= deadline:
            raise TimeoutError('Vercel não concluiu deploy/alias em 15 minutos')
        time.sleep(10)


if __name__ == '__main__':
    deploy()
