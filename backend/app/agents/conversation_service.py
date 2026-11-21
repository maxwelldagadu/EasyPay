import re
from datetime import UTC, datetime, timedelta
from decimal import Decimal, InvalidOperation
from typing import Any
from uuid import uuid4

from fastapi import HTTPException, status
from pydantic import ValidationError
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.agents.repository import get_owned_agent
from app.ai.interpretation import interpret_instruction
from app.core.config import settings
from app.models.agent import Agent
from app.models.conversation_message import AgentConversationMessage
from app.schemas.agents import AgentConfiguration, AgentUpdate
from app.schemas.conversation import (
    AIInterpretation,
    ConversationMessageCreate,
)

MAX_HISTORY_MESSAGES = 20
MAX_CONVERSATION_REQUESTS_PER_MINUTE = 10
EVM_ADDRESS_PATTERN = re.compile(r"0x[a-fA-F0-9]{40}")
MAINNET_PATTERN = re.compile(r"\bmainnet\b", re.IGNORECASE)
NON_USDC_PAYMENT_PATTERN = re.compile(
    r"\b\d+(?:\.\d+)?\s*(ETHEREUM|ETHER|ETH|BITCOIN|BTC|USDT|DAI|USD|SOL|BNB)\b",
    re.IGNORECASE,
)


def _read_agent(agent: Agent | None) -> Agent:
    # Treat missing and foreign-owned agents identically to prevent identifier disclosure.
    if agent is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Agent not found")
    return agent


async def _owned_agent(
    session: AsyncSession,
    owner_id: str,
    agent_id: str,
) -> Agent:
    # Keep every conversation operation scoped to the current owner's active agent.
    agent = await get_owned_agent(session, owner_id, agent_id)
    return _read_agent(agent)


def _current_configuration(agent: Agent) -> dict[str, object]:
    # Build the merge base from persisted policy fields, excluding authorization material.
    return {
        field_name: getattr(agent, field_name)
        for field_name in AgentConfiguration.model_fields
    }


def validate_configuration_proposal(
    agent: Agent,
    proposed_changes: dict[str, object],
) -> dict[str, object]:
    # Validate AI-proposed fields through the same complete configuration rules as manual edits.
    update = AgentUpdate.model_validate(proposed_changes)
    changes = update.model_dump(exclude_unset=True)
    merged = _current_configuration(agent)
    merged.update(changes)
    AgentConfiguration.model_validate(merged)
    return update.model_dump(mode="json", exclude_unset=True)


