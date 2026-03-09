
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.summary import Summary
from app.core.database import SessionLocal
from typing import List
from sqlalchemy import delete

router = APIRouter()

async def get_db():
    async with SessionLocal() as session:
        yield session

# Delete a summary by id
@router.delete("/user-summaries/{summary_id}")
async def delete_summary(summary_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        Summary.__table__.select().where(Summary.id == summary_id)
    )
    row = result.first()
    if not row:
        raise HTTPException(status_code=404, detail="Summary not found")
    await db.execute(delete(Summary).where(Summary.id == summary_id))
    await db.commit()
    return {"detail": "Summary deleted successfully"}

@router.get("/user-summaries/{user_id}")
async def get_user_summaries(user_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        Summary.__table__.select().where(Summary.user_id == user_id)
    )
    rows = result.fetchall()
    if not rows:
        return []
    summaries = []
    for row in rows:
        data = dict(row._mapping)
        summary_text = data.get("summary_response") or ""
        # Generate title from first 10 words of summary_response
        words = summary_text.split()
        title = " ".join(words[:10]) + ("..." if len(words) > 10 else "")
        data["title"] = title
        # Format created_at to only date (YYYY-MM-DD)
        created_at = data.get("created_at")
        if created_at:
            if hasattr(created_at, 'strftime'):
                data["created_at"] = created_at.strftime("%Y-%m-%d")
            else:
                # If it's a string, slice to first 10 chars
                data["created_at"] = str(created_at)[:10]
        summaries.append(data)
    return summaries
