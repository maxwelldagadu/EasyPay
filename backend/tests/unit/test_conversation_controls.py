import asyncio
from decimal import Decimal
from json import dumps as json_dumps
from types import SimpleNamespace

import httpx
import pytest
from fastapi import HTTPException
from pydantic import ValidationError

from app.agents.conversation_service import (
    build_payment_proposal,
    validate_configuration_proposal,
)
from app.ai.interpretation import interpret_instruction
from app.core.config import settings
from app.schemas.conversation import ConversationMessageCreate


def _agent(**overrides):
    # Provide a complete policy object so tests exercise only deterministic proposal checks.
    values = {
        "id": "agent-1",
        "name": "Shopping Assistant",
        "description": "",
        "responsibility": "Shopping",
        "instructions": "",
        "budget_usdc": Decimal("500"),
        "max_transaction_usdc": Decimal("100"),
        "daily_limit_usdc": Decimal("100"),
        "weekly_limit_usdc": Decimal("250"),
        "monthly_limit_usdc": Decimal("500"),
        "max_transaction_count": None,
        "approved_recipients": ["0x" + "a" * 40],
        "restricted_recipients": ["0x" + "b" * 40],
        "is_active": True,
    }
    return SimpleNamespace(**(values | overrides))


def test_payment_proposal_is_only_eligible_after_policy_checks():
    # A clean proposal passes limits and permissions but remains explicitly non-authorizing.
    proposal = build_payment_proposal(
        _agent(),
        {
            "amount_usdc": "45",
            "recipient_address": "0x" + "A" * 40,
            "asset": "USDC",
            "network": "Sepolia",
        },
        "Send 45 USDC on Sepolia",
    )

    assert proposal["status"] == "proposal_only"
    assert proposal["recipient_address"] == "0x" + "a" * 40
    assert any("no payment was executed" in warning for warning in proposal["warnings"])


@pytest.mark.parametrize(
    ("payment", "message", "reason"),
    [
        (
            {
                "amount_usdc": "45",
                "recipient_address": "0x" + "b" * 40,
                "asset": "USDC",
                "network": "Sepolia",
            },
            "Send 45 USDC",
            "restricted",
        ),
        (
            {
                "amount_usdc": "150",
                "recipient_address": "0x" + "a" * 40,
                "asset": "USDC",
                "network": "Sepolia",
            },
            "Send 150 USDC",
            "maximum transaction",
        ),
        (
            {
                "amount_usdc": "45",
                "recipient_address": "0x" + "a" * 40,
                "asset": "ETH",
                "network": "Sepolia",
            },
            "Send 45 ETH",
            "Only USDC",
        ),
        (
            {
                "amount_usdc": "45",
                "recipient_address": "0x" + "a" * 40,
                "asset": "USDC",
                "network": "Ethereum Mainnet",
            },
            "Send 45 USDC on mainnet",
            "Mainnet",
        ),
    ],
)
def test_payment_proposals_are_blocked_by_deterministic_policy(payment, message, reason):
    # A model-generated response cannot override restricted recipients, limits, assets, or network.
    proposal = build_payment_proposal(_agent(), payment, message)

    assert proposal["status"] == "blocked"
    assert any(reason.casefold() in issue.casefold() for issue in proposal["issues"])


def test_missing_payment_fields_require_clarification():
    # Incomplete AI output cannot be presented as a ready-to-review payment proposal.
    proposal = build_payment_proposal(_agent(), {"asset": "USDC"}, "Send a payment")

    assert proposal["status"] == "incomplete"
    assert len(proposal["issues"]) == 2


def test_configuration_proposals_are_merged_and_revalidated():
    # A valid partial change retains existing settings and serializes exact decimal values safely.
    changes = validate_configuration_proposal(
        _agent(),
        {"monthly_limit_usdc": "400", "max_transaction_usdc": "80"},
    )

    assert changes == {
        "max_transaction_usdc": "80",
        "monthly_limit_usdc": "400",
    }


def test_configuration_proposals_cannot_bypass_agent_budget_constraints():
    # Proposed limits are checked against the unchanged total budget before becoming actionable.
    with pytest.raises(ValidationError):
        validate_configuration_proposal(
            _agent(),
            {"monthly_limit_usdc": "800"},
        )


@pytest.mark.parametrize(
    "message",
    [
        "My approval PIN is 1234",
        "Here is my private key: 0x" + "c" * 64,
        "Use my recovery phrase for this transfer",
    ],
)
def test_chat_rejects_credentials_before_storage_or_provider_use(message):
    # Chat input validation prevents likely PINs and wallet secrets from being persisted or sent.
    with pytest.raises(ValidationError, match="Never enter"):
        ConversationMessageCreate(message=message)


def test_chat_fails_explicitly_when_groq_is_not_configured(monkeypatch):
    # Do not silently fake an AI response when the backend provider key is missing.
    monkeypatch.setattr(settings, "groq_api_key", "")

    with pytest.raises(HTTPException) as error:
        asyncio.run(interpret_instruction(_agent(), "Explain this agent's role", []))

    assert error.value.status_code == 503
    assert "GROQ_API_KEY" in error.value.detail


def test_chat_uses_groq_compatible_endpoint_and_configured_model(monkeypatch):
    # Keep provider use isolated in tests while verifying the exact backend request contract.
    requests = []

    async def fake_post(self, url, *, headers, json):
        requests.append({"url": url, "headers": headers, "json": json})
        return httpx.Response(
            200,
            json={
                "choices": [
                    {
                        "message": {
                            "role": "assistant",
                            "content": json_dumps(
                                {
                                    "intent": "clarification",
                                    "response": "Which recipient should I use?",
                                    "payment": None,
                                    "configuration_changes": None,
                                }
                            ),
                        }
                    }
                ]
            },
        )

    monkeypatch.setattr(settings, "groq_api_key", "test-groq-key")
    monkeypatch.setattr(settings, "groq_model", "openai/gpt-oss-20b")
    monkeypatch.setattr(httpx.AsyncClient, "post", fake_post)

    result = asyncio.run(interpret_instruction(_agent(), "Send 45 USDC", []))

    assert result.intent == "clarification"
    assert requests[0]["url"] == "https://api.groq.com/openai/v1/chat/completions"
    assert requests[0]["headers"]["Authorization"] == "Bearer test-groq-key"
    assert requests[0]["json"]["model"] == "openai/gpt-oss-20b"
