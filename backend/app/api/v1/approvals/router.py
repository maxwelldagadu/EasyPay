from decimal import Decimal
from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.approvals.service import (
    approve_payment,
    create_payment_approval,
    get_testnet_balance,
    list_payment_approvals,
    reject_payment,
    update_testnet_balance,
)
from app.authentication.dependencies import CurrentSession
from app.database.session import get_db
from app.models.agent import Agent
from app.models.payment_approval import PaymentApproval
from app.schemas.approvals import (
    PaymentApprovalCreate,
    PaymentApprovalDecision,
    PaymentApprovalRead,
    TestnetBalanceRead,
    TestnetBalanceUpdate,
)

router = APIRouter(prefix="/financial", tags=["financial controls"])
DatabaseSession = Annotated[AsyncSession, Depends(get_db)]


async def _read_model(
    session: AsyncSession,
    owner_id: str,
    approval: PaymentApproval,
    agent_name: str,
    available_balance: Decimal,
) -> PaymentApprovalRead:
    approved_total = await session.scalar(
        select(func.coalesce(func.sum(PaymentApproval.amount_usdc), Decimal("0"))).where(
            PaymentApproval.user_id == owner_id,
            PaymentApproval.agent_id == approval.agent_id,
            PaymentApproval.status == "approved",
        )
    )
    total = Decimal(str(approved_total or 0))
    agent = await session.get(Agent, approval.agent_id)
    remaining = max(Decimal("0"), (agent.budget_usdc - total) if agent is not None else Decimal("0"))
    return PaymentApprovalRead(
        id=approval.id,
        agent_id=approval.agent_id,
        agent_name=agent_name,
        original_instruction=approval.original_instruction,
        recipient_address=approval.recipient_address,
        amount_usdc=approval.amount_usdc,
        asset=approval.asset,
        network=approval.network,
        status=approval.status,
        expires_at=approval.expires_at,
        approved_at=approval.approved_at,
        rejected_at=approval.rejected_at,
        remaining_budget_usdc=remaining,
        available_balance_usdc=available_balance,
        created_at=approval.created_at,
        updated_at=approval.updated_at,
    )


@router.get("/balance", response_model=TestnetBalanceRead)
async def read_testnet_balance(
    current_session: CurrentSession,
    database: DatabaseSession,
) -> TestnetBalanceRead:
    # Return only the authenticated user's testnet USDC balance.
    return TestnetBalanceRead.model_validate(
        await get_testnet_balance(database, current_session.user.id)
    )


@router.put("/balance", response_model=TestnetBalanceRead)
async def set_testnet_balance(
    request: TestnetBalanceUpdate,
    current_session: CurrentSession,
    database: DatabaseSession,
) -> TestnetBalanceRead:
    # Explicit test balance configuration is isolated until verified wallet synchronization arrives in Phase 5.
    return TestnetBalanceRead.model_validate(
        await update_testnet_balance(database, current_session.user.id, request.balance_usdc)
    )


@router.get("/approvals", response_model=list[PaymentApprovalRead])
async def read_payment_approvals(
    current_session: CurrentSession,
    database: DatabaseSession,
) -> list[PaymentApprovalRead]:
    rows = await list_payment_approvals(database, current_session.user.id)
    return [
        await _read_model(database, current_session.user.id, approval, agent.name, balance.balance_usdc)
        for approval, agent, balance in rows
    ]


@router.post("/approvals", response_model=PaymentApprovalRead, status_code=201)
async def create_approval_request(
    request: PaymentApprovalCreate,
    current_session: CurrentSession,
    database: DatabaseSession,
) -> PaymentApprovalRead:
    approval = await create_payment_approval(database, current_session.user.id, request)
    balance = await get_testnet_balance(database, current_session.user.id)
    agent = await database.get(Agent, approval.agent_id)
    return await _read_model(
        database,
        current_session.user.id,
        approval,
        agent.name if agent is not None else "Deleted agent",
        balance.balance_usdc,
    )


@router.post("/approvals/{approval_id}/approve", response_model=PaymentApprovalRead)
async def approve_approval_request(
    approval_id: str,
    request: PaymentApprovalDecision,
    current_session: CurrentSession,
    database: DatabaseSession,
) -> PaymentApprovalRead:
    approval = await approve_payment(
        database,
        current_session.user.id,
        approval_id,
        request.approval_pin.get_secret_value(),
    )
    balance = await get_testnet_balance(database, current_session.user.id)
    agent = await database.get(Agent, approval.agent_id)
    return await _read_model(
        database,
        current_session.user.id,
        approval,
        agent.name if agent is not None else "Deleted agent",
        balance.balance_usdc,
    )


@router.post("/approvals/{approval_id}/reject", response_model=PaymentApprovalRead)
async def reject_approval_request(
    approval_id: str,
    current_session: CurrentSession,
    database: DatabaseSession,
) -> PaymentApprovalRead:
    approval = await reject_payment(database, current_session.user.id, approval_id)
    balance = await get_testnet_balance(database, current_session.user.id)
    agent = await database.get(Agent, approval.agent_id)
    return await _read_model(
        database,
        current_session.user.id,
        approval,
        agent.name if agent is not None else "Deleted agent",
        balance.balance_usdc,
    )
