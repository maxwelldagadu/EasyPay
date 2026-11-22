from datetime import datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class TransactionBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    agent_id: str
    approval_id: str
    idempotency_key: str
    recipient_address: str
    amount_usdc: Decimal
    asset: str
    network: str
    status: Literal["pending", "submitted", "confirmed", "failed", "rejected"]
    tx_hash: str | None = None
    gas_used: int | None = None
    gas_price_wei: int | None = None
    block_number: int | None = None
    error_message: str | None = None
    confirmed_at: datetime | None = None
    created_at: datetime
    updated_at: datetime


class TransactionCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    approval_id: str = Field(min_length=1, max_length=100)
    idempotency_key: str = Field(min_length=1, max_length=128)
    wallet_address: str = Field(min_length=42, max_length=42)


class TransactionRead(TransactionBase):
    pass


class TransactionList(BaseModel):
    transactions: list[TransactionRead]
    total: int