from functools import lru_cache

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


# Centralize validated environment-backed settings for API and database components.
class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    database_url: str = ""
    frontend_origin: str = "http://localhost:3000"
    better_auth_url: str = "http://localhost:3000"
    better_auth_secret: str = ""
    groq_api_key: str = ""
    groq_model: str = "openai/gpt-oss-20b"
    ethereum_testnet_name: str = "Sepolia"
    ethereum_rpc_url: str = ""
    usdc_testnet_contract_address: str = ""
    chain_id: int = 11155111

    @field_validator("ethereum_testnet_name")
    @classmethod
    def reject_mainnet(cls, value: str) -> str:
        # Fail configuration early if the platform is pointed at a real-money network.
        normalized = value.strip()
        if not normalized or "mainnet" in normalized.casefold():
            raise ValueError("ETHEREUM_TESTNET_NAME must identify a testnet, not mainnet")
        return normalized

    @field_validator("chain_id")
    @classmethod
    def reject_mainnet_chain_id(cls, value: int) -> int:
        # Prevent accidental execution on Ethereum mainnet (chain id 1).
        if value == 1:
            raise ValueError("CHAIN_ID must identify a testnet, not mainnet")
        return value

    @field_validator("usdc_testnet_contract_address")
    @classmethod
    def normalize_contract_address(cls, value: str) -> str:
        # Store the USDC testnet token contract in checksum-free lowercase form.
        return value.strip().lower() if value else ""

    @property
    def cors_origins(self) -> list[str]:
        # Normalize the configured comma-separated browser origins into an explicit CORS allowlist.
        return [origin.strip() for origin in self.frontend_origin.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    # Reuse a single settings object so every component sees consistent environment values.
    return Settings()


# Load configuration once at import time for use by API and database setup.
settings = get_settings()

