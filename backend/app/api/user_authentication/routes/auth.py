from fastapi import APIRouter

from app.authentication.dependencies import CurrentSession

# Group endpoints that expose authenticated identity information.
router = APIRouter(tags=["authentication"])


@router.get("/session")
async def session(current_session: CurrentSession) -> dict[str, dict[str, object]]:
    # Return the minimum UI identity and session fields without relaying credentials or provider internals.
    return {
        "session": {
            "id": current_session.session.id,
            "expiresAt": current_session.session.expires_at,
        },
        "user": {
            "id": current_session.user.id,
            "email": current_session.user.email,
            "name": current_session.user.name,
        },
    }

