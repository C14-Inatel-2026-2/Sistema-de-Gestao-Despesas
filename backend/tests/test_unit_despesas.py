"""Testes unitários de despesas — Entrega 3 (Paulo).

Framework: pytest (escolha do grupo para o backend).

Critérios:
- 2 testes COM mock
- 2 testes SEM mock
- 1 caso negativo
"""

from datetime import date
from unittest.mock import MagicMock, patch

import pytest
from fastapi import HTTPException
from pydantic import ValidationError

import schemas
from expenses import ErroValidacao
from main import criar_despesa, listar_despesas


# ---------------------------------------------------------------------------
# SEM mock — testa a classe/schema DespesaCreate
# ---------------------------------------------------------------------------


def test_despesa_create_aceita_payload_valido():
    """Sem mock: DespesaCreate aceita dados válidos."""
    despesa = schemas.DespesaCreate(
        descricao="Almoço",
        valor=35.5,
        categoria="Alimentação",
        data=date(2026, 9, 10),
    )

    assert despesa.descricao == "Almoço"
    assert despesa.valor == 35.5
    assert despesa.categoria == "Alimentação"
    assert despesa.data == date(2026, 9, 10)


def test_despesa_create_rejeita_valor_negativo():
    """Sem mock + caso negativo: valor <= 0 é rejeitado pelo schema."""
    with pytest.raises(ValidationError) as exc_info:
        schemas.DespesaCreate(
            descricao="Almoço",
            valor=-10,
            categoria="Alimentação",
            data=date(2026, 9, 10),
        )

    erros = exc_info.value.errors()
    assert any(erro["loc"] == ("valor",) for erro in erros)


# ---------------------------------------------------------------------------
# COM mock — isola os métodos dos endpoints da Session real
# ---------------------------------------------------------------------------


def test_listar_despesas_retorna_resultado_da_sessao_mockada():
    """Com mock: listar_despesas devolve o que a Session mockada retornar."""
    db = MagicMock()
    despesa_fake = MagicMock(name="Despesa")
    db.execute.return_value.scalars.return_value.all.return_value = [despesa_fake]

    resultado = listar_despesas(db=db)

    assert resultado == [despesa_fake]
    db.execute.assert_called_once()


@patch("main.validar_despesa")
def test_criar_despesa_levanta_422_quando_validacao_falha(mock_validar):
    """Com mock + caso negativo: falha de validação vira HTTP 422 e não persiste."""
    mock_validar.return_value = [
        ErroValidacao("valor", "O valor da despesa deve ser maior que zero."),
    ]
    db = MagicMock()
    payload = schemas.DespesaCreate(
        descricao="Almoço",
        valor=35.5,
        categoria="Alimentação",
        data=date(2026, 9, 10),
    )

    with pytest.raises(HTTPException) as exc_info:
        criar_despesa(despesa=payload, db=db)

    assert exc_info.value.status_code == 422
    db.add.assert_not_called()
    db.commit.assert_not_called()
    mock_validar.assert_called_once_with(payload.valor, payload.descricao)
