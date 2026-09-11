"""Configuração de conexão com o banco de dados.

Usa SQLite localmente por padrão (arquivo despesas.db na pasta onde a API
roda), mas lê a variável de ambiente DATABASE_URL para apontar para o
PostgreSQL em produção/staging, sem precisar mudar nenhum código.

Exemplo de DATABASE_URL para Postgres:
    postgresql+psycopg2://usuario:senha@localhost:5432/despesas
"""

import os
from collections.abc import Generator

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

# Lê o arquivo .env (se existir) e coloca as variáveis no ambiente do
# processo.
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./despesas.db")

# connect_args com check_same_thread só é necessário para SQLite: por padrão
# ele bloqueia uso da mesma conexão em threads diferentes, o que quebra com
# o jeito que o FastAPI lida com requisições.
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """Classe base de onde todos os models (tabelas) herdam."""


def get_db() -> Generator[Session, None, None]:
    """Dependency do FastAPI: abre uma sessão por requisição e garante o fechamento."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()