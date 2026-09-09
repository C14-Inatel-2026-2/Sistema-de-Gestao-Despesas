"""Ponto de entrada da API.

Por enquanto só expõe um health check. As rotas de despesas (/despesas,
/categorias) descritas no README entram nas próximas entregas.
"""

from fastapi import FastAPI

app = FastAPI(title="Sistema de Gestão de Despesas - API")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
