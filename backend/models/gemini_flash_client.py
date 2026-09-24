import os
import time
import logging
from typing import Optional, List
from google import genai
from google.genai import types

logger = logging.getLogger("backend.models.gemini_flash")

_client: Optional[genai.Client] = None

# Valid Gemini model candidates for google-genai SDK v1.5.0
MODEL_FALLBACK_LIST: List[str] = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
]

def get_client() -> genai.Client:
    global _client
    if _client is None:
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            raise RuntimeError(
                "GEMINI_API_KEY environment variable is missing. "
                "Set it in backend/.env (see backend/.env.example)."
            )
        _client = genai.Client(api_key=api_key)
    return _client

def call(prompt: str, system_prompt: str = "", json_mode: bool = False, model_name: Optional[str] = None) -> str:
    """
    Call Gemini Flash model with fast failover on rate limit (429) errors.
    """
    client = get_client()
    full_contents = f"{system_prompt}\n\n{prompt}" if system_prompt else prompt
    
    config = types.GenerateContentConfig(
        temperature=0.3,
    )
    if json_mode:
        config.response_mime_type = "application/json"

    primary_model = model_name or os.environ.get("GEMINI_MODEL", "gemini-2.5-flash")
    candidates = [primary_model] + [m for m in MODEL_FALLBACK_LIST if m != primary_model]

    last_exception = None

    for target_model in candidates:
        try:
            response = client.models.generate_content(
                model=target_model,
                contents=full_contents,
                config=config,
            )
            text = (response.text or "").strip()
            if text:
                return text
        except Exception as e:
            err_str = str(e)
            last_exception = e
            logger.warning(f"Call to model '{target_model}' failed: {err_str[:120]}")
            
            # If 429 rate limit or quota exceeded, try next model candidate fast
            if "429" in err_str or "RESOURCE_EXHAUSTED" in err_str or "quota" in err_str.lower():
                time.sleep(0.5)
                continue

    logger.error(f"All Gemini model candidates rate-limited or unavailable. Last error: {last_exception}")
    raise RuntimeError(f"Gemini API rate limit or execution error: {last_exception}")
