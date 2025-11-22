import google as genai
import os
import json
from typing import Optional, Dict, Any

DEFAULT_GEMINI_KEY = os.getenv("GEMINI_API_KEY")

system_instruction = """
You are an information extraction system.

Your ONLY task is:

Given noisy OCR text from a food or beverage package label, extract ONLY the ingredients list and return it as pure JSON. Do NOT include any explanations, comments, or extra text—just valid JSON.

Detailed rules:

1. Input
   - You will receive raw OCR text from a label, possibly bilingual (e.g., English/French), with nutrition facts, warnings, addresses, etc.
   - The text may contain line breaks, broken words, and duplicated content.

2. What to extract
   - Find the section that begins with something like:
     - "Ingredients:" or "Ingredients :" 
     - "Ingrédients:" or "Ingrédients :"
     - or an obvious ingredients line even if the word “Ingredients” is slightly corrupted (e.g., OCR errors).
   - Extract the list of ingredients that follows this heading.
   - Ingredients are usually separated by commas or semicolons.
   - Ignore:
     - Nutrition facts (Calories, Fat, Sodium, % Daily Value, vitamins, etc.)
     - Caffeine warnings or age/pregnancy warnings
     - “Supplemented with…” micronutrient lists
     - Storage information
     - Company addresses, barcodes, recycling/refund info, lot/expiry info, etc.

3. Bilingual / duplicated content
   - If the ingredients are listed in multiple languages (e.g., English and French), deduplicate entries.
   - Prefer a single language (English) when there are duplicates.
   - Preserve any meaningful descriptors (e.g., “green tea extract”, “guarana seed extract”, “natural flavour”).

4. Cleaning & normalization
   - Trim all leading/trailing whitespace.
   - Fix obvious OCR joins/splits if reasonably certain (e.g., “favour” → “flavour” if clearly meant).
   - Remove trailing punctuation like "." or ";" from ingredient names.
   - Preserve parentheses that are part of the description, e.g. "Carotene (colour)".

5. If no ingredients are found
   - Return:
     {
       "ingredients": []
     }

6. Output format
   - Output ONLY a single JSON object of the form:
     {
       "ingredients": [
         "Ingredient 1",
         "Ingredient 2",
         ...
       ]
     }
   - Do NOT add any extra keys.
   - Do NOT output anything else besides this JSON object.
"""

def _get_model(api_key: Optional[str] = None, model_name: str = "gemini-1.5-flash"):
    key = api_key or DEFAULT_GEMINI_KEY
    if not key:
        raise RuntimeError(
            "GEMINI_API_KEY is not configured. Provide api_key to extract_ingredients() or set GEMINI_API_KEY env var."
        )
    genai.configure(api_key=key)
    return genai.GenerativeModel(model_name=model_name, system_instruction=system_instruction)


def extract_ingredients(label_text: str, *, api_key: Optional[str] = None, model_name: str = "gemini-1.5-flash") -> Dict[str, Any]:
    """
    General, reusable function to extract ingredients JSON from OCR label text.

    Parameters:
    - label_text: raw OCR text (str)
    - api_key: optional API key string; if not provided the GEMINI_API_KEY env var will be used
    - model_name: model to use (default "gemini-1.5-flash")

    Returns:
    - A dict with shape {"ingredients": [...]}. On any parse failure returns {"ingredients": []}.

    Raises:
    - RuntimeError if API key is not provided and not present in environment.
    - Re-raises unexpected errors from the underlying client.
    """
    model = _get_model(api_key=api_key, model_name=model_name)

    response = model.generate_content(label_text)
    text = getattr(response, "text", None)
    if not text:
        try:
            text = json.dumps(response.output) if hasattr(response, "output") else str(response)
        except Exception:
            text = ""

    try:
        parsed = json.loads(text)
        if not isinstance(parsed, dict) or "ingredients" not in parsed:
            return {"ingredients": []}
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
    inp = sys.stdin.read() or sample_text
    try:
        result = extract_ingredients(inp)
    except RuntimeError as e:
        print(f"ERROR: {e}", file=sys.stderr)
        sys.exit(2)
    print(json.dumps(result, ensure_ascii=False, indent=2))
