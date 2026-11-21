from datetime import datetime
from typing import Any

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Index, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class AgentConversationMessage(Base):
    __tablename__ = "agent_conversation_messages"
    __table_args__ = (
        CheckConstraint("role IN ('user', 'assistant')", name="conversation_role_valid"),
        CheckConstraint(
            "proposal_status IS NULL OR proposal_status IN ('pending', 'applied', 'dismissed')",
            name="conversation_proposal_status_valid",
        ),
        Index(
            "ix_agent_conversation_owner_agent_created",
            "user_id",
            "agent_id",
            "created_at",
        ),
        Index(
            "ix_agent_conversation_user_role_created",
            "user_id",
            "role",
            "created_at",
        ),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    user_id: Mapped[str] = mapped_column(String(255), nullable=False)
    agent_id: Mapped[str] = mapped_column(
        ForeignKey("agents.id", ondelete="RESTRICT"),
        nullable=False,
    )
    role: Mapped[str] = mapped_column(String(16), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    proposal: Mapped[dict[str, Any] | None] = mapped_column(JSON, nullable=True)
    proposal_status: Mapped[str | None] = mapped_column(String(16), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
