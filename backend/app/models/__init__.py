from app.models.base import Base
from app.models.user_profile import UserProfile

# Re-export model metadata and registered entities for application and migration imports.
__all__ = ["Base", "UserProfile"]

