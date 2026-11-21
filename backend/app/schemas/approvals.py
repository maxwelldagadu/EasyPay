import re
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, SecretStr, field_validator


class TestnetBalanceRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    balance_usdc: Decimal
    updated_at: datetime


class TestnetBalanceUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    balance_usdc: Decimal = Field(ge=0, max_digits=20, decimal_places=6)


class PaymentApprovalCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    agent_id: str = Field(min_length=1, max_length=100)
    amount_usdc: Decimal = Field(gt=0, max_digits=20, decimal_places=6)
    recipient_address: str = Field(min_length=42, max_length=42)
    original_instruction: str = Field(default="", max_length=2000)

    @field_validator("recipient_address")
    @classmethod
    def validate_recipient(cls, value: str) -> str:
        value = value.strip().lower()
        if not re.fullmatch(r"0x[a-fA-F0-9]{40}", value):
            raise ValueError("Recipient address must be a valid 20-byte EVM address")
        return value


class PaymentApprovalRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    agent_id: str
    agent_name: str
    original_instruction: str
    recipient_address: str
    amount_usdc: Decimal
    asset: str
    network: str
    status: str
    expires_at: datetime
    approved_at: datetime | None
    rejected_at: datetime | None
    remaining_budget_usdc: Decimal
    available_balance_usdc: Decimal
    created_at: datetime
    updated_at: datetime


class PaymentApprovalDecision(BaseModel):
    model_config = ConfigDict(extra="forbid")

    approval_pin: SecretStr = Field(repr=False)

    @field_validator("approval_pin")
    @classmethod
    def validate_pin(cls, value: SecretStr) -> SecretStr:
        if not re.fullmatch(r"\d{4}", value.get_secret_value()):
            raise ValueError("Approval PIN must contain exactly four digits")
        return value
