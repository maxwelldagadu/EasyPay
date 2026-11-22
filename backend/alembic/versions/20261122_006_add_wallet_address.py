"""add public wallet address to testnet balances

Revision ID: 20261122_006
Revises: 20261122_005
Create Date: 2026-11-22
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "20261122_006"
down_revision: Union[str, None] = "20261122_005"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Store only the public Ethereum address used for USDC reads.
    op.add_column(
        "testnet_balances",
        sa.Column("wallet_address", sa.String(length=42), nullable=True),
    )


def downgrade() -> None:
    # Remove public wallet metadata while preserving balance records.
    op.drop_column("testnet_balances", "wallet_address")
