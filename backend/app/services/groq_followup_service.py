import os
import asyncio
import aiohttp
import json
from sqlalchemy import select
from app.core.database import SessionLocal
from app.models.summary import Summary, Followup
from app.services.gemini_client import GEMINI_API_KEY, GEMINI_MODEL

async def get_all_summary_responses_by_id(summary_id: int):
    async with SessionLocal() as session:
        result = await session.get(Summary, summary_id)
        if result:
            return {
                "summary_response": result.summary_response,
                "risk_response": result.risk_response,
                "next_step_response": result.next_step_response,
                "ask_docter_response": result.ask_docter_response
            }
        return None

async def groq_followup(summary_id: int, user_text: str, user_id: int, session_id: str = None):
    responses = await get_all_summary_responses_by_id(summary_id)
    if not responses:
        raise ValueError("Summary not found for the given id.")

    # 1. Base system prompt with medical report context
    system_prompt = (
        "You are a helpful medical assistant. You are answering the user's questions based on their medical report analysis below.\n\n"
        f"Summary: {responses['summary_response']}\n"
        f"Risk: {responses['risk_response']}\n"
        f"Next Steps: {responses['next_step_response']}\n"
        f"Ask Doctor: {responses['ask_docter_response']}\n"
    )
    
    contents_payload = []

    # 2. Add chat history if session_id is provided
    if session_id:
        async with SessionLocal() as db_session:
            stmt = select(Followup).where(Followup.session_id == session_id).order_by(Followup.created_at.asc())
            result = await db_session.execute(stmt)
            history = result.scalars().all()
            for h in history:
                contents_payload.append({
                    "role": "user",
                    "parts": [{"text": h.user_text}]
                })
                # Gemini roles for assistant turn must be "model"
                contents_payload.append({
                    "role": "model",
                    "parts": [{"text": h.followup_response}]
                })

    # 3. Add current user message
    contents_payload.append({
        "role": "user",
        "parts": [{"text": user_text}]
    })

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}"
    payload = {
        "contents": contents_payload,
        "systemInstruction": {
            "parts": [{"text": system_prompt}]
        }
    }
    headers = {
        "Content-Type": "application/json"
    }

    max_retries = 5
    retry_delay = 1.0
    followup_response = ""

    for attempt in range(max_retries):
        async with aiohttp.ClientSession() as session:
            async with session.post(url, headers=headers, json=payload) as resp:
                if resp.status == 200:
                    result = await resp.json()
                    try:
                        followup_response = result["candidates"][0]["content"]["parts"][0]["text"]
                        break
                    except (KeyError, IndexError) as e:
                        raise Exception(f"Failed to parse Gemini response: {e}. Raw response: {result}")
                
                elif resp.status in (429, 413):
                    print(f"Gemini API rate limit hit ({resp.status}). Waiting for {retry_delay:.2f}s before retry (attempt {attempt+1}/{max_retries})...")
                    await asyncio.sleep(retry_delay)
                    retry_delay *= 2
                else:
                    err_text = await resp.text()
                    raise Exception(f"Gemini API error: {resp.status} {err_text}")
    else:
        raise Exception("Gemini API rate limit exceeded after maximum retries.")

    # 4. Save followup response in DB
    async with SessionLocal() as db_session:
        followup = Followup(
            summary_id=summary_id, 
            user_id=user_id, 
            session_id=session_id, 
            user_text=user_text, 
            followup_response=followup_response
        )
        db_session.add(followup)
        await db_session.commit()
        await db_session.refresh(followup)

    return followup_response
