import re
from datetime import datetime
from decimal import Decimal
from typing import Self

from pydantic import BaseModel, ConfigDict, Field, SecretStr, field_validator, model_validator


def _validate_recipients(recipients: list[str]) -> list[str]:
    # Normalize valid EVM addresses to lowercase so duplicate and restriction checks are consistent.
    normalized: list[str] = []
    for recipient in recipients:
        address = recipient.strip()
        if not re.fullmatch(r"0x[a-fA-F0-9]{40}", address):
            raise ValueError("Recipient addresses must be valid 20-byte EVM addresses")
        normalized.append(address.lower())
    if len(set(normalized)) != len(normalized):
        raise ValueError("Recipient addresses cannot contain duplicates")
    return normalized


class AgentConfiguration(BaseModel):
    # Share validated financial and permission fields between create and update requests.
    model_config = ConfigDict(extra="forbid")

    name: str = Field(min_length=2, max_length=100)
    description: str = Field(default="", max_length=1000)
    responsibility: str = Field(min_length=2, max_length=160)
    instructions: str = Field(default="", max_length=4000)
    budget_usdc: Decimal = Field(gt=0, max_digits=20, decimal_places=6)
    max_transaction_usdc: Decimal = Field(gt=0, max_digits=20, decimal_places=6)
    daily_limit_usdc: Decimal = Field(gt=0, max_digits=20, decimal_places=6)
    weekly_limit_usdc: Decimal = Field(gt=0, max_digits=20, decimal_places=6)
    monthly_limit_usdc: Decimal = Field(gt=0, max_digits=20, decimal_places=6)
    max_transaction_count: int | None = Field(default=None, ge=1)
    approved_recipients: list[str] = Field(default_factory=list, max_length=500)
    restricted_recipients: list[str] = Field(default_factory=list, max_length=500)

    @field_validator("name", "responsibility")
    @classmethod
    def trim_required_text(cls, value: str) -> str:
        # Reject visually blank names and responsibilities after removing surrounding whitespace.
        trimmed = value.strip()
        if len(trimmed) < 2:
            raise ValueError("Must contain at least two non-whitespace characters")
        return trimmed

    @field_validator("description", "instructions")
    @classmethod
    def trim_optional_text(cls, value: str) -> str:
        # Store user-authored text without accidental leading or trailing whitespace.
        return value.strip()

    @field_validator("approved_recipients", "restricted_recipients")
    @classmethod
    def normalize_addresses(cls, recipients: list[str]) -> list[str]:
        # Apply the same strict EVM address validation to both permission lists.
        return _validate_recipients(recipients)

    @model_validator(mode="after")
    def validate_limits_and_recipients(self) -> Self:
        # Keep each individual and period limit within the agent's total configured budget.
        period_limits = (
            self.max_transaction_usdc,
            self.daily_limit_usdc,
            self.weekly_limit_usdc,
            self.monthly_limit_usdc,
        )
        if any(limit > self.budget_usdc for limit in period_limits):
            raise ValueError("Transaction and period limits cannot exceed the total budget")

        # A recipient cannot simultaneously be explicitly approved and restricted.
        if set(self.approved_recipients).intersection(self.restricted_recipients):
            raise ValueError("A recipient cannot be both approved and restricted")
        return self


class AgentCreate(AgentConfiguration):
    # Accept a one-time PIN only on create and never include it in any response schema.
    approval_pin: SecretStr = Field(repr=False)

    @field_validator("approval_pin")
    @classmethod
    def validate_approval_pin(cls, value: SecretStr) -> SecretStr:
        # Keep the PIN exactly four numeric digits without exposing it in model repr output.
        if not re.fullmatch(r"\d{4}", value.get_secret_value()):
            raise ValueError("Approval PIN must contain exactly four digits")
        return value


