from decimal import Decimal

from sqlalchemy import CheckConstraint, DateTime, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin


class TestnetBalance(Base, TimestampMixin):
    __tablename__ = "testnet_balances"
    __table_args__ = (
        CheckConstraint("balance_usdc >= 0", name="testnet_balance_non_negative"),
    )

    user_id: Mapped[str] = mapped_column(String(255), primary_key=True)
    balance_usdc: Mapped[Decimal] = mapped_column(
        Numeric(20, 6),
        nullable=False,
        default=Decimal("0"),
    )
    wallet_address: Mapped[str | None] = mapped_column(String(42), nullable=True)
