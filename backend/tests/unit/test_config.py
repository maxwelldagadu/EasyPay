from app.core.config import Settings


# Verify environment origin lists become normalized, predictable CORS entries.
def test_cors_origins_are_normalized():
    # Test that comma-separated origins become a clean allowlist.
    settings = Settings(frontend_origin="http://localhost:3000, https://app.example.com")

    assert settings.cors_origins == [
        "http://localhost:3000",
        "https://app.example.com",
    ]
