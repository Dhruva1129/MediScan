import os
from dotenv import load_dotenv
from app.prompts.hospital_prompt import build_hospital_recommendation_prompt, build_single_hospital_detail_prompt
from app.services.gemini_client import call_gemini

load_dotenv()

async def get_hospital_recommendations(location: str, doctor_type: str) -> str:
    prompt = build_hospital_recommendation_prompt(location, doctor_type)
    return await call_gemini(prompt=prompt, json_mode=True)

async def get_single_hospital_detail(hospital_name: str, doctor_name: str, location: str, doctor_type: str) -> str:
    prompt = build_single_hospital_detail_prompt(hospital_name, doctor_name, location, doctor_type)
    return await call_gemini(prompt=prompt, json_mode=True)
