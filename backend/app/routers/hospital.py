import json
from fastapi import APIRouter, Form, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.services.hospital_service import get_hospital_recommendations, get_single_hospital_detail
from app.services.db_service import save_hospital_recommendation, save_single_hospital_recommendation
from app.models.hospital import HospitalRecommendation, SingleHospitalRecommendation
from app.core.database import SessionLocal

router = APIRouter()

async def get_db():
    async with SessionLocal() as session:
        yield session

@router.post("/recommend")
async def fetch_hospital_recommendations(
    location: str = Form(...),
    doctor_type: str = Form(...),
    user_id: int = Form(...)
):
    try:
        llm_response_text = await get_hospital_recommendations(location, doctor_type)
        
        saved_rec = await save_hospital_recommendation(
            user_id=user_id,
            location=location,
            doctor_type=doctor_type,
            recommendation_response=llm_response_text
        )
        
        try:
            parsed_json = json.loads(llm_response_text)
            
            # Extract and save individual items
            if "recommendations" in parsed_json and isinstance(parsed_json["recommendations"], list):
                for single_item in parsed_json["recommendations"]:
                    item_id = single_item.get("id", 0)
                    h_name = single_item.get("hospital_name", "")
                    d_name = single_item.get("doctor_name", "")
                    rate = single_item.get("hospital_rating", "")
                    desc = single_item.get("description", "")
                    await save_single_hospital_recommendation(
                        recommendation_id=saved_rec.id,
                        llm_generated_id=item_id,
                        hospital_name=h_name,
                        doctor_name=d_name,
                        hospital_rating=rate,
                        description=desc
                    )
        except json.JSONDecodeError:
            parsed_json = {"recommendations": llm_response_text}
            
        return {
            "id": saved_rec.id,
            "location": location,
            "doctor_type": doctor_type,
            "data": parsed_json
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/recommendations/{recommendation_id}")
async def get_saved_recommendation(recommendation_id: int, db: AsyncSession = Depends(get_db)):
    recommendation = await db.get(HospitalRecommendation, recommendation_id)
    if not recommendation:
        raise HTTPException(status_code=404, detail="Recommendation not found")
        
    try:
        parsed_json = json.loads(recommendation.recommendation_response)
    except json.JSONDecodeError:
        parsed_json = {"recommendations": recommendation.recommendation_response}
        
    return {
        "id": recommendation.id,
        "location": recommendation.location,
        "doctor_type": recommendation.doctor_type,
        "data": parsed_json,
        "created_at": recommendation.created_at
    }

@router.post("/hospital-detail")
async def fetch_single_hospital_detail(
    recommendation_id: int = Form(...),
    single_recommendation_id: int = Form(...),
    db: AsyncSession = Depends(get_db)
):
    try:
        # 1. Fetch the parent recommendation to get the search context (location/doctor_type)
        parent_rec = await db.get(HospitalRecommendation, recommendation_id)
        if not parent_rec:
            raise HTTPException(status_code=404, detail="Parent recommendation not found")

        # 2. Fetch the specific single hospital item from the db
        stmt = select(SingleHospitalRecommendation).where(
            SingleHospitalRecommendation.recommendation_id == recommendation_id,
            SingleHospitalRecommendation.llm_generated_id == single_recommendation_id
        )
        result = await db.execute(stmt)
        single_rec = result.scalars().first()

        if not single_rec:
            raise HTTPException(status_code=404, detail="Single recommendation item not found")

        # 3. Request LLM for detail
        llm_detail = await get_single_hospital_detail(
            hospital_name=single_rec.hospital_name,
            doctor_name=single_rec.doctor_name,
            location=parent_rec.location,
            doctor_type=parent_rec.doctor_type
        )
        
        try:
            parsed_detail = json.loads(llm_detail)
        except json.JSONDecodeError:
            parsed_detail = {"detailed_description": llm_detail}

        return {
            "hospital_name": single_rec.hospital_name,
            "doctor_name": single_rec.doctor_name,
            "detail": parsed_detail
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

