"""Testes unitários dos schemas Pydantic (sem mock)."""

from datetime import date, datetime, timezone
from types import SimpleNamespace

import pytest
from pydantic import ValidationError

import schemas


def test_despesa_update_aceita_payload_valido():
    despesa = schemas.DespesaUpdate(
        descricao="Mercado",
        valor=120.9,
        categoria="Alimentação",
        data=date(2026, 9, 15),
    )

    assert despesa.descricao == "Mercado"
    assert despesa.valor == 120.9
    assert despesa.data == date(2026, 9, 15)


def test_despesa_out_le_os_dados_de_um_objeto_do_banco():
    registro = SimpleNamespace(
        id=7,
        descricao="Uber",
        valor=20.0,
        categoria="Transporte",
        data=date(2026, 9, 1),
        criado_em=datetime(2026, 9, 1, 12, 0, 0, tzinfo=timezone.utc),
    )

    despesa = schemas.DespesaOut.model_validate(registro)

    assert despesa.id == 7
    assert despesa.categoria == "Transporte"
    assert despesa.criado_em == datetime(2026, 9, 1, 12, 0, 0, tzinfo=timezone.utc)


def test_despesa_create_rejeita_categoria_vazia():
    with pytest.raises(ValidationError) as exc_info:
        schemas.DespesaCreate(
            descricao="Almoço",
            valor=35.5,
            categoria="",
            data=date(2026, 9, 10),
        )

    campos = [erro["loc"][0] for erro in exc_info.value.errors()]
    assert campos == ["categoria"]
