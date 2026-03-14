import os
import aiohttp
from dotenv import load_dotenv
from app.prompts.patient_prompt import build_patient_condition_prompt

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_API_URL = os.getenv("GROQ_API_URL")
MODEL = os.getenv("GROQ_MODEL")

async def get_patient_condition_analysis(
    name: str, age: int, gender: str, state: str, city: str, suffering_problems: str, how_many_days: str
) -> str:
    prompt = build_patient_condition_prompt(name, age, gender, state, city, suffering_problems, how_many_days)
    
    payload = {
        "model": MODEL,
        "response_format": {"type": "json_object"},
        "messages": [
            {
                "role": "user",
                "content": prompt
            }
        ]
    }

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    
    async with aiohttp.ClientSession() as session:
        async with session.post(GROQ_API_URL, headers=headers, json=payload) as resp:
            if resp.status != 200:
                error_text = await resp.text()
                raise Exception(f"Groq API error: {resp.status} {error_text}")
            result = await resp.json()
            return result["choices"][0]["message"]["content"]
