import json
from fastapi import APIRouter, Form, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.patient_service import get_patient_condition_analysis
from app.services.db_service import save_patient_condition, get_all_patient_conditions, delete_patient_condition
from app.core.database import SessionLocal

router = APIRouter()

async def get_db():
    async with SessionLocal() as session:
        yield session

@router.post("/patient-analyze")
async def analyze_patient_condition(
    name: str = Form(...),
    age: int = Form(...),
    gender: str = Form(...),
    state: str = Form(...),
    city: str = Form(...),
    suffering_problems: str = Form(...),
    how_many_days: str = Form(...),
    user_id: int = Form(...)
):
    try:
        # 1. Fetch LLM response
        llm_response_text = await get_patient_condition_analysis(
            name=name,
            age=age,
            gender=gender,
            state=state,
            city=city,
            suffering_problems=suffering_problems,
            how_many_days=how_many_days
        )
        
        # 2. Save Patient condition request and LLM response to DB
        saved_record = await save_patient_condition(
            user_id=user_id,
            name=name,
            age=age,
            gender=gender,
            state=state,
            city=city,
            suffering_problems=suffering_problems,
            how_many_days=how_many_days,
            analysis_response=llm_response_text
        )
        
        # 3. Parse JSON or fallback
        try:
            parsed_analysis = json.loads(llm_response_text)
        except json.JSONDecodeError:
            parsed_analysis = {
                "description": llm_response_text,
                "recommended_doctor_type": "Specialist Consultation Advised"
            }
            
        return {
            "id": saved_record.id,
            "patient_info": {
                "name": name,
                "age": age,
                "gender": gender,
                "location": f"{city}, {state}",
                "symptoms": suffering_problems,
                "duration": how_many_days
            },
            "analysis": parsed_analysis
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history/{user_id}")
async def get_patient_history(user_id: int):
    try:
        conditions = await get_all_patient_conditions(user_id)
        history = []
        for c in conditions:
            try:
                parsed_analysis = json.loads(c.analysis_response)
            except json.JSONDecodeError:
                parsed_analysis = {
                    "description": c.analysis_response,
                    "recommended_doctor_type": "Specialist Consultation Advised"
                }
            
            history.append({
                "id": c.id,
                "created_at": c.created_at.strftime("%B %d, %Y") if hasattr(c, 'created_at') and c.created_at else "Unknown Date",
                "patient_info": {
                    "name": c.name,
                    "age": c.age,
                    "gender": c.gender,
                    "location": f"{c.city}, {c.state}",
                    "symptoms": c.suffering_problems,
                    "duration": c.how_many_days
                },
                "analysis": parsed_analysis
            })
            
        return history
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/history/{condition_id}")
async def delete_history_item(condition_id: int):
    try:
        await delete_patient_condition(condition_id)
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
