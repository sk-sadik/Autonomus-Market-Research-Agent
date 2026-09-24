import os
import logging
import requests
from backend.models.gemini_flash_client import call as fallback_call

logger = logging.getLogger("backend.models.minimax")

def call(prompt: str, system_prompt: str = "", json_mode: bool = False) -> str:
    """
    Call MiniMax-M3 for planner and scrape agents.
    Falls back to Gemini Flash if MINIMAX_API_KEY is not set or fails.
    """
    api_key = os.environ.get("MINIMAX_API_KEY")
    if not api_key:
        logger.info("MINIMAX_API_KEY not configured. Falling back to Gemini Flash.")
        return fallback_call(prompt=prompt, system_prompt=system_prompt, json_mode=json_mode)

    try:
        url = "https://api.minimax.chat/v1/text/chatcompletion_v2"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": "MiniMax-Text-01",
            "messages": [
                {"sender_type": "SYSTEM", "sender_name": "System", "text": system_prompt or "You are a market research assistant."},
                {"sender_type": "USER", "sender_name": "User", "text": prompt}
            ],
            "temperature": 0.3
        }
        res = requests.post(url, headers=headers, json=payload, timeout=30)
        if res.status_code == 200:
            data = res.json()
            choices = data.get("choices", [])
            if choices and "message" in choices[0]:
                return choices[0]["message"].get("text", "").strip()
        
        logger.warning(f"MiniMax API returned status {res.status_code}. Falling back to Gemini Flash.")
        return fallback_call(prompt=prompt, system_prompt=system_prompt, json_mode=json_mode)
    except Exception as e:
        logger.error(f"MiniMax API request error: {e}. Falling back to Gemini Flash.")
        return fallback_call(prompt=prompt, system_prompt=system_prompt, json_mode=json_mode)
