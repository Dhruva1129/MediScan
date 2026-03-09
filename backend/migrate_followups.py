import asyncio
from app.core.database import SessionLocal
from sqlalchemy import text

async def add_column():
    async with SessionLocal() as db:
        try:
            # Check if column exists first to be safe
            await db.execute(text("SELECT session_id FROM followups LIMIT 1"))
            print("Column 'session_id' already exists.")
        except Exception:
            # Column doesn't exist, so add it
            await db.rollback()
            try:
                await db.execute(text("ALTER TABLE followups ADD COLUMN session_id VARCHAR(36)"))
                await db.execute(text("CREATE INDEX ix_followups_session_id ON followups (session_id)"))
                await db.commit()
                print("Successfully added 'session_id' column to 'followups' table.")
            except Exception as e:
                print(f"Failed to alter table: {e}")
                await db.rollback()

if __name__ == "__main__":
    asyncio.run(add_column())
