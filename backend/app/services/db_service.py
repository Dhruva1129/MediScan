
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

from app.models.hospital import HospitalRecommendation

async def save_hospital_recommendation(
    user_id: int,
    location: str,
    doctor_type: str,
    recommendation_response: str
):
    async with SessionLocal() as session:
        recommendation = HospitalRecommendation(
            user_id=user_id,
            location=location,
            doctor_type=doctor_type,
            recommendation_response=recommendation_response
        )
        session.add(recommendation)
        await session.commit()
        await session.refresh(recommendation)
        return recommendation

from app.models.hospital import SingleHospitalRecommendation

async def save_single_hospital_recommendation(
    recommendation_id: int,
    llm_generated_id: int,
    hospital_name: str,
    doctor_name: str,
    hospital_rating: str,
    description: str
):
    async with SessionLocal() as session:
        single_rec = SingleHospitalRecommendation(
            recommendation_id=recommendation_id,
            llm_generated_id=llm_generated_id,
            hospital_name=hospital_name,
            doctor_name=doctor_name,
            hospital_rating=hospital_rating,
            description=description
        )
        session.add(single_rec)
        await session.commit()
        await session.refresh(single_rec)
        return single_rec

from app.models.patient import PatientCondition

async def save_patient_condition(
    user_id: int,
    name: str,
    age: int,
    gender: str,
    state: str,
    city: str,
    suffering_problems: str,
    how_many_days: str,
    analysis_response: str
):
    async with SessionLocal() as session:
        condition = PatientCondition(
            user_id=user_id,
            name=name,
            age=age,
            gender=gender,
            state=state,
            city=city,
            suffering_problems=suffering_problems,
            how_many_days=how_many_days,
            analysis_response=analysis_response
        )
        session.add(condition)
        await session.commit()
        await session.refresh(condition)
        return condition

from sqlalchemy import select, delete

async def get_all_patient_conditions(user_id: int):
    async with SessionLocal() as session:
        result = await session.execute(
            select(PatientCondition)
            .where(PatientCondition.user_id == user_id)
            .order_by(PatientCondition.id.desc())
        )
        conditions = result.scalars().all()
        return conditions

async def delete_patient_condition(condition_id: int):
    async with SessionLocal() as session:
        await session.execute(
            delete(PatientCondition).where(PatientCondition.id == condition_id)
        )
        await session.commit()
        return True
