"""Testes unitários com mock: isolam o código da sessão real do banco."""

from datetime import date
from unittest.mock import MagicMock, patch

import pytest
from fastapi import HTTPException

import models
import schemas
from database import get_db
from main import atualizar_despesa, criar_despesa


@patch("database.SessionLocal")
def test_get_db_entrega_a_sessao_e_fecha_no_final(mock_session_local):
    sessao = mock_session_local.return_value

    gerador = get_db()
    db = next(gerador)

    assert db is sessao
    sessao.close.assert_not_called()

    with pytest.raises(StopIteration):
        next(gerador)
    sessao.close.assert_called_once()


@patch("database.SessionLocal")
def test_get_db_fecha_a_sessao_mesmo_quando_a_requisicao_falha(mock_session_local):
    sessao = mock_session_local.return_value

    gerador = get_db()
    next(gerador)
    with pytest.raises(RuntimeError):
        gerador.throw(RuntimeError("erro na requisição"))

    sessao.close.assert_called_once()


def test_criar_despesa_grava_e_devolve_a_despesa():
    db = MagicMock()
    payload = schemas.DespesaCreate(
        descricao="Almoço",
        valor=35.5,
        categoria="Alimentação",
        data=date(2026, 9, 10),
    )

    resultado = criar_despesa(despesa=payload, db=db)

    db.add.assert_called_once()
    despesa_gravada = db.add.call_args.args[0]
    assert isinstance(despesa_gravada, models.Despesa)
    assert despesa_gravada.descricao == "Almoço"
    assert despesa_gravada.valor == 35.5
    db.commit.assert_called_once()
    db.refresh.assert_called_once_with(despesa_gravada)
    assert resultado is despesa_gravada


def _payload_atualizacao(**sobrescritas) -> schemas.DespesaUpdate:
    dados = {
        "descricao": "Cinema",
        "valor": 50.0,
        "categoria": "Lazer",
        "data": date(2026, 9, 11),
    }
    return schemas.DespesaUpdate(**{**dados, **sobrescritas})


def test_atualizar_despesa_substitui_os_campos_e_grava():
    existente = models.Despesa(
        id=1,
        descricao="Almoço",
        valor=35.5,
        categoria="Alimentação",
        data=date(2026, 9, 10),
    )
    db = MagicMock()
    db.get.return_value = existente

    resultado = atualizar_despesa(despesa_id=1, despesa=_payload_atualizacao(), db=db)

    db.get.assert_called_once_with(models.Despesa, 1)
    assert resultado is existente
    assert existente.id == 1
    assert existente.descricao == "Cinema"
    assert existente.valor == 50.0
    assert existente.categoria == "Lazer"
    assert existente.data == date(2026, 9, 11)
    db.commit.assert_called_once()
    db.refresh.assert_called_once_with(existente)


def test_atualizar_despesa_inexistente_retorna_404_sem_gravar():
    db = MagicMock()
    db.get.return_value = None

    with pytest.raises(HTTPException) as exc_info:
        atualizar_despesa(despesa_id=999, despesa=_payload_atualizacao(), db=db)

    assert exc_info.value.status_code == 404
    assert exc_info.value.detail == "Despesa 999 não encontrada."
    db.commit.assert_not_called()


def test_atualizar_despesa_com_descricao_em_branco_retorna_422_sem_gravar():
    existente = models.Despesa(
        id=1,
        descricao="Almoço",
        valor=35.5,
        categoria="Alimentação",
        data=date(2026, 9, 10),
    )
    db = MagicMock()
    db.get.return_value = existente

    with pytest.raises(HTTPException) as exc_info:
        atualizar_despesa(
            despesa_id=1, despesa=_payload_atualizacao(descricao="   "), db=db
        )

    assert exc_info.value.status_code == 422
    assert existente.descricao == "Almoço"
    db.commit.assert_not_called()
