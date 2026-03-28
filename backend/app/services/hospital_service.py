import os
import aiohttp
import json
from dotenv import load_dotenv
from app.prompts.hospital_prompt import build_hospital_recommendation_prompt

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_API_URL = os.getenv("GROQ_API_URL")
MODEL = os.getenv("GROQ_MODEL")

async def get_hospital_recommendations(location: str, doctor_type: str) -> str:
    prompt = build_hospital_recommendation_prompt(location, doctor_type)
    
    payload = {
        "model": MODEL,
        "response_format": {"type": "json_object"},
        "max_tokens": 4096,
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

from app.prompts.hospital_prompt import build_single_hospital_detail_prompt

async def get_single_hospital_detail(hospital_name: str, doctor_name: str, location: str, doctor_type: str) -> str:
    prompt = build_single_hospital_detail_prompt(hospital_name, doctor_name, location, doctor_type)
    
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

