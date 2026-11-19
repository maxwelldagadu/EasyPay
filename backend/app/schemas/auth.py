from typing import Any

from pydantic import BaseModel, ConfigDict, Field


# Represent the minimal authenticated user identity returned by Better Auth.
class AuthUser(BaseModel):
    model_config = ConfigDict(extra="allow")

    id: str
    email: str
    name: str | None = None


# Preserve the external session identifier and expiry field from the auth provider response.
class AuthSession(BaseModel):
    model_config = ConfigDict(extra="allow")

    id: str
    expires_at: Any = Field(alias="expiresAt")


# Validate the paired identity and session payload before protected API handlers use it.
class SessionResult(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra="allow")

    session: AuthSession
    user: AuthUser

