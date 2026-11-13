import sys
from logging.config import fileConfig
from pathlib import Path

from alembic import context
from sqlalchemy import engine_from_config, pool

# Permite importar os módulos de backend/src (database.py, models.py)
sys.path.append(str(Path(__file__).resolve().parents[1] / "src"))

from database import DATABASE_URL, Base  # noqa: E402
import models  # noqa: E402,F401  (import necessário p/ registrar as tabelas em Base.metadata)

config = context.config

# Reutiliza a mesma URL da aplicação (database.py): DATABASE_URL do ambiente
# se definida (ex: Postgres em produção), senão o SQLite local. Assim a API e
# as migrações nunca apontam para bancos diferentes.
config.set_main_option("sqlalchemy.url", DATABASE_URL)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Gera o SQL das migrações sem se conectar ao banco (`alembic upgrade head --sql`)."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Conecta no banco de verdade e aplica as migrações (uso normal)."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
