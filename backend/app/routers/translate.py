from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import SessionLocal
from app.models.summary import Summary
from app.services.translate_service import translate_all_fields

router = APIRouter()


async def get_db():
    async with SessionLocal() as session:
        yield session


class TranslateRequest(BaseModel):
    summary_id: int
    user_id: int
    language: str


@router.post("/translate/")
async def translate_summary(
    body: TranslateRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Translate all summary fields for a given summary ID into the requested language.

    Body:
        summary_id  - ID of the row in the summaries table
        user_id     - ID of the requesting user (ownership check)
        language    - Target language (e.g. "Hindi", "French", "Spanish")

    Returns:
        summary_response, risk_response, next_step_response, ask_docter_response
        — all translated, matching the original summary response structure.
    """
    summary = await db.get(Summary, body.summary_id)
    if not summary:
        raise HTTPException(status_code=404, detail="Summary not found")

    if summary.user_id != body.user_id:
        raise HTTPException(status_code=403, detail="Access denied")

    if not summary.summary_response:
        raise HTTPException(status_code=400, detail="Summary response is empty")

    try:
        translated = await translate_all_fields(
            summary_response=summary.summary_response,
            risk_response=summary.risk_response or "",
            next_step_response=summary.next_step_response or "",
            ask_docter_response=summary.ask_docter_response or "",
            language=body.language,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Translation failed: {str(e)}")

    return {
        **translated,
        "language": body.language,
        "summary_id": body.summary_id,
    }
