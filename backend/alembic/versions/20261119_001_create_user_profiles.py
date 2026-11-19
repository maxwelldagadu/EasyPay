"""create user profiles table

Revision ID: 20261119_001
Revises:
Create Date: 2026-11-19
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# Identify this first schema revision so Alembic can order and reverse changes.
revision: str = "20261119_001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create application-owned profile preferences independently of Better Auth identity records.
    op.create_table(
        "user_profiles",
        sa.Column("user_id", sa.String(length=255), nullable=False),
        sa.Column("display_name", sa.String(length=100), nullable=True),
        sa.Column("timezone", sa.String(length=64), nullable=True),
        sa.Column("avatar_url", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("user_id", name=op.f("pk_user_profiles")),
    )


def downgrade() -> None:
    # Dropping a profile never removes Better Auth identity records.
    op.drop_table("user_profiles")

