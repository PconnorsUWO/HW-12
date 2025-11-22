import os
import json
from typing import Optional, Dict, Any
from google import genai
from google.genai import types  # Import types for configuration

DEFAULT_GEMINI_KEY = os.getenv("GEMINI_API_KEY")

SYSTEM_MESSAGE = """
You are an information extraction system.
Given noisy OCR text from a food or beverage package label, extract ONLY the ingredients list.
Rules:
1. Extract only ingredients (comma separated).
2. Ignore nutrition facts, warnings, addresses.
3. Deduplicate bilingual lists (prefer English).
4. Return strictly the data structure requested.
"""

def _get_client(api_key: Optional[str] = None):
    key = api_key or DEFAULT_GEMINI_KEY
    if not key:
        raise RuntimeError(
            "GEMINI_API_KEY is not configured. Provide api_key or set GEMINI_API_KEY env var."
        )
    return genai.Client(api_key=key)


def extract_ingredients(
    label_text: str,
    *,
    api_key: Optional[str] = None,
    model_name: str = "gemini-2.5-flash"
) -> Dict[str, Any]:

    client = _get_client(api_key)

    # Define the expected schema for strict JSON output
    # This ensures the model returns exactly what you want
    response = client.models.generate_content(
        model=model_name,
        contents=label_text,  # User input goes here
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_MESSAGE,  # System prompt goes here
            response_mime_type="application/json",  # Enforce JSON mode
            response_schema={
                "type": "OBJECT",
                "properties": {
                    "ingredients": {
                        "type": "ARRAY",
                        "items": {"type": "STRING"}
                    }
                }
            }
        )
    )

    # Response processing
    try:
        text = response.text
        if not text:
            return {"ingredients": []}
            
        parsed = json.loads(text)
        return parsed
    except Exception:
        return {"ingredients": []}


if __name__ == "__main__":
    import sys

    sample_text = """ENE
    QUEA
    Supplemented Food Facts
    Ingredients: Sugar, Salt, Natural Flavour (vanilla), Milk powder.
    Ingrédients : Sucre, Sel, Arôme naturel (vanille), Lait en poudre.
    """

    # If running via command line pipe, read stdin, otherwise use sample
    if not sys.stdin.isatty():
        inp = sys.stdin.read()
    else:
        inp = sample_text

    try:
        result = extract_ingredients(inp)
        print(json.dumps(result, ensure_ascii=False, indent=2))
    except RuntimeError as e:
        print(f"ERROR: {e}", file=sys.stderr)
        sys.exit(2)