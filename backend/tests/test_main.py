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


def test_health_retorna_ok(client: TestClient) -> None:
    # O healthcheck do Docker Compose e o smoke test do Jenkins dependem
    # deste endpoint.
    resposta = client.get("/health")

    assert resposta.status_code == 200
    assert resposta.json() == {"status": "ok"}


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


def test_atualizar_despesa_persiste_todos_os_campos(client: TestClient) -> None:
    payload = {
        "descricao": "Almoço",
        "valor": 35.5,
        "categoria": "Alimentação",
        "data": "2026-09-10",
    }
    criada = client.post("/despesas", json=payload).json()
    atualizada = {
        "descricao": "Cinema",
        "valor": 50,
        "categoria": "Lazer",
        "data": "2026-09-11",
    }

    resposta = client.put(f"/despesas/{criada['id']}", json=atualizada)

    assert resposta.status_code == 200
    assert resposta.json() == {**criada, **atualizada}
    assert client.get("/despesas").json() == [resposta.json()]


def test_excluir_despesa_remove_do_banco(client: TestClient) -> None:
    criada = client.post(
        "/despesas",
        json={
            "descricao": "Almoço",
            "valor": 35.5,
            "categoria": "Alimentação",
            "data": "2026-09-10",
        },
    ).json()

    resposta = client.delete(f"/despesas/{criada['id']}")

    assert resposta.status_code == 204
    assert resposta.content == b""
    assert client.get("/despesas").json() == []


@pytest.mark.parametrize("metodo", ["put", "delete"])
def test_despesa_inexistente_preserva_resposta_404(
    client: TestClient, metodo: str
) -> None:
    payload = {
        "descricao": "   ",
        "valor": 35.5,
        "categoria": "Alimentação",
        "data": "2026-09-10",
    }
    # No PUT, a busca deve ocorrer antes da validação de negócio da descrição.
    kwargs = {"json": payload} if metodo == "put" else {}

    resposta = client.request(metodo, "/despesas/999", **kwargs)

    assert resposta.status_code == 404
    assert resposta.json() == {"detail": "Despesa 999 não encontrada."}
    assert client.get("/despesas").json() == []


@pytest.mark.parametrize("metodo", ["post", "put"])
def test_descricao_em_branco_preserva_erro_e_nao_persiste(
    client: TestClient, metodo: str
) -> None:
    payload = {
        "descricao": "Almoço",
        "valor": 35.5,
        "categoria": "Alimentação",
        "data": "2026-09-10",
    }
    criada = client.post("/despesas", json=payload).json()
    rota = "/despesas" if metodo == "post" else f"/despesas/{criada['id']}"

    resposta = client.request(metodo, rota, json={**payload, "descricao": "   "})

    assert resposta.status_code == 422
    assert resposta.json() == {
        "detail": [{"campo": "descricao", "mensagem": "A descrição não pode ser vazia."}]
    }
    assert client.get("/despesas").json() == [criada]
