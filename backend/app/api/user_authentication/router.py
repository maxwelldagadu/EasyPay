from fastapi import APIRouter

from app.api.user_authentication.routes.auth import router as auth_router

# Collect version-one feature routers before applying the common API prefix in the app entry point.
api_router = APIRouter()
api_router.include_router(auth_router)

