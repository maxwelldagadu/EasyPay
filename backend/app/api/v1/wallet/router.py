from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from web3 import Web3

from app.authentication.dependencies import CurrentSession
from app.approvals.service import get_testnet_balance
from app.blockchain.service import BlockchainService
from app.database.session import get_db
from app.models.testnet_balance import TestnetBalance

router = APIRouter(prefix="/wallet", tags=["wallet"])
DatabaseSession = Annotated[AsyncSession, Depends(get_db)]
WalletResponse = dict[str, str | None]


@router.post("/address", status_code=status.HTTP_201_CREATED)
async def save_wallet_address(
    current_session: CurrentSession,
    database: DatabaseSession,
    wallet_address: str,
) -> WalletResponse:
    # Validate and record only public wallet metadata; private keys never leave
    # the user's browser wallet.
    if not Web3.is_address(wallet_address):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid Ethereum wallet address",
        )
    balance = await get_testnet_balance(database, current_session.user.id)
    balance.wallet_address = Web3.to_checksum_address(wallet_address)
    await database.commit()
    await database.refresh(balance)
    return {
        "address": balance.wallet_address,
        "message": "Wallet address recorded. USDC balance is read from the blockchain.",
    }


@router.get("/address")
async def get_wallet_address(
    current_session: CurrentSession,
    database: DatabaseSession,
) -> WalletResponse:
    # Return only the public address owned and recorded by this user.
    balance = await database.get(TestnetBalance, current_session.user.id)
    address = balance.wallet_address if balance is not None else None
    return {
        "address": address,
        "message": "Connect a wallet to view your USDC balance.",
    }


@router.get("/balance")
async def read_wallet_balance(
    current_session: CurrentSession,
    database: DatabaseSession,
) -> WalletResponse:
    # Prefer the on-chain USDC balance over the local fallback record.
    balance = await database.get(TestnetBalance, current_session.user.id)
    if balance is None or not balance.wallet_address:
        return {"balance_usdc": "0", "updated_at": None}
    try:
        blockchain = BlockchainService()
        live_balance = await blockchain.get_usdc_balance(balance.wallet_address)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"USDC testnet balance is unavailable: {exc}",
        ) from exc
    balance.balance_usdc = live_balance
    await database.commit()
    await database.refresh(balance)
    return {
        "balance_usdc": str(balance.balance_usdc),
        "updated_at": balance.updated_at.isoformat(),
    }