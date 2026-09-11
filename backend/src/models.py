"""Modelos SQLAlchemy: representam as tabelas do banco."""

from datetime import date, datetime

from sqlalchemy import Date, DateTime, Float, String, func
from sqlalchemy.orm import Mapped, mapped_column

from database import Base


class Despesa(Base):
    __tablename__ = "despesas"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    descricao: Mapped[str] = mapped_column(String(255), nullable=False)
    valor: Mapped[float] = mapped_column(Float, nullable=False)
    categoria: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    data: Mapped[date] = mapped_column(Date, nullable=False)
    criado_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
