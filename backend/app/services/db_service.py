from app.core.database import SessionLocal
from app.models.summary import Summary

async def save_summary(user_prompt: str, summary_response: str):
    async with SessionLocal() as session:
        summary = Summary(user_prompt=user_prompt, summary_response=summary_response)
        session.add(summary)
        await session.commit()
        await session.refresh(summary)
        return summary
