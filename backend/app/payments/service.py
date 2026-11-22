import logging
import uuid
from decimal import Decimal
from datetime import UTC, datetime, timedelta

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.approvals.service import _validate_approval_controls
from app.blockchain.service import BlockchainService
from app.core.config import settings
from app.models.agent import Agent
from app.models.payment_approval import PaymentApproval
from app.models.transaction import Transaction

logger = logging.getLogger(__name__)

IDEMPOTENCY_TTL = timedelta(hours=24)


class PaymentExecutionError(Exception):
    """Raised when a payment cannot be executed on-chain."""


class PaymentsService:
    """Executes approved USDC payments on-chain with idempotency and replay protection."""

    def __init__(self, session: AsyncSession, blockchain: BlockchainService) -> None:
        self._session = session
        self._blockchain = blockchain

    async def _record_audit(
        self,
        user_id: str | None,
        action: str,
        agent_id: str | None = None,
        subject_type: str | None = None,
        subject_id: str | None = None,
        details: dict | None = None,
    ) -> None:
        from app.models.audit_log import AuditLog

        entry = AuditLog(
            id=str(uuid.uuid4()),
            user_id=user_id,
            agent_id=agent_id,
            action=action,
            subject_type=subject_type,
            subject_id=subject_id,
            details=details or {},
        )
        self._session.add(entry)

    async def _existing_transaction_by_idempotency(
        self, idempotency_key: str
    ) -> Transaction | None:
        result = await self._session.execute(
            select(Transaction).where(Transaction.idempotency_key == idempotency_key)
        )
        return result.scalar_one_or_none()

    async def execute_approved_payment(
        self,
        owner_id: str,
        approval_id: str,
        idempotency_key: str,
        wallet_address: str,
    ):
        # Prepare an approved wallet transfer: revalidate controls and estimate gas.
        # No private key or unrestricted on-chain submission occurs on the backend.
        approval = await self._session.get(PaymentApproval, approval_id)
        if approval is None or approval.user_id != owner_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Approval request not found",
            )
        if approval.status != "approved":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="This approval is not in an executable state",
            )
        if approval.expires_at <= datetime.now(UTC):
            approval.status = "expired"
            await self._session.commit()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="This approval has expired",
            )

        agent = await self._session.get(Agent, approval.agent_id)
        if agent is None or agent.user_id != owner_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Agent not found",
            )
        await _validate_approval_controls(
            self._session, agent, owner_id, approval.amount_usdc
        )

        existing = await self._existing_transaction_by_idempotency(idempotency_key)
        if existing is not None:
            from app.schemas.transactions import TransactionRead
            if existing.user_id != owner_id:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Idempotency key is already associated with another transaction",
                )
            return TransactionRead.model_validate(existing)

        if not self._blockchain.is_valid_address(wallet_address):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Invalid recipient wallet address",
            )

        tx = Transaction(
            id=str(uuid.uuid4()),
            user_id=owner_id,
            agent_id=agent.id,
            approval_id=approval.id,
            idempotency_key=idempotency_key,
            recipient_address=approval.recipient_address.lower(),
            amount_usdc=approval.amount_usdc,
            asset="USDC",
            network=settings.ethereum_testnet_name,
            status="pending",
        )
        self._session.add(tx)
        await self._session.commit()
        await self._session.refresh(tx)

        await self._record_audit(
            owner_id,
            "payment_execution_started",
            agent_id=agent.id,
            subject_type="transaction",
            subject_id=tx.id,
            details={
                "amount_usdc": str(approval.amount_usdc),
                "recipient_address": approval.recipient_address,
                "idempotency_key": idempotency_key,
            },
        )

        try:
            gas_estimate = await self._blockchain.estimate_gas(
                wallet_address,
                approval.recipient_address,
                approval.amount_usdc,
            )
            gas_price = await self._blockchain.get_gas_price()
            tx.gas_price_wei = gas_price
            tx.gas_used = gas_estimate
            await self._session.commit()

            # The wallet performs the signed transfer. The transaction remains
            # pending until its hash is reported and verified.
            await self._session.commit()
        except Exception as exc:
            logger.exception("Payment submission failed")
            tx.status = "failed"
            tx.error_message = str(exc)[:500]
            await self._session.commit()
            await self._record_audit(
                owner_id,
                "payment_execution_failed",
                agent_id=agent.id,
                subject_type="transaction",
                subject_id=tx.id,
                details={"error": str(exc)[:500]},
            )
            raise PaymentExecutionError(f"Payment execution failed: {exc}")

        await self._record_audit(
            owner_id,
            "payment_prepared",
            agent_id=agent.id,
            subject_type="transaction",
            subject_id=tx.id,
            details={
                "tx_hash": tx.tx_hash,
                "gas_used": tx.gas_used,
            },
        )
        from app.schemas.transactions import TransactionRead
        return TransactionRead.model_validate(tx)

    async def confirm_transaction(
        self, owner_id: str, tx_id: str, tx_hash: str
    ):
        # Bind a wallet-reported hash to the transaction and verify receipt state
        # before marking it confirmed.
        tx = await self._session.get(Transaction, tx_id)
        if tx is None or tx.user_id != owner_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Transaction not found",
            )
        if tx.status not in {"pending", "submitted"}:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Transaction is not in a submittable state",
            )
        if len(tx_hash) != 66 or not tx_hash.startswith("0x"):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Invalid Ethereum transaction hash",
            )
        try:
            int(tx_hash[2:], 16)
        except ValueError as exc:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Invalid Ethereum transaction hash",
            ) from exc

        tx.tx_hash = tx_hash
        receipt = await self._blockchain.get_transaction_receipt(tx_hash)
        if receipt is not None:
            successful = receipt.get("status") == 1 or receipt.get("status") is True
            if successful:
                tx.status = "confirmed"
                tx.confirmed_at = datetime.now(UTC)
                tx.block_number = receipt.get("blockNumber")
            else:
                tx.status = "failed"
                tx.error_message = "On-chain transaction reverted"
        else:
            tx.status = "submitted"
        await self._session.commit()
        await self._session.refresh(tx)

        approval = await self._session.get(PaymentApproval, tx.approval_id)
        if approval and approval.status == "approved":
            approval.status = "approved"

        audit_action = (
            "payment_confirmed"
            if tx.status == "confirmed"
            else "payment_failed"
            if tx.status == "failed"
            else "payment_submitted"
        )
        await self._record_audit(
            owner_id,
            audit_action,
            agent_id=tx.agent_id,
            subject_type="transaction",
            subject_id=tx.id,
            details={"tx_hash": tx_hash, "status": tx.status},
        )
        from app.schemas.transactions import TransactionRead
        return TransactionRead.model_validate(tx)

    async def list_transactions(
        self, owner_id: str, agent_id: str | None = None
    ):
        # Return owner-scoped transaction history, optionally filtered by agent.
        statement = select(Transaction).where(Transaction.user_id == owner_id)
        if agent_id:
            statement = statement.where(Transaction.agent_id == agent_id)
        statement = statement.order_by(Transaction.created_at.desc())
        result = await self._session.execute(statement)
        from app.schemas.transactions import TransactionRead
        return [TransactionRead.model_validate(row) for row in result.scalars().all()]