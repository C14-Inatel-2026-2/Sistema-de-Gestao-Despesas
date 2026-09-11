"""Schemas Pydantic: formato dos dados que entram e saem da API.

Ficam separados dos models do SQLAlchemy de propósito — o schema é o
contrato com o cliente (frontend), o model é a tabela do banco. Nem
sempre os dois têm exatamente os mesmos campos.
"""

from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field


class DespesaBase(BaseModel):
    descricao: str = Field(..., min_length=1, max_length=255)
    valor: float = Field(..., gt=0)
    categoria: str = Field(..., min_length=1, max_length=100)
    data: date


class DespesaCreate(DespesaBase):
    """Dados recebidos no POST /despesas."""


class DespesaUpdate(DespesaBase):
    """Dados recebidos no PUT /despesas/{id}."""


class DespesaOut(DespesaBase):
    """Dados retornados pela API."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    criado_em: datetime
