import os
import logging
import requests
from backend.models.gemini_flash_pro_client import call as pro_fallback_call

logger = logging.getLogger("backend.models.nemotron")

def call(prompt: str, system_prompt: str = "", json_mode: bool = False) -> str:
    """
    Call Nemotron 3 Ultra for report generation.
    Falls back to Gemini Flash Pro / Gemini 3.6 Flash if NEMOTRON_API_KEY is not set or fails.
    """
    api_key = os.environ.get("NEMOTRON_API_KEY")
    if not api_key:
        logger.info("NEMOTRON_API_KEY not configured. Falling back to Gemini Flash Pro.")
        return pro_fallback_call(prompt=prompt, system_prompt=system_prompt, json_mode=json_mode)

    try:
        # OpenRouter or NVIDIA API endpoint for Nemotron
        url = os.environ.get("NEMOTRON_API_URL", "https://openrouter.ai/api/v1/chat/completions")
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": "nvidia/nemotron-3-ultra",
            "messages": [
                {"role": "system", "content": system_prompt or "You are a professional market research report writer."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.3
        }
        res = requests.post(url, headers=headers, json=payload, timeout=45)
        if res.status_code == 200:
            data = res.json()
            choices = data.get("choices", [])
            if choices and "message" in choices[0]:
                return choices[0]["message"].get("content", "").strip()

        logger.warning(f"Nemotron API returned status {res.status_code}. Falling back to Gemini Flash Pro.")
        return pro_fallback_call(prompt=prompt, system_prompt=system_prompt, json_mode=json_mode)
    except Exception as e:
        logger.error(f"Nemotron API request error: {e}. Falling back to Gemini Flash Pro.")
        return pro_fallback_call(prompt=prompt, system_prompt=system_prompt, json_mode=json_mode)
