from datetime import datetime
from decimal import Decimal

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    DateTime,
    Index,
    Integer,
    JSON,
    Numeric,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin


# Keep agent configuration independent from Better Auth records while retaining each owner's data.
class Agent(Base, TimestampMixin):
    __tablename__ = "agents"
    __table_args__ = (
        UniqueConstraint("user_id", "pin_fingerprint", name="uq_agents_user_id_pin_fingerprint"),
        CheckConstraint("budget_usdc > 0", name="budget_positive"),
        CheckConstraint("max_transaction_usdc > 0", name="max_transaction_positive"),
        CheckConstraint("max_transaction_usdc <= budget_usdc", name="transaction_within_budget"),
        CheckConstraint("daily_limit_usdc > 0 AND daily_limit_usdc <= budget_usdc", name="daily_limit_valid"),
        CheckConstraint("weekly_limit_usdc > 0 AND weekly_limit_usdc <= budget_usdc", name="weekly_limit_valid"),
        CheckConstraint("monthly_limit_usdc > 0 AND monthly_limit_usdc <= budget_usdc", name="monthly_limit_valid"),
        CheckConstraint("max_transaction_count IS NULL OR max_transaction_count > 0", name="transaction_count_positive"),
        Index("ix_agents_owner_active", "user_id", "is_active", "deleted_at"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    user_id: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False, default="")
    responsibility: Mapped[str] = mapped_column(String(160), nullable=False)
    instructions: Mapped[str] = mapped_column(Text, nullable=False, default="")
    budget_usdc: Mapped[Decimal] = mapped_column(Numeric(20, 6), nullable=False)
    max_transaction_usdc: Mapped[Decimal] = mapped_column(Numeric(20, 6), nullable=False)
    daily_limit_usdc: Mapped[Decimal] = mapped_column(Numeric(20, 6), nullable=False)
    weekly_limit_usdc: Mapped[Decimal] = mapped_column(Numeric(20, 6), nullable=False)
    monthly_limit_usdc: Mapped[Decimal] = mapped_column(Numeric(20, 6), nullable=False)
    max_transaction_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    approved_recipients: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    restricted_recipients: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    approval_pin_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    pin_fingerprint: Mapped[str] = mapped_column(String(64), nullable=False)
    pin_failed_attempts: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    pin_locked_until: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, server_default="true")
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
