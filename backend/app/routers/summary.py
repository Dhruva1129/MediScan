from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
import uuid
from typing import Optional

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
@router.get("/summary-details/{summary_id}")
async def get_summary_details(summary_id: int, db: AsyncSession = Depends(get_db)):
    summary = await db.get(Summary, summary_id)
    if not summary:
        raise HTTPException(status_code=404, detail="Summary not found")
    return {
        "summary_response": summary.summary_response,
        "risk_response": summary.risk_response,
        "next_step_response": summary.next_step_response,
        "ask_docter_response": summary.ask_docter_response
    }

@router.post("/upload-report/")
async def upload_report(
    image: UploadFile = File(...),
    user_id: int = Form(...)
):
    """Step 1: Upload a PDF report — extracts text and returns it. Stateless, no DB inserts, no LLM calls."""
    try:
        session_id = str(uuid.uuid4())
        img_bytes = await image.read()
        pdf_text = ""

        if image.filename.lower().endswith(".pdf") or image.content_type == "application/pdf":
            from app.services.rag_service import extract_text_from_pdf
            # Extract text and cap it at 30,000 characters to prevent excessive payloads
            pdf_text = extract_text_from_pdf(img_bytes)[:30000]

        return {
            "session_id": session_id,
            "filename": image.filename,
            "content_type": image.content_type,
            "pdf_text": pdf_text,
            "status": "uploaded"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analyze-report/")
async def analyze_report(
    prompt: str = Form(""),
    user_id: int = Form(...),
    session_id: str = Form(...),
    pdf_text: str = Form("")
):
    """Step 2: Analyze a previously uploaded report — uses the provided text context, sends to LLM, returns analysis."""
    try:
        from app.services.groq_service import summarize_pdf_text_directly

        if not pdf_text:
            raise HTTPException(status_code=400, detail="No pdf_text provided for analysis.")

        # Summarize using the provided text context
        responses = await summarize_pdf_text_directly(pdf_text, prompt)

        responses["session_id"] = session_id
        summary = await save_summary(
            user_id,
            responses["user_prompt"],
            responses["summary_response"],
            responses["risk_response"],
            responses["next_step_response"],
            responses["ask_docter_response"]
        )
        responses["summary_id"] = summary.id
        return responses
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/summarize-image/")
async def summarize_image(
    image: UploadFile = File(...),
    prompt: str = Form(""),
    user_id: int = Form(...),
    session_id: Optional[str] = Form(None)
):
    """Single-step flow for image uploads (non-PDF). PDFs should use /upload-report/ + /analyze-report/ instead."""
    try:
        if not session_id:
            session_id = str(uuid.uuid4())

        if image.filename.lower().endswith(".pdf") or image.content_type == "application/pdf":
            from app.services.rag_service import extract_text_from_pdf
            from app.services.groq_service import summarize_pdf_text_directly
            img_bytes = await image.read()
            pdf_text = extract_text_from_pdf(img_bytes)
            responses = await summarize_pdf_text_directly(pdf_text, prompt)
        else:
            responses = await summarize_image_with_all_prompts(image, prompt)
            
        responses["session_id"] = session_id
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

