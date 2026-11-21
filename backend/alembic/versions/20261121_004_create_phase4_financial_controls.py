"""create phase 4 balances and payment approvals

Revision ID: 20261121_004
Revises: 20261121_003
Create Date: 2026-11-21
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "20261121_004"
down_revision: Union[str, None] = "20261121_003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Phase 4 records testnet USDC balances and owner-scoped transaction approvals without on-chain execution.
    op.create_table(
        "testnet_balances",
        sa.Column("user_id", sa.String(length=255), nullable=False),
        sa.Column("balance_usdc", sa.Numeric(precision=20, scale=6), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint("balance_usdc >= 0", name=op.f("ck_testnet_balances_testnet_balance_non_negative")),
        sa.PrimaryKeyConstraint("user_id", name=op.f("pk_testnet_balances")),
    )
    op.create_table(
        "payment_approvals",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("user_id", sa.String(length=255), nullable=False),
        sa.Column("agent_id", sa.String(length=36), nullable=False),
        sa.Column("original_instruction", sa.Text(), nullable=False),
        sa.Column("recipient_address", sa.String(length=42), nullable=False),
        sa.Column("amount_usdc", sa.Numeric(precision=20, scale=6), nullable=False),
        sa.Column("asset", sa.String(length=10), nullable=False),
        sa.Column("network", sa.String(length=50), nullable=False),
        sa.Column("status", sa.String(length=16), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("approved_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("rejected_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("pin_failed_attempts", sa.Integer(), nullable=False),
        sa.Column("pin_locked_until", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint("amount_usdc > 0", name=op.f("ck_payment_approvals_approval_amount_positive")),
        sa.CheckConstraint(
            "status IN ('pending', 'approved', 'rejected', 'expired')",
            name=op.f("ck_payment_approvals_approval_status_valid"),
        ),
        sa.ForeignKeyConstraint(
            ["agent_id"],
            ["agents.id"],
            name=op.f("fk_payment_approvals_agent_id_agents"),
            ondelete="RESTRICT",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_payment_approvals")),
    )
    op.create_index("ix_payment_approvals_owner_status", "payment_approvals", ["user_id", "status"], unique=False)
    op.create_index("ix_payment_approvals_agent_created", "payment_approvals", ["agent_id", "created_at"], unique=False)


def downgrade() -> None:
    # Roll back only Phase 4 approval and balance records.
    op.drop_index("ix_payment_approvals_agent_created", table_name="payment_approvals")
    op.drop_index("ix_payment_approvals_owner_status", table_name="payment_approvals")
    op.drop_table("payment_approvals")
    op.drop_table("testnet_balances")
