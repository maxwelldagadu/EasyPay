from datetime import UTC, datetime
from types import SimpleNamespace

import pytest
from pydantic import ValidationError

from app.schemas.agents import AgentCreate, AgentPinChange, AgentRead, AgentUpdate


def _create_payload() -> dict[str, object]:
    # Provide a valid baseline so each test can focus on the setting under examination.
    return {
        "name": "Shopping Assistant",
        "description": "Handles approved shopping payments.",
        "responsibility": "Shopping",
        "instructions": "Only pay for pre-approved purchases.",
        "budget_usdc": "500",
        "max_transaction_usdc": "100",
        "daily_limit_usdc": "100",
        "weekly_limit_usdc": "250",
        "monthly_limit_usdc": "500",
        "approved_recipients": ["0x" + "A" * 40],
        "restricted_recipients": [],
        "approval_pin": "0427",
    }


# Validate owner-entered configuration and normalize recipient addresses consistently.
def test_agent_create_normalizes_addresses_and_hides_pin_in_repr():
    # Valid creation input keeps the leading zero PIN intact and stores lowercase addresses.
    request = AgentCreate.model_validate(_create_payload())

    assert request.approved_recipients == ["0x" + "a" * 40]
    assert "0427" not in repr(request)


# Reject conflicting limits and overlapping recipient permission rules before persistence.
@pytest.mark.parametrize(
    ("changes", "message"),
    [
        ({"approval_pin": "427"}, "exactly four digits"),
        ({"max_transaction_usdc": "501"}, "cannot exceed"),
        ({"restricted_recipients": ["0x" + "a" * 40]}, "both approved and restricted"),
        ({"approved_recipients": ["not-an-address"]}, "valid 20-byte EVM addresses"),
        ({"user_id": "someone-else"}, "Extra inputs are not permitted"),
    ],
)
def test_agent_create_rejects_invalid_configuration(changes, message):
    # Malformed financial or authorization data never reaches the database layer.
    with pytest.raises(ValidationError, match=message):
        AgentCreate.model_validate({**_create_payload(), **changes})


# Verify PIN changes require both current-PIN knowledge and an exact new-PIN confirmation.
def test_agent_pin_change_requires_matching_confirmation():
    # A mismatched confirmation must fail even when each individual PIN is well-formed.
    with pytest.raises(ValidationError, match="do not match"):
        AgentPinChange(
            current_pin="0427",
            new_pin="1234",
            confirm_pin="1235",
        )


# Allow users to clear an optional transaction-count restriction without nulling required fields.
def test_agent_update_can_clear_transaction_count():
    # An explicit null is valid only for the optional transaction-count limit.
    request = AgentUpdate(max_transaction_count=None)

    assert request.model_dump(exclude_unset=True) == {"max_transaction_count": None}


# Ensure ORM-only credential fields never cross the public API response boundary.
def test_agent_read_never_serializes_pin_material():
    # Include sensitive attributes on the ORM-like object to test the response schema allowlist.
    agent = SimpleNamespace(
        id="agent-1",
        name="Shopping Assistant",
        description="",
        responsibility="Shopping",
        instructions="",
        budget_usdc="500",
        max_transaction_usdc="100",
        daily_limit_usdc="100",
        weekly_limit_usdc="250",
        monthly_limit_usdc="500",
        max_transaction_count=None,
        approved_recipients=[],
        restricted_recipients=[],
        is_active=True,
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC),
        approval_pin_hash="sensitive-hash",
        pin_fingerprint="sensitive-fingerprint",
    )

    response = AgentRead.model_validate(agent)

    assert "approval_pin_hash" not in response.model_dump()
    assert "pin_fingerprint" not in response.model_dump()
