import os
import aiohttp
import base64
import fitz
from fastapi import UploadFile
from dotenv import load_dotenv
from app.prompts.medical_report_prompt import build_medical_report_prompt, risk_prompt, next_steps_prompt, ask_doctor_prompt

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_API_URL = os.getenv("GROQ_API_URL")
MODEL = os.getenv("GROQ_MODEL")

async def get_groq_response(image: UploadFile, prompt: str):
    img_bytes = await image.read()
    
    content = [{"type": "text", "text": prompt}]

    if image.filename.lower().endswith(".pdf") or image.content_type == "application/pdf":
        doc = fitz.open(stream=img_bytes, filetype="pdf")
        # Limit to first 3 pages to avoid payload being too large
        num_pages = min(len(doc), 3)
        for i in range(num_pages):
            page = doc.load_page(i)
            # Render at higher resolution (~150 DPI)
            pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
            page_bytes = pix.tobytes("jpeg")
            page_b64 = base64.b64encode(page_bytes).decode("utf-8")
            content.append({
                "type": "image_url", 
                "image_url": {"url": f"data:image/jpeg;base64,{page_b64}"}
            })
    else:
        img_b64 = base64.b64encode(img_bytes).decode("utf-8")
        content.append({
            "type": "image_url", 
            "image_url": {"url": f"data:{image.content_type};base64,{img_b64}"}
        })

    payload = {
        "model": MODEL,
        "messages": [
            {
                "role": "user",
                "content": content
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
                raise Exception(f"Groq API error: {resp.status} {await resp.text()}")
            result = await resp.json()
            return result["choices"][0]["message"]["content"]

async def summarize_image_with_all_prompts(image: UploadFile, user_text: str):
    # Get summary response
    summary_prompt = build_medical_report_prompt(user_text)
    summary_response = await get_groq_response(image, summary_prompt)

    # For the next prompts, reuse the image (rewind file pointer)
    image.file.seek(0)
    risk_response = await get_groq_response(image, risk_prompt(summary_response, user_text))

    image.file.seek(0)
    next_step_response = await get_groq_response(image, next_steps_prompt(summary_response, user_text))

    image.file.seek(0)
    ask_docter_response = await get_groq_response(image, ask_doctor_prompt(summary_response, user_text))

    return {
        "summary_response": summary_response,
        "risk_response": risk_response,
        "next_step_response": next_step_response,
        "ask_docter_response": ask_docter_response,
        "user_prompt": user_text
    }