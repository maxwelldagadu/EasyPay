"""create owner-scoped agent configuration records

Revision ID: 20261120_002
Revises: 20261119_001
Create Date: 2026-11-20
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# Identify the agent-management schema revision after the initial profile table.
revision: str = "20261120_002"
down_revision: Union[str, None] = "20261119_001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Persist editable agent configuration while retaining deleted agents for future history links.
    op.create_table(
        "agents",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("user_id", sa.String(length=255), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("responsibility", sa.String(length=160), nullable=False),
        sa.Column("instructions", sa.Text(), nullable=False),
        sa.Column("budget_usdc", sa.Numeric(precision=20, scale=6), nullable=False),
        sa.Column("max_transaction_usdc", sa.Numeric(precision=20, scale=6), nullable=False),
        sa.Column("daily_limit_usdc", sa.Numeric(precision=20, scale=6), nullable=False),
        sa.Column("weekly_limit_usdc", sa.Numeric(precision=20, scale=6), nullable=False),
        sa.Column("monthly_limit_usdc", sa.Numeric(precision=20, scale=6), nullable=False),
        sa.Column("max_transaction_count", sa.Integer(), nullable=True),
        sa.Column("approved_recipients", sa.JSON(), nullable=False),
        sa.Column("restricted_recipients", sa.JSON(), nullable=False),
        sa.Column("approval_pin_hash", sa.String(length=255), nullable=False),
        sa.Column("pin_fingerprint", sa.String(length=64), nullable=False),
        sa.Column("pin_failed_attempts", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("pin_locked_until", sa.DateTime(timezone=True), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint("budget_usdc > 0", name=op.f("ck_agents_budget_positive")),
        sa.CheckConstraint("max_transaction_usdc > 0", name=op.f("ck_agents_max_transaction_positive")),
        sa.CheckConstraint(
            "max_transaction_usdc <= budget_usdc",
            name=op.f("ck_agents_transaction_within_budget"),
        ),
        sa.CheckConstraint(
            "daily_limit_usdc > 0 AND daily_limit_usdc <= budget_usdc",
            name=op.f("ck_agents_daily_limit_valid"),
        ),
        sa.CheckConstraint(
            "weekly_limit_usdc > 0 AND weekly_limit_usdc <= budget_usdc",
            name=op.f("ck_agents_weekly_limit_valid"),
        ),
        sa.CheckConstraint(
            "monthly_limit_usdc > 0 AND monthly_limit_usdc <= budget_usdc",
            name=op.f("ck_agents_monthly_limit_valid"),
        ),
        sa.CheckConstraint(
            "max_transaction_count IS NULL OR max_transaction_count > 0",
            name=op.f("ck_agents_transaction_count_positive"),
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_agents")),
        sa.UniqueConstraint(
            "user_id",
            "pin_fingerprint",
            name=op.f("uq_agents_user_id_pin_fingerprint"),
        ),
    )
    op.create_index(op.f("ix_agents_user_id"), "agents", ["user_id"], unique=False)
    op.create_index(
        "ix_agents_owner_active",
        "agents",
        ["user_id", "is_active", "deleted_at"],
        unique=False,
    )


def downgrade() -> None:
    # Drop only the agent table and its indexes when rolling back this feature revision.
    op.drop_index("ix_agents_owner_active", table_name="agents")
    op.drop_index(op.f("ix_agents_user_id"), table_name="agents")
    op.drop_table("agents")
