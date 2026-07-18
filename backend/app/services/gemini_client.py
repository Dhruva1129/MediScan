import os
import json
import asyncio
import aiohttp
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

async def _execute_call_gemini(
    model_name: str,
    prompt: str = None,
    system_instruction: str = None,
    images: list = None,
    json_mode: bool = False,
    max_retries: int = 4,
    contents: list = None
) -> str:
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={GEMINI_API_KEY}"
    
    if contents:
        payload = {
            "contents": contents
        }
    else:
        parts = []
        if prompt:
            parts.append({"text": prompt})
        
        if images:
            for img in images:
                parts.append({
                    "inlineData": {
                        "mimeType": img["mime_type"],
                        "data": img["data"]
                    }
                })
        payload = {
            "contents": [
                {
                    "parts": parts
                }
            ]
        }
    
    if system_instruction:
        payload["systemInstruction"] = {
            "parts": [{"text": system_instruction}]
        }
        
    if json_mode:
        payload["generationConfig"] = {
            "responseMimeType": "application/json"
        }
        
    headers = {
        "Content-Type": "application/json"
    }
    
    retry_delay = 1.0
    for attempt in range(max_retries):
        async with aiohttp.ClientSession() as session:
            async with session.post(url, headers=headers, json=payload) as resp:
                if resp.status == 200:
                    result = await resp.json()
                    try:
                        return result["candidates"][0]["content"]["parts"][0]["text"]
                    except (KeyError, IndexError) as e:
                        raise Exception(f"Failed to parse Gemini response: {e}. Raw response: {result}")
                
                # Retry on rate limits (429, 413) and temporary server errors (500, 502, 503, 504)
                elif resp.status in (429, 413, 500, 502, 503, 504):
                    error_text = await resp.text()
                    print(f"Gemini API warning/retry status ({resp.status}) on model {model_name}. Waiting for {retry_delay:.2f}s before retry (attempt {attempt+1}/{max_retries})...")
                    print(f"Error details: {error_text[:200]}")
                    await asyncio.sleep(retry_delay)
                    retry_delay *= 2
                else:
                    err_text = await resp.text()
                    raise Exception(f"Gemini API error: {resp.status} {err_text}")
                    
    raise Exception(f"Gemini API rate limit or server error exceeded after {max_retries} retries on model {model_name}.")

async def call_gemini(
    prompt: str = None,
    system_instruction: str = None,
    images: list = None,
    json_mode: bool = False,
    max_retries: int = 4,
    contents: list = None
) -> str:
    """
    Sends a request to the primary Gemini model. If it fails due to high demand, rate limits,
    or server errors, automatically falls back to 'gemini-flash-latest' to ensure high reliability.
    """
    try:
        return await _execute_call_gemini(
            model_name=GEMINI_MODEL,
            prompt=prompt,
            system_instruction=system_instruction,
            images=images,
            json_mode=json_mode,
            max_retries=max_retries,
            contents=contents
        )
    except Exception as e:
        # Avoid looping fallback if primary is already the fallback
        if GEMINI_MODEL != "gemini-flash-latest":
            print(f"\n[Warning] Primary model {GEMINI_MODEL} failed: {e}.\nAttempting automatic fallback to gemini-flash-latest...")
            return await _execute_call_gemini(
                model_name="gemini-flash-latest",
                prompt=prompt,
                system_instruction=system_instruction,
                images=images,
                json_mode=json_mode,
                max_retries=max_retries,
                contents=contents
            )
        raise e
