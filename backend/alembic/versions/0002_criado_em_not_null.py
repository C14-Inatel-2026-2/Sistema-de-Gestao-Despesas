"""marca criado_em como não nulo

Revision ID: 0002
Revises: 0001
Create Date: 2026-10-29

"""

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision = "0002"
down_revision = "0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Bancos criados com a 0001 original ainda aceitam NULL em criado_em.
    # batch_alter_table é necessário porque o SQLite não altera colunas in-place.
    with op.batch_alter_table("despesas") as batch_op:
        batch_op.alter_column(
            "criado_em",
            existing_type=sa.DateTime(timezone=True),
            existing_server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        )


def downgrade() -> None:
    with op.batch_alter_table("despesas") as batch_op:
        batch_op.alter_column(
            "criado_em",
            existing_type=sa.DateTime(timezone=True),
            existing_server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=True,
        )
