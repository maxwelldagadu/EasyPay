import logging
from decimal import Decimal
from typing import Any

from web3 import Web3
from web3.contract import Contract
from web3.middleware import async_geth_poa_middleware

from app.core.config import settings

logger = logging.getLogger(__name__)

# ERC-20 ABI subset needed for USDC balance reads and transfers.
USDC_ABI = [
    {
        "constant": True,
        "inputs": [{"name": "account", "type": "address"}],
        "name": "balanceOf",
        "outputs": [{"name": "", "type": "uint256"}],
        "type": "function",
    },
    {
        "constant": False,
        "inputs": [
            {"name": "recipient", "type": "address"},
            {"name": "amount", "type": "uint256"},
        ],
        "name": "transfer",
        "outputs": [{"name": "", "type": "bool"}],
        "type": "function",
    },
    {
        "constant": True,
        "inputs": [],
        "name": "decimals",
        "outputs": [{"name": "", "type": "uint8"}],
        "type": "function",
    },
]


class BlockchainService:
    """Web3.py wrapper for Ethereum-compatible testnet USDC interactions.

    The service never holds private keys. It signs and submits transactions using
    caller-provided signed payloads or connected wallet signatures only.
    """

    def __init__(self) -> None:
        if not settings.ethereum_rpc_url:
            raise ValueError("ETHEREUM_RPC_URL is required for blockchain interactions")
        self._w3 = Web3(Web3.HTTPProvider(settings.ethereum_rpc_url))
        # Sepolia and other PoA testnets require the geth POA middleware.
        self._w3.middleware_onion.inject(async_geth_poa_middleware, layer=0)
        self._contract: Contract | None = None
        if settings.usdc_testnet_contract_address:
            self._contract = self._w3.eth.contract(
                address=Web3.to_checksum_address(settings.usdc_testnet_contract_address),
                abi=USDC_ABI,
            )

    @property
    def is_connected(self) -> bool:
        # Return True only when the RPC endpoint responds to a peer-count request.
        try:
            return self._w3.is_connected()
        except Exception:
            return False

    @property
    def chain_id(self) -> int:
        return settings.chain_id

    @property
    def contract(self) -> Contract:
        if self._contract is None:
            raise ValueError("USDC testnet contract address is not configured")
        return self._contract

    def to_checksum_address(self, address: str) -> str:
        # Normalize any user-supplied address to Ethereum checksum format.
        return Web3.to_checksum_address(address)

    def is_valid_address(self, address: str) -> bool:
        # Reject malformed addresses before any RPC call.
        try:
            return Web3.is_address(address)
        except Exception:
            return False

    async def get_usdc_balance(self, wallet_address: str) -> Decimal:
        # Read the actual USDC testnet balance for a connected wallet address.
        if self._contract is None:
            raise ValueError("USDC contract is not configured")
        checksum = self.to_checksum_address(wallet_address)
        raw_balance = await self._w3.eth.contract(
            address=self._contract.address, abi=USDC_ABI
        ).functions.balanceOf(checksum).call()
        decimals = await self._contract.functions.decimals().call()
        return Decimal(raw_balance) / Decimal(10 ** decimals)

    async def get_native_balance(self, wallet_address: str) -> Decimal:
        # Read native testnet token (ETH on Sepolia) balance for gas estimation.
        checksum = self.to_checksum_address(wallet_address)
        raw_balance = await self._w3.eth.get_balance(checksum)
        return Decimal(raw_balance) / Decimal(10**18)

    async def estimate_gas(
        self, from_address: str, to_address: str, amount_usdc: Decimal
    ) -> int:
        # Estimate gas for a USDC transfer without submitting it.
        if self._contract is None:
            raise ValueError("USDC contract is not configured")
        decimals = await self._contract.functions.decimals().call()
        raw_amount = int(amount_usdc * Decimal(10 ** decimals))
        checksum_from = self.to_checksum_address(from_address)
        checksum_to = self.to_checksum_address(to_address)
        return await self._w3.eth.estimate_gas(
            {
                "from": checksum_from,
                "to": self._contract.address,
                "data": self._contract.encode_abi(
                    "transfer", args=[checksum_to, raw_amount]
                ),
            }
        )

    async def get_gas_price(self) -> int:
        # Read the current network gas price in wei.
        return await self._w3.eth.gas_price

    async def get_transaction_receipt(self, tx_hash: str) -> dict[str, Any] | None:
        # Poll for a transaction receipt; returns None when still pending.
        try:
            receipt = await self._w3.eth.get_transaction_receipt(tx_hash)
            return dict(receipt) if receipt else None
        except Exception:
            return None

    async def get_transaction(self, tx_hash: str) -> dict[str, Any] | None:
        # Fetch a submitted transaction by its hash.
        try:
            tx = await self._w3.eth.get_transaction(tx_hash)
            return dict(tx) if tx else None
        except Exception:
            return None