from fastapi import APIRouter, Form, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.services.groq_followup_service import groq_followup
from app.core.database import SessionLocal
from app.models.summary import Followup

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/followup/")
async def followup_summary(
    summary_id: int = Form(...),
    user_text: str = Form(...),
    user_id: int = Form(...),
    session_id: str | None = Form(None)
):
    try:
        response = await groq_followup(summary_id, user_text, user_id, session_id)
        return {"groq_response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/followups/{summary_id}")
async def get_followups(summary_id: int):
    try:
        async with SessionLocal() as db:
            stmt = select(Followup).where(Followup.summary_id == summary_id).order_by(Followup.created_at.asc())
            result = await db.execute(stmt)
            followups = result.scalars().all()
            
            return [
                {
                    "id": f.id,
                    "session_id": f.session_id,
                    "user_text": f.user_text,
                    "followup_response": f.followup_response,
                    "created_at": f.created_at.isoformat() if f.created_at else None
                }
                for f in followups
            ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
