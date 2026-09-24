"""
Thin wrapper around google-genai that all agents share.

Every agent calls `generate_structured(prompt, schema_model)` and gets back
a validated Pydantic instance of `schema_model`. Retries once on a parse
failure (LLMs occasionally emit near-valid JSON) before raising.
"""
from __future__ import annotations
import os
import json
import logging
from typing import Type, TypeVar

from google import genai
from google.genai import types
from pydantic import BaseModel

logger = logging.getLogger("agents.gemini")

T = TypeVar("T", bound=BaseModel)

GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash")

_client: genai.Client | None = None


def get_client() -> genai.Client:
    global _client
    if _client is None:
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            raise RuntimeError(
                "GEMINI_API_KEY environment variable is missing. "
                "Set it in agents/.env (see .env.example)."
            )
        _client = genai.Client(api_key=api_key)
    return _client


def generate_structured(
    prompt: str,
    schema_model: Type[T],
    *,
    temperature: float = 0.3,
    model: str | None = None,
) -> T:
    """Call Gemini asking for JSON that matches `schema_model`, return a
    validated instance of it. Raises on repeated failure."""
    client = get_client()
    use_model = model or GEMINI_MODEL

    last_error: Exception | None = None
    for attempt in range(2):
        try:
            response = client.models.generate_content(
                model=use_model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=temperature,
                    response_mime_type="application/json",
                    response_schema=schema_model,
                ),
            )
            raw_text = (response.text or "").strip()
            if not raw_text:
                raise ValueError("Empty response from Gemini")
            data = json.loads(raw_text)
            return schema_model.model_validate(data)
        except Exception as exc:  # noqa: BLE001 - want to retry any failure
            last_error = exc
            logger.warning(
                "generate_structured attempt %d failed for %s: %s",
                attempt + 1, schema_model.__name__, exc,
            )

    raise RuntimeError(
        f"Gemini failed to produce valid {schema_model.__name__} JSON after retries: {last_error}"
    )
