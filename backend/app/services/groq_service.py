import os
import aiohttp
import base64
import fitz
import asyncio
import json
import re
from fastapi import UploadFile
from dotenv import load_dotenv
from app.prompts.medical_report_prompt import build_medical_report_prompt, risk_prompt, next_steps_prompt, ask_doctor_prompt

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_API_URL = os.getenv("GROQ_API_URL")
MODEL = os.getenv("GROQ_MODEL")

async def make_groq_request_with_retry(payload: dict, headers: dict, max_retries: int = 5) -> str:
    retry_delay = 1.0
    for attempt in range(max_retries):
        async with aiohttp.ClientSession() as session:
            async with session.post(GROQ_API_URL, headers=headers, json=payload) as resp:
                if resp.status == 200:
                    result = await resp.json()
                    return result["choices"][0]["message"]["content"]
                
                elif resp.status == 429:
                    error_text = await resp.text()
                    wait_time = retry_delay
                    
                    # Try to extract the wait time from headers or error message
                    if "Retry-After" in resp.headers:
                        try:
                            wait_time = float(resp.headers["Retry-After"])
                        except ValueError:
                            pass
                    else:
                        try:
                            error_json = json.loads(error_text)
                            msg = error_json.get("error", {}).get("message", "")
                            # Look for "... try again in X.XXs" or similar
                            match = re.search(r"try again in (\d+\.?\d*)s", msg)
                            if match:
                                wait_time = float(match.group(1)) + 0.5  # add 0.5s buffer
                        except Exception:
                            pass
                    
                    print(f"Groq API 429 rate limit hit. Waiting for {wait_time:.2f}s before retry (attempt {attempt+1}/{max_retries})...")
                    await asyncio.sleep(wait_time)
                    retry_delay *= 2  # Exponential backoff for subsequent retries
                    
                else:
                    raise Exception(f"Groq API error: {resp.status} {await resp.text()}")
                    
    raise Exception("Groq API rate limit exceeded after maximum retries.")

async def get_groq_response(img_bytes: bytes, filename: str, content_type: str, prompt: str):
    content = [{"type": "text", "text": prompt}]

    if filename.lower().endswith(".pdf") or content_type == "application/pdf":
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
            "image_url": {"url": f"data:{content_type};base64,{img_b64}"}
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
    
    return await make_groq_request_with_retry(payload, headers)

async def summarize_image_with_all_prompts(image: UploadFile, user_text: str):
    # Read the image bytes once to share across calls
    img_bytes = await image.read()
    filename = image.filename
    content_type = image.content_type

    # Get summary response first
    summary_prompt = build_medical_report_prompt(user_text)
    summary_response = await get_groq_response(img_bytes, filename, content_type, summary_prompt)

    # For the next prompts, call them in parallel using the summary_response as context
    r_prompt = risk_prompt(summary_response, user_text)
    n_prompt = next_steps_prompt(summary_response, user_text)
    a_prompt = ask_doctor_prompt(summary_response, user_text)

    # Create concurrent text-based tasks (saving tokens and avoiding rate limits)
    risk_task = get_groq_rag_response(summary_response, r_prompt)
    next_step_task = get_groq_rag_response(summary_response, n_prompt)
    ask_doctor_task = get_groq_rag_response(summary_response, a_prompt)

    risk_response, next_step_response, ask_doctor_response = await asyncio.gather(
        risk_task, next_step_task, ask_doctor_task
    )

    return {
        "summary_response": summary_response,
        "risk_response": risk_response,
        "next_step_response": next_step_response,
        "ask_docter_response": ask_doctor_response,
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
    
    return await make_groq_request_with_retry(payload, headers)

async def summarize_pdf_with_rag(user_id: int, session_id: str, user_text: str):
    from app.services.rag_service import get_all_pdf_documents
    
    # 1. Fetch complete document context once (very fast metadata fetch)
    context = await get_all_pdf_documents(user_id, session_id)
    
    # 2. Get initial summary response (sends full document context)
    summary_prompt = build_medical_report_prompt(user_text)
    summary_response = await get_groq_rag_response(context, summary_prompt)

    # 3. Create concurrent tasks for the remaining prompts using the summary_response as context (saving ~70% tokens)
    r_prompt = risk_prompt(summary_response, user_text)
    n_prompt = next_steps_prompt(summary_response, user_text)
    a_prompt = ask_doctor_prompt(summary_response, user_text)

    risk_task = get_groq_rag_response(summary_response, r_prompt)
    next_step_task = get_groq_rag_response(summary_response, n_prompt)
    ask_doctor_task = get_groq_rag_response(summary_response, a_prompt)

    risk_response, next_step_response, ask_doctor_response = await asyncio.gather(
        risk_task, next_step_task, ask_doctor_task
    )

    return {
        "summary_response": summary_response,
        "risk_response": risk_response,
        "next_step_response": next_step_response,
        "ask_docter_response": ask_doctor_response,
        "user_prompt": user_text
    }