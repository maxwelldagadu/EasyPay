from datetime import datetime
from decimal import Decimal

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Index, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin


# Record every on-chain payment attempt with its idempotency key so the same
# approved payment can never be executed twice, even under concurrent retries.
class Transaction(Base, TimestampMixin):
    __tablename__ = "transactions"
    __table_args__ = (
        CheckConstraint("amount_usdc > 0", name="ck_transactions_amount_positive"),
        CheckConstraint(
            "status IN ('pending', 'submitted', 'confirmed', 'failed', 'rejected')",
            name="ck_transactions_status_valid",
        ),
        Index("ix_transactions_owner_status", "user_id", "status"),
        Index("ix_transactions_idempotency_key", "idempotency_key", unique=True),
        Index("ix_transactions_agent_created", "agent_id", "created_at"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    user_id: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    agent_id: Mapped[str] = mapped_column(
        ForeignKey("agents.id", ondelete="RESTRICT"), nullable=False
    )
    approval_id: Mapped[str] = mapped_column(
        ForeignKey("payment_approvals.id", ondelete="RESTRICT"), nullable=False
    )
    idempotency_key: Mapped[str] = mapped_column(String(128), nullable=False, index=True)
    recipient_address: Mapped[str] = mapped_column(String(42), nullable=False)
    amount_usdc: Mapped[Decimal] = mapped_column(Numeric(20, 6), nullable=False)
    asset: Mapped[str] = mapped_column(String(10), nullable=False, default="USDC")
    network: Mapped[str] = mapped_column(String(50), nullable=False)
    status: Mapped[str] = mapped_column(String(16), nullable=False, default="pending")
    tx_hash: Mapped[str | None] = mapped_column(String(66), nullable=True)
    gas_used: Mapped[int | None] = mapped_column(nullable=True)
    gas_price_wei: Mapped[int | None] = mapped_column(nullable=True)
    block_number: Mapped[int | None] = mapped_column(nullable=True)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    confirmed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)