def build_payment_proposal(
    agent: Agent,
    payment: dict[str, object] | None,
    user_message: str,
) -> dict[str, object]:
    # Recheck extracted details deterministically; the model cannot authorize a transaction.
    payment = payment or {}
    amount_value = payment.get("amount_usdc", payment.get("amount"))
    recipient_value = payment.get("recipient_address", payment.get("recipient"))
    asset_value = payment.get("asset") or "USDC"
    requested_network = payment.get("network")
    network_name = settings.ethereum_testnet_name.strip() or "Sepolia"
    issues: list[str] = []
    checks: list[str] = []
    amount: Decimal | None = None
    missing_required_detail = False

    if amount_value is None or amount_value == "":
        missing_required_detail = True
        issues.append("The payment amount is missing.")
    else:
        try:
            amount = Decimal(str(amount_value))
        except (InvalidOperation, ValueError):
            issues.append("The payment amount is invalid.")
        if amount is not None and (not amount.is_finite() or amount <= 0):
            issues.append("The payment amount must be greater than zero.")
            amount = None
        if amount is not None:
            exponent = amount.normalize().as_tuple().exponent
            if isinstance(exponent, int) and exponent < -6:
                issues.append("USDC amounts can have at most six decimal places.")
                amount = None

    recipient: str | None = None
    if not isinstance(recipient_value, str) or not recipient_value.strip():
        missing_required_detail = True
        issues.append("The recipient wallet address is missing.")
    elif not EVM_ADDRESS_PATTERN.fullmatch(recipient_value.strip()):
        issues.append("The recipient must be a valid 20-byte EVM address.")
    else:
        recipient = recipient_value.strip().lower()

    asset = str(asset_value).strip().upper()
    unsupported_asset = NON_USDC_PAYMENT_PATTERN.search(user_message)
    if unsupported_asset:
        asset = unsupported_asset.group(1).upper()
        if asset in {"ETHER", "ETHEREUM"}:
            asset = "ETH"
        elif asset == "BITCOIN":
            asset = "BTC"
        issues.append("Only USDC is supported as a payment asset.")
    if asset != "USDC":
        if not any(issue == "Only USDC is supported as a payment asset." for issue in issues):
            issues.append("Only USDC is supported as a payment asset.")
    else:
        checks.append("Payment asset is USDC.")

    requested_network_text = str(requested_network or "").strip()
    configured_network = network_name.casefold()
    if MAINNET_PATTERN.search(user_message):
        issues.append("Mainnet payments are not supported; use the configured testnet.")
    elif requested_network_text and (
        configured_network not in requested_network_text.casefold()
        and requested_network_text.casefold() not in configured_network
    ):
        issues.append(f"Only the configured {network_name} testnet is supported.")
    else:
        checks.append(f"Network is the configured {network_name} testnet.")

    if not agent.is_active:
        issues.append("This agent is paused and cannot prepare payment requests.")
    else:
        checks.append("Agent is active.")

    if recipient is not None:
        approved = {address.lower() for address in agent.approved_recipients}
        restricted = {address.lower() for address in agent.restricted_recipients}
        if recipient in restricted:
            issues.append("This recipient is restricted by the agent.")
        elif approved and recipient not in approved:
            issues.append("This recipient is not on the agent's approved-recipient list.")
        else:
            checks.append("Recipient passes the configured recipient rules.")

    if amount is not None:
        ceilings = {
            "total agent budget": agent.budget_usdc,
            "maximum transaction": agent.max_transaction_usdc,
            "daily limit": agent.daily_limit_usdc,
            "weekly limit": agent.weekly_limit_usdc,
            "monthly limit": agent.monthly_limit_usdc,
        }
        for label, ceiling in ceilings.items():
            if amount > ceiling:
                issues.append(f"The amount exceeds the configured {label} of {ceiling} USDC.")
        if not any(issue.startswith("The amount exceeds") for issue in issues):
            checks.append("Amount is within the configured per-transaction and period ceilings.")

    non_missing_issues = [
        issue
        for issue in issues
        if issue not in {
            "The payment amount is missing.",
            "The recipient wallet address is missing.",
        }
    ]
    status_value = (
        "blocked"
        if non_missing_issues
        else "incomplete"
        if missing_required_detail
        else "proposal_only"
    )
    return {
        "type": "payment",
        "status": status_value,
        "amount_usdc": str(amount) if amount is not None else None,
        "recipient_address": recipient,
        "asset": asset,
        "network": network_name,
        "checks": checks,
        "issues": issues,
        "warnings": [
            "Current balance, cumulative spending, and transaction counts are not connected yet. "
            "This proposal is not an approval and no payment was executed."
        ],
    }


def _assistant_message(
    interpretation: AIInterpretation,
    proposal: dict[str, Any] | None,
) -> tuple[str, str | None]:
    # Replace model claims with fixed, truthful messages whenever deterministic checks block a proposal.
    if proposal is None:
        return interpretation.response, None
    if proposal["type"] == "payment":
        proposal_status = str(proposal["status"])
        if proposal_status == "blocked":
            return (
                "This payment proposal is blocked by the agent's current policy. "
                "Review the policy issues below.",
                None,
            )
        if proposal_status == "incomplete":
            return (
                "I need more details before I can prepare a payment proposal. "
                "Provide the missing details shown below.",
                None,
            )
        return (
            f"{interpretation.response}\n\nThis is only a proposal. It is not authorized, "
            "and no payment has been executed.",
            None,
        )
    return (
        f"{interpretation.response}\n\nReview and explicitly confirm these changes below; "
        "they have not been applied.",
        "pending",
    )


async def list_conversation_messages(
    session: AsyncSession,
    owner_id: str,
    agent_id: str,
) -> list[AgentConversationMessage]:
    # Return only the latest bounded conversation history for the authenticated agent owner.
    await _owned_agent(session, owner_id, agent_id)
    statement = (
        select(AgentConversationMessage)
        .where(
            AgentConversationMessage.user_id == owner_id,
            AgentConversationMessage.agent_id == agent_id,
        )
        .order_by(
            AgentConversationMessage.created_at.desc(),
            AgentConversationMessage.id.desc(),
        )
        .limit(MAX_HISTORY_MESSAGES * 2)
    )
    messages = list((await session.scalars(statement)).all())
    return list(reversed(messages))


