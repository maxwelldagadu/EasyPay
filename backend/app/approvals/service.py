from datetime import UTC, datetime, timedelta
from decimal import Decimal
from uuid import uuid4

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.agents.pin_security import verify_pin
from app.agents.repository import get_owned_agent
from app.core.config import settings
from app.models.agent import Agent
from app.models.payment_approval import PaymentApproval
from app.models.testnet_balance import TestnetBalance
from app.schemas.approvals import PaymentApprovalCreate

APPROVAL_LIFETIME = timedelta(minutes=15)
PIN_MAX_FAILURES = 5
PIN_LOCK_DURATION = timedelta(minutes=15)


def _utc_now() -> datetime:
    return datetime.now(UTC)


async def get_testnet_balance(session: AsyncSession, owner_id: str) -> TestnetBalance:
    balance = await session.get(TestnetBalance, owner_id)
    if balance is None:
        balance = TestnetBalance(user_id=owner_id, balance_usdc=Decimal("0"))
        session.add(balance)
        await session.commit()
        await session.refresh(balance)
    return balance


async def update_testnet_balance(
    session: AsyncSession,
    owner_id: str,
    balance_usdc: Decimal,
) -> TestnetBalance:
    # This is the explicit testnet balance source until a verified wallet sync is implemented in Phase 5.
    balance = await get_testnet_balance(session, owner_id)
    balance.balance_usdc = balance_usdc
    await session.commit()
    await session.refresh(balance)
    return balance


async def _approved_spending(
    session: AsyncSession,
    owner_id: str,
    agent_id: str,
    since: datetime,
) -> Decimal:
    total = await session.scalar(
        select(func.coalesce(func.sum(PaymentApproval.amount_usdc), Decimal("0"))).where(
            PaymentApproval.user_id == owner_id,
            PaymentApproval.agent_id == agent_id,
            PaymentApproval.status == "approved",
            PaymentApproval.approved_at >= since,
        )
    )
    return Decimal(str(total or 0))


async def _validate_approval_controls(
    session: AsyncSession,
    agent: Agent,
    owner_id: str,
    amount: Decimal,
) -> None:
    balance = await get_testnet_balance(session, owner_id)
    if amount > balance.balance_usdc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Insufficient USDC balance.",
        )
    if not agent.is_active:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="This agent is paused.")

    now = _utc_now()
    spent_total = await _approved_spending(session, owner_id, agent.id, datetime.min.replace(tzinfo=UTC))
    spent_daily = await _approved_spending(session, owner_id, agent.id, now - timedelta(days=1))
    spent_weekly = await _approved_spending(session, owner_id, agent.id, now - timedelta(days=7))
    spent_monthly = await _approved_spending(session, owner_id, agent.id, now - timedelta(days=30))
    limits = (
        ("budget", agent.budget_usdc, spent_total),
        ("maximum transaction", agent.max_transaction_usdc, Decimal("0")),
        ("daily limit", agent.daily_limit_usdc, spent_daily),
        ("weekly limit", agent.weekly_limit_usdc, spent_weekly),
        ("monthly limit", agent.monthly_limit_usdc, spent_monthly),
    )
    for label, limit, spent in limits:
        if label == "maximum transaction":
            if amount > limit:
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=f"Amount exceeds the configured {label}.")
        elif spent + amount > limit:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"This agent has reached or would exceed its configured {label}.",
            )


