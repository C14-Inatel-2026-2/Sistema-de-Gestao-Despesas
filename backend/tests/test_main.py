"""Testes de integração dos endpoints de despesas.

Usa o TestClient do FastAPI (que usa httpx por baixo, sem precisar subir
um servidor de verdade) contra um banco SQLite em memória isolado, criado
do zero em cada teste — não toca no despesas.db usado em desenvolvimento.
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from database import Base, get_db
from main import app


@pytest.fixture()
def client():
    # StaticPool força o SQLAlchemy a reutilizar a MESMA conexão em vez de
    # abrir uma nova por thread. Sem isso, o FastAPI roda os endpoints numa
    # thread separada (run_in_threadpool).
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    app.dependency_overrides.clear()


def test_criar_despesa_valida(client: TestClient) -> None:
    resposta = client.post(
        "/despesas",
        json={
            "descricao": "Almoço",
            "valor": 35.5,
            "categoria": "Alimentação",
            "data": "2026-09-10",
        },
    )

    assert resposta.status_code == 201
    corpo = resposta.json()
    assert corpo["descricao"] == "Almoço"
    assert corpo["id"] is not None


def test_criar_despesa_com_valor_invalido_retorna_erro(client: TestClient) -> None:
    resposta = client.post(
        "/despesas",
        json={
            "descricao": "Almoço",
            "valor": -10,
            "categoria": "Alimentação",
            "data": "2026-09-10",
        },
    )

    assert resposta.status_code == 422


def test_listar_despesas_retorna_as_cadastradas(client: TestClient) -> None:
    client.post(
        "/despesas",
        json={
            "descricao": "Uber",
            "valor": 20,
            "categoria": "Transporte",
            "data": "2026-09-01",
        },
    )

    resposta = client.get("/despesas")

    assert resposta.status_code == 200
    despesas = resposta.json()
    assert len(despesas) == 1
    assert despesas[0]["descricao"] == "Uber"
