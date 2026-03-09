import asyncio

from app.core.database import engine, Base
from app.models import summary  # Ensure Summary model is registered
from app.models import user  # Ensure User model is registered


async def init_db():
    async with engine.begin() as conn:
        # Drop all tables (DANGER: deletes all data!)
        await conn.run_sync(Base.metadata.drop_all)
        # Recreate all tables
        await conn.run_sync(Base.metadata.create_all)

if __name__ == "__main__":
    asyncio.run(init_db())
