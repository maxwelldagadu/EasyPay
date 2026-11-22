import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.authentication.dependencies import CurrentSession
from app.blockchain.service import BlockchainService
from app.database.session import get_db
from app.payments.service import PaymentsService, PaymentExecutionError
from app.schemas.transactions import TransactionCreate, TransactionList, TransactionRead

router = APIRouter(prefix="/payments", tags=["payments"])
DatabaseSession = Annotated[AsyncSession, Depends(get_db)]


def _blockchain() -> BlockchainService:
    # Build a fresh Web3 client per request so RPC configuration is always current.
    return BlockchainService()


@router.post("/execute", response_model=TransactionRead, status_code=status.HTTP_201_CREATED)
async def execute_payment(
    request: TransactionCreate,
    current_session: CurrentSession,
    database: DatabaseSession,
) -> TransactionRead:
    # Execute an approved payment on-chain after full backend validation.
    service = PaymentsService(database, _blockchain())
    try:
        return await service.execute_approved_payment(
            owner_id=current_session.user.id,
            approval_id=request.approval_id,
            idempotency_key=request.idempotency_key,
            wallet_address=request.wallet_address,
        )
    except PaymentExecutionError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc))


@router.post("/{tx_id}/confirm", response_model=TransactionRead)
async def confirm_payment(
    tx_id: str,
    current_session: CurrentSession,
    database: DatabaseSession,
    tx_hash: str,
) -> TransactionRead:
    # Confirm a submitted transaction after the connected wallet reports success.
    service = PaymentsService(database, _blockchain())
    return await service.confirm_transaction(
        owner_id=current_session.user.id,
        tx_id=tx_id,
        tx_hash=tx_hash,
    )


@router.get("", response_model=TransactionList)
async def list_user_transactions(
    current_session: CurrentSession,
    database: DatabaseSession,
    agent_id: str | None = None,
) -> TransactionList:
    # Return the authenticated user's transaction history, optionally filtered by agent.
    service = PaymentsService(database, _blockchain())
    transactions = await service.list_transactions(
        owner_id=current_session.user.id, agent_id=agent_id
    )
    return TransactionList(transactions=transactions, total=len(transactions))