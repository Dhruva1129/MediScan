import os
from dotenv import load_dotenv
import aiohttp
from app.core.database import SessionLocal
from app.models.summary import Summary, Followup

load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_API_URL = os.getenv("GROQ_API_URL")
MODEL = os.getenv("GROQ_MODEL")


from sqlalchemy import select

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
    
    messages_payload = [
        {"role": "system", "content": system_prompt}
    ]

    # 2. Add chat history if session_id is provided
    if session_id:
        async with SessionLocal() as db_session:
            stmt = select(Followup).where(Followup.session_id == session_id).order_by(Followup.created_at.asc())
            result = await db_session.execute(stmt)
            history = result.scalars().all()
            for h in history:
                messages_payload.append({"role": "user", "content": h.user_text})
                messages_payload.append({"role": "assistant", "content": h.followup_response})

    # 3. Add current user message
    messages_payload.append({"role": "user", "content": user_text})

    payload = {
        "model": MODEL,
        "messages": messages_payload
    }
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    async with aiohttp.ClientSession() as session:
        async with session.post(GROQ_API_URL, headers=headers, json=payload) as resp:
            if resp.status != 200:
                raise Exception(f"Groq API error: {resp.status} {await resp.text()}")
            result = await resp.json()
            followup_response = result["choices"][0]["message"]["content"]

    # 4. Save followup response in DB
    async with SessionLocal() as db_session:
        followup = Followup(summary_id=summary_id, user_id=user_id, session_id=session_id, user_text=user_text, followup_response=followup_response)
        db_session.add(followup)
        await db_session.commit()
        await db_session.refresh(followup)

    return followup_response
