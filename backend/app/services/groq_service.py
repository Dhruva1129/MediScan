import os
import aiohttp
import base64
from fastapi import UploadFile
from dotenv import load_dotenv
from app.prompts.medical_report_prompt import build_medical_report_prompt

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_API_URL = os.getenv("GROQ_API_URL")
MODEL = os.getenv("GROQ_MODEL")

async def summarize_image_with_prompt(image: UploadFile, user_text: str):
    # Build the prompt using the provided user text
    full_prompt = build_medical_report_prompt(user_text)

    img_bytes = await image.read()
    img_b64 = base64.b64encode(img_bytes).decode("utf-8")

    payload = {
        "model": MODEL,
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": full_prompt
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:{image.content_type};base64,{img_b64}"
                        }
                    }
                ]
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
                raise Exception(
                    f"Groq API error: {resp.status} {await resp.text()}"
                )

            result = await resp.json()
            return result["choices"][0]["message"]["content"]