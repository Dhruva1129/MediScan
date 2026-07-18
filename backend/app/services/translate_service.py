import os
import asyncio
from dotenv import load_dotenv
from app.services.gemini_client import call_gemini

load_dotenv()

async def _call_gemini(text: str, language: str) -> str:
    """Single Gemini LLM call to translate one field."""
    if not text.strip():
        return ""
    prompt = (
        f"You are a professional medical translator. "
        f"Translate the following medical report text into {language}. "
        f"Preserve all medical terms accurately. "
        f"Keep the same formatting (bold markers like **word**, bullet points, newlines, etc.). "
        f"Only return the translated text — no explanations, no preamble.\n\n"
        f"{text}"
    )
    return await call_gemini(prompt=prompt)

async def translate_all_fields(
    summary_response: str,
    risk_response: str,
    next_step_response: str,
    ask_docter_response: str,
    language: str
) -> dict:
    """
    Translate all 4 summary fields concurrently and return them as separate keys,
    mirroring the original summary response structure.
    """
    results = await asyncio.gather(
        _call_gemini(summary_response or "", language),
        _call_gemini(risk_response or "", language),
        _call_gemini(next_step_response or "", language),
        _call_gemini(ask_docter_response or "", language),
    )

    return {
        "summary_response":    results[0],
        "risk_response":       results[1],
        "next_step_response":  results[2],
        "ask_docter_response": results[3],
    }
