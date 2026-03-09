
from app.core.database import SessionLocal
from app.models.summary import Summary

async def save_summary(
    user_id: int,
    user_prompt: str,
    summary_response: str,
    risk_response: str,
    next_step_response: str,
    ask_docter_response: str
):
    async with SessionLocal() as session:
        summary = Summary(
            user_id=user_id,
            user_prompt=user_prompt,
            summary_response=summary_response,
            risk_response=risk_response,
            next_step_response=next_step_response,
            ask_docter_response=ask_docter_response
        )
        session.add(summary)
        await session.commit()
        await session.refresh(summary)
        return summary
