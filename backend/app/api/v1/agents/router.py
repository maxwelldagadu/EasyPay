from typing import Annotated

from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.agents.service import (
    change_agent_pin,
    create_agent,
    delete_agent,
    get_agent,
    list_agents,
    set_agent_status,
    update_agent,
)
from app.authentication.dependencies import CurrentSession
from app.database.session import get_db
from app.schemas.agents import (
    AgentCreate,
    AgentPinChange,
    AgentRead,
    AgentStatusUpdate,
    AgentUpdate,
)

# Keep agent endpoints under one feature router so their API contract remains easy to extend.
router = APIRouter(prefix="/agents", tags=["agents"])
DatabaseSession = Annotated[AsyncSession, Depends(get_db)]


@router.get("", response_model=list[AgentRead])
async def list_user_agents(
    current_session: CurrentSession,
    database: DatabaseSession,
) -> list[AgentRead]:
    # Scope the collection to the Better Auth user validated by the session dependency.
    return await list_agents(database, current_session.user.id)


@router.post("", response_model=AgentRead, status_code=status.HTTP_201_CREATED)
async def create_user_agent(
    request: AgentCreate,
    current_session: CurrentSession,
    database: DatabaseSession,
) -> AgentRead:
    # Validate and persist a new owner-bound agent while the PIN remains write-only.
    return await create_agent(database, current_session.user.id, request)


@router.get("/{agent_id}", response_model=AgentRead)
async def get_user_agent(
    agent_id: str,
    current_session: CurrentSession,
    database: DatabaseSession,
) -> AgentRead:
    # Prevent callers from retrieving an agent unless it belongs to their verified identity.
    return await get_agent(database, current_session.user.id, agent_id)


@router.patch("/{agent_id}", response_model=AgentRead)
async def update_user_agent(
    agent_id: str,
    request: AgentUpdate,
    current_session: CurrentSession,
    database: DatabaseSession,
) -> AgentRead:
    # Apply only validated editable settings and keep ownership and PIN fields immutable here.
    return await update_agent(database, current_session.user.id, agent_id, request)


@router.patch("/{agent_id}/status", response_model=AgentRead)
async def update_user_agent_status(
    agent_id: str,
    request: AgentStatusUpdate,
    current_session: CurrentSession,
    database: DatabaseSession,
) -> AgentRead:
    # Pause or reactivate only the authenticated user's live agent.
    return await set_agent_status(
        database,
        current_session.user.id,
        agent_id,
        request.is_active,
    )


@router.post("/{agent_id}/pin", response_model=AgentRead)
async def change_user_agent_pin(
    agent_id: str,
    request: AgentPinChange,
    current_session: CurrentSession,
    database: DatabaseSession,
) -> AgentRead:
    # Require the old agent PIN in the domain service before rotating its credential hash.
    return await change_agent_pin(database, current_session.user.id, agent_id, request)


@router.delete("/{agent_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user_agent(
    agent_id: str,
    current_session: CurrentSession,
    database: DatabaseSession,
) -> Response:
    # Retire an agent without deleting the row needed by future historical records.
    await delete_agent(database, current_session.user.id, agent_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
