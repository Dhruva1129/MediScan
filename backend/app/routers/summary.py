from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse

from app.services.groq_service import summarize_image_with_all_prompts
from app.services.db_service import save_summary
from app.models.summary import Summary
from app.core.database import SessionLocal
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession


router = APIRouter()

async def get_db():
    async with SessionLocal() as session:
        yield session
@router.get("/summary-response/{summary_id}")
async def get_summary_response(summary_id: int, db: AsyncSession = Depends(get_db)):
    summary = await db.get(Summary, summary_id)
    if not summary:
        raise HTTPException(status_code=404, detail="Summary not found")
    return {"summary_response": summary.summary_response}

@router.get("/risk-response/{summary_id}")
async def get_risk_response(summary_id: int, db: AsyncSession = Depends(get_db)):
    summary = await db.get(Summary, summary_id)
    if not summary:
        raise HTTPException(status_code=404, detail="Summary not found")
    return {"risk_response": summary.risk_response}

@router.get("/next-step-response/{summary_id}")
async def get_next_step_response(summary_id: int, db: AsyncSession = Depends(get_db)):
    summary = await db.get(Summary, summary_id)
    if not summary:
        raise HTTPException(status_code=404, detail="Summary not found")
    return {"next_step_response": summary.next_step_response}

@router.get("/ask-docter-response/{summary_id}")
async def get_ask_docter_response(summary_id: int, db: AsyncSession = Depends(get_db)):
    summary = await db.get(Summary, summary_id)
    if not summary:
        raise HTTPException(status_code=404, detail="Summary not found")
    return {"ask_docter_response": summary.ask_docter_response}

@router.post("/summarize-image/")
async def summarize_image(
    image: UploadFile = File(...),
    prompt: str = Form(""),
    user_id: int = Form(...)
):
    try:
        responses = await summarize_image_with_all_prompts(image, prompt)
        summary = await save_summary(
            user_id,
            responses["user_prompt"],
            responses["summary_response"],
            responses["risk_response"],
            responses["next_step_response"],
            responses["ask_docter_response"]
        )
        # Add summary_id to response
        responses["summary_id"] = summary.id
        return responses
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
