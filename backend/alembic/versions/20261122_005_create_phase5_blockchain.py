"""create phase 5 transactions and audit logs

Revision ID: 20261122_005
Revises: 20261121_004
Create Date: 2026-11-22
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "20261122_005"
down_revision: Union[str, None] = "20261121_004"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Phase 5 records on-chain payment execution with idempotency and tamper-evident audit logs.
    op.create_table(
        "transactions",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("user_id", sa.String(length=255), nullable=False),
        sa.Column("agent_id", sa.String(length=36), nullable=False),
        sa.Column("approval_id", sa.String(length=36), nullable=False),
        sa.Column("idempotency_key", sa.String(length=128), nullable=False),
        sa.Column("recipient_address", sa.String(length=42), nullable=False),
        sa.Column("amount_usdc", sa.Numeric(precision=20, scale=6), nullable=False),
        sa.Column("asset", sa.String(length=10), nullable=False),
        sa.Column("network", sa.String(length=50), nullable=False),
        sa.Column("status", sa.String(length=16), nullable=False),
        sa.Column("tx_hash", sa.String(length=66), nullable=True),
        sa.Column("gas_used", sa.BigInteger(), nullable=True),
        sa.Column("gas_price_wei", sa.BigInteger(), nullable=True),
        sa.Column("block_number", sa.BigInteger(), nullable=True),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column("confirmed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint("amount_usdc > 0", name=op.f("ck_transactions_amount_positive")),
        sa.CheckConstraint(
            "status IN ('pending', 'submitted', 'confirmed', 'failed', 'rejected')",
            name=op.f("ck_transactions_status_valid"),
        ),
        sa.ForeignKeyConstraint(
            ["agent_id"], ["agents.id"], name=op.f("fk_transactions_agent_id_agents"), ondelete="RESTRICT"
        ),
        sa.ForeignKeyConstraint(
            ["approval_id"],
            ["payment_approvals.id"],
            name=op.f("fk_transactions_approval_id_payment_approvals"),
            ondelete="RESTRICT",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_transactions")),
        sa.UniqueConstraint("idempotency_key", name=op.f("uq_transactions_idempotency_key")),
    )
    op.create_index("ix_transactions_owner_status", "transactions", ["user_id", "status"], unique=False)
    op.create_index("ix_transactions_agent_created", "transactions", ["agent_id", "created_at"], unique=False)

    op.create_table(
        "audit_logs",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("user_id", sa.String(length=255), nullable=True),
        sa.Column("agent_id", sa.String(length=36), nullable=True),
        sa.Column("action", sa.String(length=100), nullable=False),
        sa.Column("subject_type", sa.String(length=50), nullable=True),
        sa.Column("subject_id", sa.String(length=100), nullable=True),
        sa.Column("details", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("ip_address", sa.String(length=45), nullable=True),
        sa.Column("user_agent", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_audit_logs")),
    )
    op.create_index("ix_audit_logs_user_created", "audit_logs", ["user_id", "created_at"], unique=False)
    op.create_index("ix_audit_logs_action_created", "audit_logs", ["action", "created_at"], unique=False)


def downgrade() -> None:
    # Roll back Phase 5 transaction and audit log tables.
    op.drop_index("ix_audit_logs_action_created", table_name="audit_logs")
    op.drop_index("ix_audit_logs_user_created", table_name="audit_logs")
    op.drop_table("audit_logs")
    op.drop_index("ix_transactions_agent_created", table_name="transactions")
    op.drop_index("ix_transactions_owner_status", table_name="transactions")
    op.drop_table("transactions")