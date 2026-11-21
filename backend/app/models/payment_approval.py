from datetime import datetime
from decimal import Decimal

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    Index,
    Numeric,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin


class PaymentApproval(Base, TimestampMixin):
    __tablename__ = "payment_approvals"
    __table_args__ = (
        CheckConstraint("amount_usdc > 0", name="approval_amount_positive"),
        CheckConstraint(
            "status IN ('pending', 'approved', 'rejected', 'expired')",
            name="approval_status_valid",
        ),
        Index("ix_payment_approvals_owner_status", "user_id", "status"),
        Index("ix_payment_approvals_agent_created", "agent_id", "created_at"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    user_id: Mapped[str] = mapped_column(String(255), nullable=False)
    agent_id: Mapped[str] = mapped_column(
        ForeignKey("agents.id", ondelete="RESTRICT"),
        nullable=False,
    )
    original_instruction: Mapped[str] = mapped_column(Text, nullable=False)
    recipient_address: Mapped[str] = mapped_column(String(42), nullable=False)
    amount_usdc: Mapped[Decimal] = mapped_column(Numeric(20, 6), nullable=False)
    asset: Mapped[str] = mapped_column(String(10), nullable=False, default="USDC")
    network: Mapped[str] = mapped_column(String(50), nullable=False)
    status: Mapped[str] = mapped_column(String(16), nullable=False, default="pending")
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    approved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    rejected_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    pin_failed_attempts: Mapped[int] = mapped_column(nullable=False, default=0)
    pin_locked_until: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
