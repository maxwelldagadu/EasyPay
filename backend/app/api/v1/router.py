from fastapi import APIRouter

from app.api.v1.agents.router import router as agents_router

# Assemble versioned feature routers without mixing them with authentication-provider routes.
api_v1_router = APIRouter()
api_v1_router.include_router(agents_router)
