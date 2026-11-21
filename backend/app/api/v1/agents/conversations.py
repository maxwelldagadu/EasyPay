from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.agents.conversation_service import (
    apply_configuration_proposal,
    create_conversation_turn,
    dismiss_configuration_proposal,
    list_conversation_messages,
)
from app.authentication.dependencies import CurrentSession
from app.database.session import get_db
from app.schemas.conversation import (
    ConversationMessageCreate,
    ConversationMessageRead,
    ConversationTurnRead,
)

router = APIRouter(prefix="/agents/{agent_id}/conversation", tags=["agent conversations"])
DatabaseSession = Annotated[AsyncSession, Depends(get_db)]


@router.get("", response_model=list[ConversationMessageRead])
async def read_agent_conversation(
    agent_id: str,
    current_session: CurrentSession,
    database: DatabaseSession,
) -> list[ConversationMessageRead]:
    # Keep chat history private to the authenticated owner and requested agent.
    messages = await list_conversation_messages(
        database,
        current_session.user.id,
        agent_id,
    )
    return [ConversationMessageRead.model_validate(message) for message in messages]


@router.post("", response_model=ConversationTurnRead)
async def send_agent_message(
    agent_id: str,
    request: ConversationMessageCreate,
    current_session: CurrentSession,
    database: DatabaseSession,
) -> ConversationTurnRead:
    # Validate the user message, interpret it without tools, and persist the structured response.
    user_message, assistant_message = await create_conversation_turn(
        database,
        current_session.user.id,
        agent_id,
        request,
    )
    return ConversationTurnRead(
        user_message=ConversationMessageRead.model_validate(user_message),
        assistant_message=ConversationMessageRead.model_validate(assistant_message),
    )


@router.post("/{message_id}/apply", response_model=ConversationMessageRead)
async def apply_agent_configuration_proposal(
    agent_id: str,
    message_id: str,
    current_session: CurrentSession,
    database: DatabaseSession,
) -> ConversationMessageRead:
    # Apply only an owner-scoped pending configuration proposal after explicit confirmation.
    message = await apply_configuration_proposal(
        database,
        current_session.user.id,
        agent_id,
        message_id,
    )
    return ConversationMessageRead.model_validate(message)


@router.post("/{message_id}/dismiss", response_model=ConversationMessageRead)
async def dismiss_agent_configuration_proposal(
    agent_id: str,
    message_id: str,
    current_session: CurrentSession,
    database: DatabaseSession,
) -> ConversationMessageRead:
    # Persist the user's dismissal so the same proposal cannot be approved later.
    message = await dismiss_configuration_proposal(
        database,
        current_session.user.id,
        agent_id,
        message_id,
    )
    return ConversationMessageRead.model_validate(message)
