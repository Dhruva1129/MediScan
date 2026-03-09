import json
from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import SessionLocal
from app.models.summary import Summary, GraphicsReport
from app.services.graphics_service import generate_graphics_data

router = APIRouter()


async def get_db():
    async with SessionLocal() as session:
        yield session


class GraphicsRequest(BaseModel):
    summary_id: int
    user_id: int
    patient_name: str
    patient_age: int
    patient_weight: int = 0
    patient_gender: str


@router.post("/generate-graphics/")
async def generate_graphics(
    body: GraphicsRequest,
    db: AsyncSession = Depends(get_db),
):
    """Generate graphical chart data from a medical report."""

    # Fetch summary
    summary = await db.get(Summary, body.summary_id)
    if not summary:
        raise HTTPException(status_code=404, detail="Summary not found")
    if summary.user_id != body.user_id:
        raise HTTPException(status_code=403, detail="Access denied")

    try:
        chart_data = await generate_graphics_data(
            patient_name=body.patient_name,
            patient_age=body.patient_age,
            patient_weight=body.patient_weight,
            patient_gender=body.patient_gender,
            summary_response=summary.summary_response or "",
            risk_response=summary.risk_response or "",
            next_step_response=summary.next_step_response or "",
            ask_docter_response=summary.ask_docter_response or "",
        )
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Failed to parse chart data from AI")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Graphics generation failed: {str(e)}")

    # Save to DB
    record = GraphicsReport(
        summary_id=body.summary_id,
        user_id=body.user_id,
        patient_name=body.patient_name,
        patient_age=body.patient_age,
        patient_weight=body.patient_weight,
        patient_gender=body.patient_gender,
        chart_data=json.dumps(chart_data),
    )
    db.add(record)
    await db.commit()
    await db.refresh(record)

    return {
        "id": record.id,
        "chart_data": chart_data,
        "summary_id": body.summary_id,
    }


@router.get("/graphics/{graphics_id}")
async def get_graphics(graphics_id: int, db: AsyncSession = Depends(get_db)):
    """Fetch a saved graphics report."""
    record = await db.get(GraphicsReport, graphics_id)
    if not record:
        raise HTTPException(status_code=404, detail="Graphics report not found")
    return {
        "id": record.id,
        "summary_id": record.summary_id,
        "patient_name": record.patient_name,
        "patient_age": record.patient_age,
        "patient_weight": record.patient_weight,
        "patient_gender": record.patient_gender,
        "chart_data": json.loads(record.chart_data),
        "created_at": record.created_at,
    }


@router.get("/graphics-by-summary")
async def list_graphics_for_summary(
    summary_id: int = Query(...),
    user_id: int = Query(...),
    db: AsyncSession = Depends(get_db),
):
    """List all graphics reports for a summary belonging to a user."""
    stmt = (
        select(GraphicsReport)
        .where(GraphicsReport.summary_id == summary_id, GraphicsReport.user_id == user_id)
        .order_by(GraphicsReport.created_at.desc())
    )
    result = await db.execute(stmt)
    records = result.scalars().all()

    return [
        {
            "id": r.id,
            "patient_name": r.patient_name,
            "patient_age": r.patient_age,
            "patient_weight": r.patient_weight,
            "patient_gender": r.patient_gender,
            "health_score": json.loads(r.chart_data).get("health_score"),
            "risk_level": json.loads(r.chart_data).get("risk_level"),
            "created_at": r.created_at,
        }
        for r in records
    ]
