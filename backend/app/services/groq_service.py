import base64
import fitz
import asyncio
from fastapi import UploadFile
from app.prompts.medical_report_prompt import build_medical_report_prompt, risk_prompt, next_steps_prompt, ask_doctor_prompt
from app.services.gemini_client import call_gemini

async def get_groq_response(img_bytes: bytes, filename: str, content_type: str, prompt: str):
    """Parses PDF pages or image files and forwards them to Gemini."""
    images = []

    if filename.lower().endswith(".pdf") or content_type == "application/pdf":
        doc = fitz.open(stream=img_bytes, filetype="pdf")
        # Limit to first 3 pages to avoid payload being too large
        num_pages = min(len(doc), 3)
        for i in range(num_pages):
            page = doc.load_page(i)
            # Render at standard resolution
            pix = page.get_pixmap(matrix=fitz.Matrix(1.5, 1.5))
            page_bytes = pix.tobytes("jpeg")
            page_b64 = base64.b64encode(page_bytes).decode("utf-8")
            images.append({
                "mime_type": "image/jpeg",
                "data": page_b64
            })
    else:
        img_b64 = base64.b64encode(img_bytes).decode("utf-8")
        images.append({
            "mime_type": content_type,
            "data": img_b64
        })

    return await call_gemini(prompt=prompt, images=images)

async def summarize_image_with_all_prompts(image: UploadFile, user_text: str):
    # Read the image bytes once to share across calls
    img_bytes = await image.read()
    filename = image.filename
    content_type = image.content_type

    # Get summary response first
    summary_prompt = build_medical_report_prompt(user_text)
    summary_response = await get_groq_response(img_bytes, filename, content_type, summary_prompt)

    # For the next prompts, call them sequentially using the summary_response as context
    r_prompt = risk_prompt(summary_response, user_text)
    n_prompt = next_steps_prompt(summary_response, user_text)
    a_prompt = ask_doctor_prompt(summary_response, user_text)

    risk_response = await get_groq_rag_response(summary_response, r_prompt)
    next_step_response = await get_groq_rag_response(summary_response, n_prompt)
    ask_doctor_response = await get_groq_rag_response(summary_response, a_prompt)

    return {
        "summary_response": summary_response,
        "risk_response": risk_response,
        "next_step_response": next_step_response,
        "ask_docter_response": ask_doctor_response,
        "user_prompt": user_text
    }

async def get_groq_rag_response(context: str, prompt: str):
    rag_prompt = f"Context information is below.\n---------------------\n{context}\n---------------------\nGiven the context information and your medical knowledge, answer the following query: {prompt}"
    return await call_gemini(prompt=rag_prompt)

async def summarize_pdf_with_rag(user_id: int, session_id: str, user_text: str):
    from app.services.rag_service import get_all_pdf_documents
    
    # 1. Fetch complete document context once
    context = await get_all_pdf_documents(user_id, session_id)
    
    # 2. Get initial summary response
    summary_prompt = build_medical_report_prompt(user_text)
    summary_response = await get_groq_rag_response(context, summary_prompt)

    # 3. Call remaining tasks sequentially
    r_prompt = risk_prompt(summary_response, user_text)
    n_prompt = next_steps_prompt(summary_response, user_text)
    a_prompt = ask_doctor_prompt(summary_response, user_text)

    risk_response = await get_groq_rag_response(summary_response, r_prompt)
    next_step_response = await get_groq_rag_response(summary_response, n_prompt)
    ask_doctor_response = await get_groq_rag_response(summary_response, a_prompt)

    return {
        "summary_response": summary_response,
        "risk_response": risk_response,
        "next_step_response": next_step_response,
        "ask_docter_response": ask_doctor_response,
        "user_prompt": user_text
    }

async def summarize_pdf_text_directly(pdf_text: str, user_text: str):
    # Limit pdf_text to a safe character length (30k characters is generous for Gemini)
    context = pdf_text[:30000]
    
    # 1. Get initial summary response
    summary_prompt = build_medical_report_prompt(user_text)
    summary_response = await get_groq_rag_response(context, summary_prompt)

    # 2. Call remaining tasks sequentially
    r_prompt = risk_prompt(summary_response, user_text)
    n_prompt = next_steps_prompt(summary_response, user_text)
    a_prompt = ask_doctor_prompt(summary_response, user_text)

    risk_response = await get_groq_rag_response(summary_response, r_prompt)
    next_step_response = await get_groq_rag_response(summary_response, n_prompt)
    ask_doctor_response = await get_groq_rag_response(summary_response, a_prompt)

    return {
        "summary_response": summary_response,
        "risk_response": risk_response,
        "next_step_response": next_step_response,
        "ask_docter_response": ask_doctor_response,
        "user_prompt": user_text
    }