async def create_payment_approval(
    session: AsyncSession,
    owner_id: str,
    request: PaymentApprovalCreate,
) -> PaymentApproval:
    agent = await get_owned_agent(session, owner_id, request.agent_id)
    if agent is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Agent not found")

    recipient = request.recipient_address.lower()
    approved = {address.lower() for address in agent.approved_recipients}
    restricted = {address.lower() for address in agent.restricted_recipients}
    if recipient in restricted:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="This recipient is restricted.")
    if approved and recipient not in approved:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="This recipient is not approved.")

    await _validate_approval_controls(session, agent, owner_id, request.amount_usdc)
    now = _utc_now()
    approval = PaymentApproval(
        id=str(uuid4()),
        user_id=owner_id,
        agent_id=agent.id,
        original_instruction=request.original_instruction,
        recipient_address=recipient,
        amount_usdc=request.amount_usdc,
        asset="USDC",
        network=settings.ethereum_testnet_name,
        status="pending",
        expires_at=now + APPROVAL_LIFETIME,
        pin_failed_attempts=0,
    )
    session.add(approval)
    await session.commit()
    await session.refresh(approval)
    return approval


async def list_payment_approvals(session: AsyncSession, owner_id: str) -> list[tuple[PaymentApproval, Agent, TestnetBalance]]:
    now = _utc_now()
    pending = (
        await session.scalars(
            select(PaymentApproval).where(
                PaymentApproval.user_id == owner_id,
                PaymentApproval.status == "pending",
            )
        )
    ).all()
    for approval in pending:
        if approval.expires_at <= now:
            approval.status = "expired"
    if pending:
        await session.commit()

    rows = await session.execute(
        select(PaymentApproval, Agent, TestnetBalance)
        .join(Agent, Agent.id == PaymentApproval.agent_id)
        .outerjoin(TestnetBalance, TestnetBalance.user_id == PaymentApproval.user_id)
        .where(PaymentApproval.user_id == owner_id)
        .order_by(PaymentApproval.created_at.desc())
    )
    return [
        (approval, agent, balance or TestnetBalance(user_id=owner_id, balance_usdc=Decimal("0")))
        for approval, agent, balance in rows.all()
    ]


async def approve_payment(
    session: AsyncSession,
    owner_id: str,
    approval_id: str,
    approval_pin: str,
) -> PaymentApproval:
    approval = await session.scalar(
        select(PaymentApproval)
        .where(PaymentApproval.id == approval_id, PaymentApproval.user_id == owner_id)
        .with_for_update()
    )
    if approval is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Approval request not found")
    if approval.status != "pending":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="This approval is no longer pending")
    if approval.expires_at <= _utc_now():
        approval.status = "expired"
        await session.commit()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="This approval has expired")

    agent = await get_owned_agent(session, owner_id, approval.agent_id, for_update=True)
    if agent is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Agent not found")
    await _validate_approval_controls(session, agent, owner_id, approval.amount_usdc)

    now = _utc_now()
    if agent.pin_locked_until is not None:
        lock_expires = agent.pin_locked_until
        if lock_expires.tzinfo is None:
            lock_expires = lock_expires.replace(tzinfo=UTC)
        if lock_expires > now:
            raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="PIN verification is temporarily locked")

    if not verify_pin(approval_pin, agent.approval_pin_hash):
        agent.pin_failed_attempts += 1
        approval.pin_failed_attempts = agent.pin_failed_attempts
        if agent.pin_failed_attempts >= PIN_MAX_FAILURES:
            agent.pin_locked_until = now + PIN_LOCK_DURATION
            approval.pin_locked_until = agent.pin_locked_until
        await session.commit()
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Agent approval PIN is incorrect",
        )

    approval.status = "approved"
    approval.approved_at = now
    agent.pin_failed_attempts = 0
    agent.pin_locked_until = None
    await session.commit()
    await session.refresh(approval)
    return approval


async def reject_payment(session: AsyncSession, owner_id: str, approval_id: str) -> PaymentApproval:
    approval = await session.scalar(
        select(PaymentApproval)
        .where(PaymentApproval.id == approval_id, PaymentApproval.user_id == owner_id)
        .with_for_update()
    )
    if approval is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Approval request not found")
    if approval.status != "pending":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="This approval is no longer pending")
    approval.status = "rejected"
    approval.rejected_at = _utc_now()
    await session.commit()
    await session.refresh(approval)
    return approval
