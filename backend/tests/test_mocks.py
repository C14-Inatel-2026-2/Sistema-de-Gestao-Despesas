"""Testes unitários com mock: isolam o código da sessão real do banco."""

from datetime import date
from unittest.mock import MagicMock, patch

import pytest

import models
import schemas
from database import get_db
from main import criar_despesa


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
