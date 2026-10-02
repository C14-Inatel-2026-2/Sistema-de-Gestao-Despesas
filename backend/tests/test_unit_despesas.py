"""Testes unitários de despesas

Framework: pytest (escolha do grupo para o backend).
"""

from datetime import date
from unittest.mock import MagicMock, patch

import pytest
from fastapi import HTTPException
from pydantic import ValidationError

import schemas
import models
from expenses import ErroValidacao
from main import criar_despesa, listar_despesas, excluir_despesa

# ---------------------------------------------------------------------------
# testa a models
# ---------------------------------------------------------------------------

def test_despesa_model_armazena_os_atributos_corretamente():
    """Testa a classe Despesa (model): os atributos ficam acessíveis após a criação."""
    despesa = models.Despesa(
        descricao="Almoço",
        valor=35.5,
        categoria="Alimentação",
        data=date(2026, 9, 10),
    )
 
    assert despesa.descricao == "Almoço"
    assert despesa.valor == 35.5
    assert despesa.categoria == "Alimentação"
    assert despesa.data == date(2026, 9, 10)

# ---------------------------------------------------------------------------
# testa a classe/schema DespesaCreate
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
# testa a classe/schema DespesaUpdate
# ---------------------------------------------------------------------------

def test_despesa_update_aceita_payload_valido():
    """DespesaUpdate aceita dados válidos."""
    despesa = schemas.DespesaUpdate(
        descricao="Cinema com pipoca",
        valor=55,
        categoria="Lazer",
        data=date(2026, 9, 5),
    )
 
    assert despesa.descricao == "Cinema com pipoca"
    assert despesa.valor == 55
    assert despesa.categoria == "Lazer"


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


def test_criar_despesa_grava_no_banco_via_sessao_mockada():
    """Testa criar_despesa() conferindo as chamadas feitas na Session mockada."""
    db_mock = MagicMock()
    dados = schemas.DespesaCreate(
        descricao="Uber", valor=20, categoria="Transporte", data=date(2026, 9, 1)
    )
 
    criar_despesa(dados, db=db_mock)
 
    db_mock.add.assert_called_once()
    despesa_adicionada = db_mock.add.call_args[0][0]
    assert isinstance(despesa_adicionada, models.Despesa)
    assert despesa_adicionada.descricao == "Uber"
    db_mock.commit.assert_called_once()
    db_mock.refresh.assert_called_once_with(despesa_adicionada)
 
 
def test_excluir_despesa_inexistente_nao_chama_delete():
    """Teste NEGATIVO: se a despesa não existe, levanta 404 e não toca no banco."""
    db_mock = MagicMock()
    db_mock.get.return_value = None
 
    with pytest.raises(HTTPException) as exc_info:
        excluir_despesa(despesa_id=999, db=db_mock)
 
    assert exc_info.value.status_code == 404
    db_mock.delete.assert_not_called()
    db_mock.commit.assert_not_called()