"""create despesas table

Revision ID: 0001
Revises:
Create Date: 2026-09-10

"""

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "despesas",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("descricao", sa.String(length=255), nullable=False),
        sa.Column("valor", sa.Float(), nullable=False),
        sa.Column("categoria", sa.String(length=100), nullable=False, index=True),
        sa.Column("data", sa.Date(), nullable=False),
        sa.Column(
            "criado_em",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
    )
    op.create_index("ix_despesas_categoria", "despesas", ["categoria"])


def downgrade() -> None:
    op.drop_index("ix_despesas_categoria", table_name="despesas")
    op.drop_table("despesas")
