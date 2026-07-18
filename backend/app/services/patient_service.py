import os
from dotenv import load_dotenv
from app.prompts.patient_prompt import build_patient_condition_prompt
from app.services.gemini_client import call_gemini

load_dotenv()

async def get_patient_condition_analysis(
    name: str, age: int, gender: str, state: str, city: str, suffering_problems: str, how_many_days: str
) -> str:
    prompt = build_patient_condition_prompt(name, age, gender, state, city, suffering_problems, how_many_days)
    return await call_gemini(prompt=prompt, json_mode=True)
