import os
import json
import asyncio
import aiohttp
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

async def call_gemini(
    prompt: str,
    system_instruction: str = None,
    images: list = None,  # list of dicts: [{"mime_type": "image/jpeg", "data": "base64..."}]
    json_mode: bool = False,
    max_retries: int = 5
) -> str:
    """
    Sends a request to the Gemini API generateContent endpoint.
    Handles rate-limits (429 and 413) with exponential backoff retry.
    """
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}"
    
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
                
                elif resp.status in (429, 413):
                    error_text = await resp.text()
                    print(f"Gemini API rate limit hit ({resp.status}). Waiting for {retry_delay:.2f}s before retry (attempt {attempt+1}/{max_retries})...")
                    print(f"Error details: {error_text[:200]}")
                    await asyncio.sleep(retry_delay)
                    retry_delay *= 2
                else:
                    err_text = await resp.text()
                    raise Exception(f"Gemini API error: {resp.status} {err_text}")
                    
    raise Exception("Gemini API rate limit exceeded after maximum retries.")