async def create_conversation_turn(
    session: AsyncSession,
    owner_id: str,
    agent_id: str,
    request: ConversationMessageCreate,
) -> tuple[AgentConversationMessage, AgentConversationMessage]:
    # Enforce an owner-scoped request limit before incurring third-party model costs.
    agent = await _owned_agent(session, owner_id, agent_id)
    cutoff = datetime.now(UTC) - timedelta(minutes=1)
    request_count = await session.scalar(
        select(func.count(AgentConversationMessage.id)).where(
            AgentConversationMessage.user_id == owner_id,
            AgentConversationMessage.role == "user",
            AgentConversationMessage.created_at >= cutoff,
        )
    )
    if request_count is not None and request_count >= MAX_CONVERSATION_REQUESTS_PER_MINUTE:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Conversation rate limit reached. Try again in a minute.",
        )

    # Supply only a short, owner-scoped exchange history to keep requests bounded.
    recent = (
        await session.scalars(
            select(AgentConversationMessage)
            .where(
                AgentConversationMessage.user_id == owner_id,
                AgentConversationMessage.agent_id == agent_id,
            )
            .order_by(
                AgentConversationMessage.created_at.desc(),
                AgentConversationMessage.id.desc(),
            )
            .limit(MAX_HISTORY_MESSAGES)
        )
    ).all()
    history = [(item.role, item.content) for item in reversed(recent)]
    interpretation = await interpret_instruction(agent, request.message, history)

    proposal: dict[str, Any] | None = None
    if interpretation.intent == "payment_proposal":
        proposal = build_payment_proposal(agent, interpretation.payment, request.message)
    elif interpretation.intent == "configuration_proposal":
        try:
            if not interpretation.configuration_changes:
                raise ValueError("No configuration changes were provided")
            changes = validate_configuration_proposal(
                agent,
                interpretation.configuration_changes,
            )
            current_values = AgentConfiguration.model_validate(
                _current_configuration(agent)
            ).model_dump(mode="json")
            proposal = {
                "type": "configuration",
                "changes": changes,
                "current_values": {key: current_values[key] for key in changes},
            }
        except (ValidationError, ValueError):
            interpretation = AIInterpretation(
                intent="clarification",
                response=(
                    "I couldn't prepare those changes because they don't satisfy the agent's "
                    "configuration rules. Check that limits are positive, within the total budget, "
                    "and recipient addresses are valid."
                ),
            )

    assistant_content, proposal_status = _assistant_message(interpretation, proposal)
    user_message = AgentConversationMessage(
        id=str(uuid4()),
        user_id=owner_id,
        agent_id=agent_id,
        role="user",
        content=request.message,
        created_at=datetime.now(UTC),
    )
    assistant_message = AgentConversationMessage(
        id=str(uuid4()),
        user_id=owner_id,
        agent_id=agent_id,
        role="assistant",
        content=assistant_content,
        proposal=proposal,
        proposal_status=proposal_status,
        created_at=datetime.now(UTC),
    )
    session.add_all((user_message, assistant_message))
    await session.commit()
    await session.refresh(user_message)
    await session.refresh(assistant_message)
    return user_message, assistant_message


async def _pending_configuration_message(
    session: AsyncSession,
    owner_id: str,
    agent_id: str,
    message_id: str,
) -> AgentConversationMessage:
    # Lock the pending proposal so concurrent confirmation or dismissal cannot apply it twice.
    message = await session.scalar(
        select(AgentConversationMessage)
        .where(
            AgentConversationMessage.id == message_id,
            AgentConversationMessage.user_id == owner_id,
            AgentConversationMessage.agent_id == agent_id,
            AgentConversationMessage.role == "assistant",
        )
        .with_for_update()
    )
    if message is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Proposal not found")
    if (
        message.proposal_status != "pending"
        or not message.proposal
        or message.proposal.get("type") != "configuration"
    ):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This configuration proposal is no longer pending.",
        )
    return message


async def apply_configuration_proposal(
    session: AsyncSession,
    owner_id: str,
    agent_id: str,
    message_id: str,
) -> AgentConversationMessage:
    # Apply only a still-pending proposal after a separate authenticated user confirmation.
    agent = await get_owned_agent(session, owner_id, agent_id, for_update=True)
    agent = _read_agent(agent)
    message = await _pending_configuration_message(session, owner_id, agent_id, message_id)
    try:
        proposal = message.proposal
        if proposal is None or not isinstance(proposal.get("changes"), dict):
            raise ValueError("The configuration proposal is invalid")
        update = AgentUpdate.model_validate(proposal["changes"])
        changes = update.model_dump(exclude_unset=True)
        merged = _current_configuration(agent)
        merged.update(changes)
        validated = AgentConfiguration.model_validate(merged)
    except (ValidationError, ValueError, TypeError) as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="The configuration changed and this proposal is no longer valid. Review the current settings.",
        ) from exc

    # Revalidate against the current agent record to prevent stale proposals bypassing changed limits.
    for field_name, value in validated.model_dump().items():
        setattr(agent, field_name, value)
    message.proposal_status = "applied"
    await session.commit()
    await session.refresh(message)
    return message


async def dismiss_configuration_proposal(
    session: AsyncSession,
    owner_id: str,
    agent_id: str,
    message_id: str,
) -> AgentConversationMessage:
    # Record the user's rejection so an old configuration proposal cannot be applied later.
    await _owned_agent(session, owner_id, agent_id)
    message = await _pending_configuration_message(session, owner_id, agent_id, message_id)
    message.proposal_status = "dismissed"
    await session.commit()
    await session.refresh(message)
    return message
