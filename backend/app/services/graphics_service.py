import os
import json
import aiohttp
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_API_URL = os.getenv("GROQ_API_URL")
TEXT_MODEL = os.getenv("GROQ_TEXT_MODEL", os.getenv("GROQ_MODEL", "llama3-8b-8192"))


GRAPHICS_PROMPT_TEMPLATE = """
You are a medical data visualization expert. Based on the patient details and medical report provided below, generate structured chart data as strict JSON. Do NOT include any text outside the JSON object.

PATIENT DETAILS:
Name: {name}
Age: {age}
Weight: {weight} kg
Gender: {gender}

MEDICAL REPORT:
Summary: {summary}
Risk Analysis: {risk}
Next Steps: {next_steps}
Questions for Doctor: {ask_doctor}

Generate a JSON object with EXACTLY this structure (no markdown, no extra text):
{{
  "health_score": <number 0-100 representing overall health based on this report>,
  "risk_level": "<low|moderate|high>",
  "patient_summary": "<1 sentence about the patient and their condition>",
  "categories": [
    {{ "name": "<category like Blood Health, Cardiac, Immunity, etc.>", "score": <0-100>, "status": "<normal|warning|critical>" }}
  ],
  "risk_breakdown": [
    {{ "label": "<risk factor>", "value": <percentage 0-100>, "color": "<hex color>" }}
  ],
  "metrics": [
    {{ "name": "<metric name>", "value": "<value>", "unit": "<unit>", "status": "<normal|warning|critical>", "normal_range": "<range string>" }}
  ],
  "recommendations": [
    "<actionable recommendation string>"
  ]
}}

RULES:
- Return ONLY valid JSON, nothing else
- Include 4-6 categories
- Include 3-5 risk_breakdown items (values must sum to 100)
- Include 4-8 metrics with realistic values from the report
- Include 3-5 recommendations
- Use medically appropriate colors in risk_breakdown
"""


async def generate_graphics_data(
    patient_name: str,
    patient_age: int,
    patient_weight: int,
    patient_gender: str,
    summary_response: str,
    risk_response: str,
    next_step_response: str,
    ask_docter_response: str,
) -> dict:
    """Call Groq LLM to generate structured chart data from medical report."""

    prompt = GRAPHICS_PROMPT_TEMPLATE.format(
        name=patient_name,
        age=patient_age,
        weight=patient_weight or "N/A",
        gender=patient_gender,
        summary=summary_response or "",
        risk=risk_response or "",
        next_steps=next_step_response or "",
        ask_doctor=ask_docter_response or "",
    )

    payload = {
        "model": TEXT_MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.3,
    }
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json",
    }

    async with aiohttp.ClientSession() as session:
        async with session.post(GROQ_API_URL, headers=headers, json=payload) as resp:
            if resp.status != 200:
                raise Exception(f"Groq API error: {resp.status} {await resp.text()}")
            result = await resp.json()
            raw = result["choices"][0]["message"]["content"]

    # Extract JSON — LLM might wrap it in ```json ... ```
    raw = raw.strip()
    if raw.startswith("```"):
        # Remove markdown code fences
        lines = raw.split("\n")
        lines = [l for l in lines if not l.strip().startswith("```")]
        raw = "\n".join(lines)

    chart_data = json.loads(raw)
    return chart_data
