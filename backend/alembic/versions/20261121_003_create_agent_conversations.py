"""create owner-scoped agent conversation messages

Revision ID: 20261121_003
Revises: 20261120_002
Create Date: 2026-11-21
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "20261121_003"
down_revision: Union[str, None] = "20261120_002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Retain owner-scoped conversations and structured proposals without tying history to agent deletion.
    op.create_table(
        "agent_conversation_messages",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("user_id", sa.String(length=255), nullable=False),
        sa.Column("agent_id", sa.String(length=36), nullable=False),
        sa.Column("role", sa.String(length=16), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("proposal", sa.JSON(), nullable=True),
        sa.Column("proposal_status", sa.String(length=16), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint(
            "role IN ('user', 'assistant')",
            name=op.f("ck_agent_conversation_messages_conversation_role_valid"),
        ),
        sa.CheckConstraint(
            "proposal_status IS NULL OR proposal_status IN ('pending', 'applied', 'dismissed')",
            name=op.f("ck_agent_conversation_messages_conversation_proposal_status_valid"),
        ),
        sa.ForeignKeyConstraint(
            ["agent_id"],
            ["agents.id"],
            name=op.f("fk_agent_conversation_messages_agent_id_agents"),
            ondelete="RESTRICT",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_agent_conversation_messages")),
    )
    op.create_index(
        "ix_agent_conversation_owner_agent_created",
        "agent_conversation_messages",
        ["user_id", "agent_id", "created_at"],
        unique=False,
    )
    op.create_index(
        "ix_agent_conversation_user_role_created",
        "agent_conversation_messages",
        ["user_id", "role", "created_at"],
        unique=False,
    )


def downgrade() -> None:
    # Remove only conversation storage when rolling back the Phase 3 migration.
    op.drop_index(
        "ix_agent_conversation_user_role_created",
        table_name="agent_conversation_messages",
    )
    op.drop_index(
        "ix_agent_conversation_owner_agent_created",
        table_name="agent_conversation_messages",
    )
    op.drop_table("agent_conversation_messages")
