import os
import logging
from backend.models.gemini_flash_client import call as flash_call

logger = logging.getLogger("backend.models.gemini_flash_pro")

def call(prompt: str, system_prompt: str = "", json_mode: bool = False) -> str:
    """
    Call Gemini Flash/Pro client for heavy reasoning & synthesis tasks.
    Tries GEMINI_PRO_MODEL or gemini-2.5-flash with fallback chain.
    """
    model_name = os.environ.get("GEMINI_PRO_MODEL", "gemini-2.5-flash")
    return flash_call(prompt=prompt, system_prompt=system_prompt, json_mode=json_mode, model_name=model_name)
