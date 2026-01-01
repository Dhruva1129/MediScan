from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from app.services.groq_service import summarize_image_with_prompt
from app.services.db_service import save_summary

router = APIRouter()

@router.post("/summarize-image/")
async def summarize_image(
    image: UploadFile = File(...),
    prompt: str = Form("")
):
    try:
        summary = await summarize_image_with_prompt(image, prompt)
        await save_summary(prompt, summary)
        return {"summary": summary}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
