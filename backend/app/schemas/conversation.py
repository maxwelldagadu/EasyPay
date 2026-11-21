import re
from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator

PIN_PATTERN = re.compile(r"(?i)\b(?:approval[\s_-]+)?pin\b.{0,16}?\b\d{4}\b")
PRIVATE_KEY_PATTERN = re.compile(r"\b0x[a-fA-F0-9]{64}\b")
SECRET_PHRASE_PATTERN = re.compile(
    r"(?i)\b(?:private key|seed phrase|recovery phrase|mnemonic)\b"
)


def contains_secret_material(value: str) -> bool:
    # Reject likely credentials before they are stored or sent to the AI provider.
    return any(
        pattern.search(value)
        for pattern in (PIN_PATTERN, PRIVATE_KEY_PATTERN, SECRET_PHRASE_PATTERN)
    )


class ConversationMessageCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    message: str = Field(min_length=1, max_length=2000)

    @field_validator("message")
    @classmethod
    def validate_message(cls, value: str) -> str:
        # Normalize empty whitespace and keep credentials out of prompts and conversation history.
        value = value.strip()
        if not value:
            raise ValueError("Enter a message for your agent")
        if contains_secret_material(value):
            raise ValueError("Never enter an approval PIN, private key, or recovery phrase in chat")
        return value


class AIInterpretation(BaseModel):
    model_config = ConfigDict(extra="forbid")

    intent: Literal[
        "payment_proposal",
        "configuration_proposal",
        "clarification",
        "unsupported",
    ]
    response: str = Field(min_length=1, max_length=2000)
    payment: dict[str, Any] | None = None
    configuration_changes: dict[str, Any] | None = None


class ConversationMessageRead(BaseModel):
    id: str
    role: Literal["user", "assistant"]
    content: str
    proposal: dict[str, Any] | None
    proposal_status: Literal["pending", "applied", "dismissed"] | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ConversationTurnRead(BaseModel):
    user_message: ConversationMessageRead
    assistant_message: ConversationMessageRead
