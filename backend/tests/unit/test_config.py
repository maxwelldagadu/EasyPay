import pytest
from pydantic import ValidationError

from app.core.config import Settings


# Verify environment origin lists become normalized, predictable CORS entries.
def test_cors_origins_are_normalized():
    # Test that comma-separated origins become a clean allowlist.
    settings = Settings(frontend_origin="http://localhost:3000, https://app.example.com")

    assert settings.cors_origins == [
        "http://localhost:3000",
        "https://app.example.com",
    ]


def test_ethereum_network_setting_rejects_mainnet():
    # Prevent deployments from configuring Phase 3 proposals against a real-money network.
    with pytest.raises(ValidationError, match="must identify a testnet"):
        Settings(ethereum_testnet_name="Ethereum Mainnet")
