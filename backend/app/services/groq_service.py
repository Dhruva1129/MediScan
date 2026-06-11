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

async def get_groq_rag_response(context: str, prompt: str):
    rag_prompt = f"Context information is below.\n---------------------\n{context}\n---------------------\nGiven the context information and your medical knowledge, answer the following query: {prompt}"
    
    payload = {
        "model": MODEL,
        "messages": [
            {
                "role": "user",
                "content": rag_prompt
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

async def summarize_pdf_with_rag(user_id: int, session_id: str, user_text: str):
    from app.services.rag_service import query_vector_db
    
    # 1. Summary response
    summary_prompt = build_medical_report_prompt(user_text)
    summary_context = await query_vector_db("Patient medical history and summary", user_id, session_id)
    summary_response = await get_groq_rag_response(summary_context, summary_prompt)

    # 2. Risk response
    r_prompt = risk_prompt(summary_response, user_text)
    risk_context = await query_vector_db(r_prompt, user_id, session_id)
    risk_response = await get_groq_rag_response(risk_context, r_prompt)

    # 3. Next step response
    n_prompt = next_steps_prompt(summary_response, user_text)
    next_step_context = await query_vector_db(n_prompt, user_id, session_id)
    next_step_response = await get_groq_rag_response(next_step_context, n_prompt)

    # 4. Ask doctor response
    a_prompt = ask_doctor_prompt(summary_response, user_text)
    ask_doctor_context = await query_vector_db(a_prompt, user_id, session_id)
    ask_doctor_response = await get_groq_rag_response(ask_doctor_context, a_prompt)

    return {
        "summary_response": summary_response,
        "risk_response": risk_response,
        "next_step_response": next_step_response,
        "ask_docter_response": ask_doctor_response,
        "user_prompt": user_text
    }