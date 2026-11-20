from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.user_authentication.router import api_router
from app.api.v1.router import api_v1_router
from app.core.config import settings
from app.database.session import dispose_database


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Release pooled database connections when the API process shuts down.
    yield
    await dispose_database()


# Configure the API once with its environment-specific metadata and resource lifecycle.
app = FastAPI(
    description="Backend foundation for the EasyPay testnet USDC payment platform.",
    lifespan=lifespan,
)

# Permit the configured browser application to call the API with session credentials.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

# Keep the existing identity endpoint stable and mount product features under a versioned API path.
app.include_router(api_router, prefix="/user_auth")
app.include_router(api_v1_router, prefix="/api/v1")


@app.get("/health", tags=["system"])
async def health():
    # Report process availability without requiring external database or auth services.
    return {"status": "ok", "service": "easypay-api"}