class AgentUpdate(BaseModel):
    # Allow partial edits while requiring every supplied value to satisfy create-time constraints.
    model_config = ConfigDict(extra="forbid")

    name: str | None = Field(default=None, min_length=2, max_length=100)
    description: str | None = Field(default=None, max_length=1000)
    responsibility: str | None = Field(default=None, min_length=2, max_length=160)
    instructions: str | None = Field(default=None, max_length=4000)
    budget_usdc: Decimal | None = Field(default=None, gt=0, max_digits=20, decimal_places=6)
    max_transaction_usdc: Decimal | None = Field(default=None, gt=0, max_digits=20, decimal_places=6)
    daily_limit_usdc: Decimal | None = Field(default=None, gt=0, max_digits=20, decimal_places=6)
    weekly_limit_usdc: Decimal | None = Field(default=None, gt=0, max_digits=20, decimal_places=6)
    monthly_limit_usdc: Decimal | None = Field(default=None, gt=0, max_digits=20, decimal_places=6)
    max_transaction_count: int | None = Field(default=None, ge=1)
    approved_recipients: list[str] | None = Field(default=None, max_length=500)
    restricted_recipients: list[str] | None = Field(default=None, max_length=500)

    @field_validator("name", "responsibility")
    @classmethod
    def trim_required_text(cls, value: str | None) -> str | None:
        # Keep partial text updates consistent with the create schema.
        if value is None:
            return value
        trimmed = value.strip()
        if len(trimmed) < 2:
            raise ValueError("Must contain at least two non-whitespace characters")
        return trimmed

    @field_validator("description", "instructions")
    @classmethod
    def trim_optional_text(cls, value: str | None) -> str | None:
        # Normalize editable text without changing omitted fields.
        return value.strip() if value is not None else None

    @field_validator("approved_recipients", "restricted_recipients")
    @classmethod
    def normalize_addresses(cls, recipients: list[str] | None) -> list[str] | None:
        # Normalize a supplied list while leaving an omitted list untouched.
        return _validate_recipients(recipients) if recipients is not None else None

    @model_validator(mode="after")
    def reject_nulls_and_empty_updates(self) -> Self:
        # Disallow null-clearing of non-nullable configuration and empty PATCH requests.
        if not self.model_fields_set:
            raise ValueError("At least one agent setting must be provided")
        non_nullable_fields = self.model_fields_set - {"max_transaction_count"}
        if any(getattr(self, field_name) is None for field_name in non_nullable_fields):
            raise ValueError("Agent settings cannot be set to null")
        return self


class AgentPinChange(BaseModel):
    # Require the current agent PIN before accepting a new PIN, providing step-up authentication.
    model_config = ConfigDict(extra="forbid")

    current_pin: SecretStr = Field(repr=False)
    new_pin: SecretStr = Field(repr=False)
    confirm_pin: SecretStr = Field(repr=False)

    @field_validator("current_pin", "new_pin", "confirm_pin")
    @classmethod
    def validate_pin_format(cls, value: SecretStr) -> SecretStr:
        # Validate PINs without returning or stringifying their secret values.
        if not re.fullmatch(r"\d{4}", value.get_secret_value()):
            raise ValueError("PINs must contain exactly four digits")
        return value

    @model_validator(mode="after")
    def confirm_new_pin(self) -> Self:
        # Prevent accidental lockouts caused by typing a different confirmation PIN.
        if self.new_pin.get_secret_value() != self.confirm_pin.get_secret_value():
            raise ValueError("New PIN and confirmation do not match")
        return self


class AgentStatusUpdate(BaseModel):
    # Restrict status changes to an explicit boolean instead of accepting arbitrary fields.
    model_config = ConfigDict(extra="forbid")
    is_active: bool


class AgentRead(BaseModel):
    # Serialize only public agent settings; PIN hashes and fingerprints are never exposed.
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    description: str
    responsibility: str
    instructions: str
    budget_usdc: Decimal
    max_transaction_usdc: Decimal
    daily_limit_usdc: Decimal
    weekly_limit_usdc: Decimal
    monthly_limit_usdc: Decimal
    max_transaction_count: int | None
    approved_recipients: list[str]
    restricted_recipients: list[str]
    is_active: bool
    created_at: datetime
    updated_at: datetime
