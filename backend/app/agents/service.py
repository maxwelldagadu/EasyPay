from datetime import UTC, datetime, timedelta
from uuid import uuid4

from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.agents.pin_security import hash_pin, pin_fingerprint, verify_pin
from app.agents.repository import get_owned_agent, list_owned_agents, pin_fingerprint_exists
from app.core.config import settings
from app.models.agent import Agent
from app.schemas.agents import AgentConfiguration, AgentCreate, AgentPinChange, AgentUpdate

PIN_MAX_FAILURES = 5
PIN_LOCK_DURATION = timedelta(minutes=15)
PIN_PEPPER_MIN_LENGTH = 32


def _integrity_constraint_name(error: IntegrityError) -> str | None:
    # Read constraint metadata across psycopg and asyncpg wrappers without masking other database errors.
    original = error.orig
    diagnostic = getattr(original, "diag", None)
    return getattr(diagnostic, "constraint_name", None) or getattr(
        original,
        "constraint_name",
        None,
    )


# Keep ownership-scoped read behavior inside one domain boundary for every API route.
async def list_agents(session: AsyncSession, owner_id: str) -> list[Agent]:
    # Return only live agents and never serialize database entities directly to callers.
    return await list_owned_agents(session, owner_id)


async def get_agent(session: AsyncSession, owner_id: str, agent_id: str) -> Agent:
    # Treat a foreign-owned agent the same as a missing record to avoid ID enumeration.
    agent = await get_owned_agent(session, owner_id, agent_id)
    if agent is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Agent not found")
    return agent


def _pin_pepper() -> str:
    # Require a sufficiently strong server-only secret before generating PIN fingerprints.
    pepper = settings.better_auth_secret
    if len(pepper) < PIN_PEPPER_MIN_LENGTH:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="PIN security is not configured on the server",
        )
    return pepper


async def create_agent(
    session: AsyncSession,
    owner_id: str,
    request: AgentCreate,
) -> Agent:
    # Derive a keyed uniqueness value and a salted password hash without persisting the PIN.
    pepper = _pin_pepper()
    pin = request.approval_pin.get_secret_value()
    fingerprint = pin_fingerprint(owner_id, pin, pepper)
    if await pin_fingerprint_exists(session, owner_id, fingerprint):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Each agent must have a different approval PIN",
        )

    # Build the record only from validated configuration and server-generated security fields.
    configuration = request.model_dump(exclude={"approval_pin"})
    agent = Agent(
        id=str(uuid4()),
        user_id=owner_id,
        **configuration,
        approval_pin_hash=hash_pin(pin),
        pin_fingerprint=fingerprint,
    )
    session.add(agent)
    try:
        # Commit now so unique constraints catch concurrent attempts to reuse a PIN.
        await session.commit()
    except IntegrityError as exc:
        await session.rollback()
        if _integrity_constraint_name(exc) != "uq_agents_user_id_pin_fingerprint":
            raise
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Each agent must have a different approval PIN",
        ) from exc
    await session.refresh(agent)
    return agent


async def update_agent(
    session: AsyncSession,
    owner_id: str,
    agent_id: str,
    request: AgentUpdate,
) -> Agent:
    # Load through an ownership-filtered query before applying any client-supplied changes.
    agent = await get_agent(session, owner_id, agent_id)
    updated_fields = request.model_dump(exclude_unset=True)

    # Revalidate the merged state so a partial limit change cannot exceed the total budget.
    merged_configuration = {
        field_name: getattr(agent, field_name)
        for field_name in AgentConfiguration.model_fields
    }
    merged_configuration.update(updated_fields)
    try:
        validated_configuration = AgentConfiguration.model_validate(merged_configuration)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc

    # Persist only validated configuration, never accepting ownership or PIN fields from PATCH.
    for field_name, value in validated_configuration.model_dump().items():
        setattr(agent, field_name, value)
    await session.commit()
    await session.refresh(agent)
    return agent


async def set_agent_status(
    session: AsyncSession,
    owner_id: str,
    agent_id: str,
    is_active: bool,
) -> Agent:
    # Make pause and resume explicit, owner-checked operations on an undeleted agent.
    agent = await get_agent(session, owner_id, agent_id)
    agent.is_active = is_active
    await session.commit()
    await session.refresh(agent)
    return agent


async def delete_agent(session: AsyncSession, owner_id: str, agent_id: str) -> None:
    # Retain the agent row for transaction and audit references while removing it from active use.
    agent = await get_agent(session, owner_id, agent_id)
    agent.deleted_at = datetime.now(UTC)
    agent.is_active = False
    await session.commit()


async def change_agent_pin(
    session: AsyncSession,
    owner_id: str,
    agent_id: str,
    request: AgentPinChange,
) -> Agent:
    # Require the authenticated owner and current PIN before rotating the agent's approval secret.
    agent = await get_owned_agent(session, owner_id, agent_id, for_update=True)
    if agent is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Agent not found")
    now = datetime.now(UTC)
    lock_expires = agent.pin_locked_until
    if lock_expires is not None:
        if lock_expires.tzinfo is None:
            lock_expires = lock_expires.replace(tzinfo=UTC)
        if lock_expires > now:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="PIN changes are temporarily locked. Try again later.",
            )
        agent.pin_locked_until = None
        agent.pin_failed_attempts = 0

    # Persist each failed current-PIN attempt and apply a temporary lock after repeated failures.
    current_pin = request.current_pin.get_secret_value()
    if not verify_pin(current_pin, agent.approval_pin_hash):
        agent.pin_failed_attempts += 1
        if agent.pin_failed_attempts >= PIN_MAX_FAILURES:
            agent.pin_locked_until = now + PIN_LOCK_DURATION
        await session.commit()
        if agent.pin_locked_until is not None:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="PIN changes are temporarily locked after repeated failures.",
            )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Current agent PIN is incorrect",
        )

    # Check the owner's other agents, including deleted records, before accepting a new PIN.
    pepper = _pin_pepper()
    new_pin = request.new_pin.get_secret_value()
    fingerprint = pin_fingerprint(owner_id, new_pin, pepper)
    if await pin_fingerprint_exists(session, owner_id, fingerprint):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Each agent must have a different approval PIN",
        )

    # Replace the salted PIN hash and reset defensive counters after successful step-up verification.
    agent.approval_pin_hash = hash_pin(new_pin)
    agent.pin_fingerprint = fingerprint
    agent.pin_failed_attempts = 0
    agent.pin_locked_until = None
    try:
        # Let the database enforce per-owner uniqueness even when concurrent rotations race.
        await session.commit()
    except IntegrityError as exc:
        await session.rollback()
        if _integrity_constraint_name(exc) != "uq_agents_user_id_pin_fingerprint":
            raise
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Each agent must have a different approval PIN",
        ) from exc
    await session.refresh(agent)
    return agent
