from typing import Annotated

import httpx
from fastapi import Depends, Header, HTTPException, status

from app.core.config import settings
from app.schemas.auth import SessionResult


# Resolve a trusted Better Auth session from the incoming browser credentials.
async def get_current_session(
    cookie: Annotated[str | None, Header()] = None,
    authorization: Annotated[str | None, Header()] = None,
) -> SessionResult:
    # Better Auth remains the session authority; the backend asks it to validate forwarded credentials.
    headers: dict[str, str] = {}
    if cookie:
        headers["Cookie"] = cookie
    if authorization:
        headers["Authorization"] = authorization
    # Reject anonymous requests before contacting the identity provider.
    if not headers:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")

    try:
        # Forward only the caller's session credentials to Better Auth's session inspection endpoint.
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(
                f"{settings.better_auth_url.rstrip('/')}/api/auth/get-session",
                headers=headers,
            )
    except httpx.RequestError as exc:
        # Distinguish an unavailable identity provider from an invalid user session.
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication service unavailable",
        ) from exc

    # Treat any non-success auth response as an absent or expired session.
    if response.status_code != 200:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired session")

    try:
        # Validate the external response shape before exposing user identity downstream.
        result = SessionResult.model_validate(response.json())
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Authentication service returned an invalid session",
        ) from exc

    return result


# Make the session resolver reusable as a typed dependency on protected routes.
CurrentSession = Annotated[SessionResult, Depends(get_current_session)]

