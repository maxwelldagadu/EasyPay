from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import settings


# Keep an async engine shared by requests so connections can be pooled and checked before reuse.
engine = create_async_engine(
    settings.database_url,
    pool_pre_ping=True,
    # Supabase transaction poolers can reuse server connections; disable asyncpg's named statement cache.
    connect_args={"statement_cache_size": 0},
)
SessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    # Scope each unit-of-work session to its caller and always close it after the request.
    async with SessionLocal() as session:
        yield session


async def dispose_database() -> None:
    # Dispose the shared connection pool cleanly when the application lifecycle ends.
    await engine.dispose()

