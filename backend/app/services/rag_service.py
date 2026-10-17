import os
import sys

if sys.platform == "win32" and hasattr(os, "add_dll_directory"):
    for p in sys.path:
        cand = os.path.join(p, "pymupdf")
        if os.path.isdir(cand):
            try:
                os.add_dll_directory(cand)
                break
            except Exception:
                pass

import fitz

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extracts all text from a PDF file."""
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    text = ""
    for page in doc:
        text += page.get_text() + "\n"
    return text
