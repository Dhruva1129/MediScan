import os
import asyncio
import aiohttp
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_API_URL = os.getenv("GROQ_API_URL")
TEXT_MODEL = os.getenv("GROQ_TEXT_MODEL", os.getenv("GROQ_MODEL", "llama3-8b-8192"))


async def _call_groq(session: aiohttp.ClientSession, text: str, language: str) -> str:
    """Single Groq LLM call to translate one field."""
    prompt = (
        f"You are a professional medical translator. "
        f"Translate the following medical report text into {language}. "
        f"Preserve all medical terms accurately. "
        f"Keep the same formatting (bold markers like **word**, bullet points, newlines, etc.). "
        f"Only return the translated text — no explanations, no preamble.\n\n"
        f"{text}"
    )

    payload = {
        "model": TEXT_MODEL,
        "messages": [{"role": "user", "content": prompt}]
    }
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    async with session.post(GROQ_API_URL, headers=headers, json=payload) as resp:
        if resp.status != 200:
            raise Exception(f"Groq API error: {resp.status} {await resp.text()}")
        result = await resp.json()
        return result["choices"][0]["message"]["content"]


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
    async with aiohttp.ClientSession() as session:
        results = await asyncio.gather(
            _call_groq(session, summary_response or "", language),
            _call_groq(session, risk_response or "", language),
            _call_groq(session, next_step_response or "", language),
            _call_groq(session, ask_docter_response or "", language),
        )

    return {
        "summary_response":    results[0],
        "risk_response":       results[1],
        "next_step_response":  results[2],
        "ask_docter_response": results[3],
    }
