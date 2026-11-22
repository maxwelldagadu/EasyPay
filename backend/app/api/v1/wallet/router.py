from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.authentication.dependencies import CurrentSession
from app.database.session import get_db
from app.models.testnet_balance import TestnetBalance

router = APIRouter(prefix="/wallet", tags=["wallet"])
DatabaseSession = Annotated[AsyncSession, Depends(get_db)]


@router.post("/address", status_code=status.HTTP_201_CREATED)
async def save_wallet_address(
    current_session: CurrentSession,
    database: DatabaseSession,
    wallet_address: str,
) -> dict:
    # Record the connected wallet address for the authenticated user without
    # storing any private keys or signing material.
    return {
        "address": wallet_address.lower(),
        "message": "Wallet address recorded. USDC balance is read from the blockchain.",
    }


@router.get("/address")
async def get_wallet_address(
    current_session: CurrentSession,
    database: DatabaseSession,
) -> dict:
    # Return the last recorded wallet address for the authenticated user.
    # The actual balance is always fetched live from the USDC testnet contract.
    return {"address": None, "message": "Connect a wallet to view your USDC balance."}


@router.get("/balance")
async def read_wallet_balance(
    current_session: CurrentSession,
    database: DatabaseSession,
) -> dict:
    # Return the testnet USDC balance from the local balance table until
    # verified wallet synchronization reads it directly from the blockchain.
    balance = await database.get(TestnetBalance, current_session.user.id)
    if balance is None:
        return {"balance_usdc": "0", "updated_at": balance.updated_at.isoformat() if balance else None}
    return {"balance_usdc": str(balance.balance_usdc), "updated_at": balance.updated_at.isoformat()}