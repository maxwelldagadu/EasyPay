from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.agent import Agent


# Centralize owner-scoped agent queries so no endpoint can accidentally query by ID alone.
async def list_owned_agents(session: AsyncSession, owner_id: str) -> list[Agent]:
    # Exclude soft-deleted agents from day-to-day management while retaining them for history.
    result = await session.scalars(
        select(Agent)
        .where(Agent.user_id == owner_id, Agent.deleted_at.is_(None))
        .order_by(Agent.created_at.desc())
    )
    return list(result)


async def get_owned_agent(
    session: AsyncSession,
    owner_id: str,
    agent_id: str,
    *,
    include_deleted: bool = False,
    for_update: bool = False,
) -> Agent | None:
    # Bind every record lookup to the authenticated owner, including detail and mutation paths.
    statement = select(Agent).where(Agent.id == agent_id, Agent.user_id == owner_id)
    if not include_deleted:
        statement = statement.where(Agent.deleted_at.is_(None))
    if for_update:
        # Serialize PIN failure counters and rotations so concurrent attempts cannot bypass limits.
        statement = statement.with_for_update()
    return await session.scalar(statement)


async def pin_fingerprint_exists(
    session: AsyncSession,
    owner_id: str,
    fingerprint: str,
) -> bool:
    # Check all retained records so deleted agents do not permit reuse of their PINs.
    result = await session.scalar(
        select(Agent.id).where(
            Agent.user_id == owner_id,
            Agent.pin_fingerprint == fingerprint,
        )
    )
    return result is not None
