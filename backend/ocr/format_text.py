import os
import json
from typing import Optional, Dict, Any
import google.generativeai as genai
from google.generativeai import types  

DEFAULT_GEMINI_KEY = os.getenv("GEMINI_API_KEY")

SYSTEM_MESSAGE = """
INSTRUCTIONS: Act as a specialist health and supplement analyst.

**PHASE 1: CLEANING & EXTRACTION**
Given noisy OCR text from a food or beverage package label, first identify the INGREDIENTS LIST.
1. Extract only ingredients (comma separated).
2. Ignore nutrition facts, warnings, addresses.
3. Deduplicate bilingual lists (prefer English).

**PHASE 2: ANALYSIS**
Analyze the product based on the extracted ingredients using authoritative sources (e.g., Examine.com, PubMed).
You must provide a comprehensive breakdown with the following 6 sections:

1. **Overall Analysis**: A balanced, evidence-based assessment of safety, efficacy, and quality. (Text block)
2. **Ingredients List**: A clean list of ingredients with their primary functions.
3. **Potentially Harmful Components**: Identify risks (dosage, purity, population warnings).
4. **Potential Side Effects**: Documented side effects organized by severity/frequency.
5. **Potentially Harmful Combinations**: Dangerous interactions with meds, supplements, foods, or conditions.
6. **Scholarly Sources**: References in consistent citation format.

**SCORING LOGIC (0-100):**
- Start at 100.
- Deduct for harmful ingredients, dangerous combos, and high sugar/additives.
- Score < 50 is POOR, 50-69 MODERATE, 70-79 GOOD, 80+ EXCELLENT.

**OUTPUT FORMAT:**
Strictly output a single JSON object matching the schema below.
"""

def _get_client(api_key: Optional[str] = None, model_name: str = "gemini-2.0-flash-exp", system_instruction: Optional[str] = None):
    key = api_key or DEFAULT_GEMINI_KEY
    if not key:
        raise RuntimeError(
            "GEMINI_API_KEY is not configured. Provide api_key or set GEMINI_API_KEY env var."
        )
    genai.configure(api_key=key)
    return genai.GenerativeModel(model_name, system_instruction=system_instruction)


def extract_ingredients(
    label_text: str,
    *,
    api_key: Optional[str] = None,
    model_name: str = "gemini-2.5-flash"
) -> Dict[str, Any]:

    model = _get_client(api_key, model_name, system_instruction=SYSTEM_MESSAGE)

    # Define the expected schema for strict JSON output
    response = model.generate_content(
        label_text,  # User input goes here
        generation_config=genai.types.GenerationConfig(
            response_mime_type="application/json",  # Enforce JSON mode
            response_schema={
                "type": "OBJECT",
                "properties": {
                    "appAssessment": {"type": "STRING"},
                    "overallWeightedHealthScore": {"type": "INTEGER"},
                    "overallAnalysis": {"type": "STRING"},
                    "ingredients": {
                        "type": "ARRAY",
                        "items": {
                            "type": "OBJECT",
                            "properties": {
                                "name": {"type": "STRING"},
                                "function": {"type": "STRING"}
                            }
                        }
                    },
                    "harmfulComponents": {
                        "type": "ARRAY",
                        "items": {
                            "type": "OBJECT",
                            "properties": {
                                "name": {"type": "STRING"},
                                "concern": {"type": "STRING"},
                                "severity": {"type": "STRING"}
                            }
                        }
                    },
                    "sideEffects": {
                        "type": "ARRAY",
                        "items": {
                            "type": "OBJECT",
                            "properties": {
                                "effect": {"type": "STRING"},
                                "frequency": {"type": "STRING"}
                            }
                        }
                    },
                    "harmfulCombinations": {
                        "type": "ARRAY",
                        "items": {
                            "type": "OBJECT",
                            "properties": {
                                "combo": {"type": "STRING"},
                                "risk": {"type": "STRING"}
                            }
                        }
                    },
                    "scholarlySources": {
                        "type": "ARRAY",
                        "items": {
                            "type": "OBJECT",
                            "properties": {
                                "citation": {"type": "STRING"},
                                "url": {"type": "STRING"}
                            }
                        }
                    }
                }
            }
        )
    )

    try:
        text = response.text
        if not text:
            return {
                "appAssessment": "ERROR",
                "overallWeightedHealthScore": 0,
                "worstSideEffectsSummary": ["No data returned"],
                "positiveBenefitsSummary": [],
                "badIngredientCombos": []
            }
            
        parsed = json.loads(text)
        return parsed
    except Exception:
        return {
            "appAssessment": "ERROR",
            "overallWeightedHealthScore": 0,
            "worstSideEffectsSummary": ["Analysis failed"],
            "positiveBenefitsSummary": [],
            "badIngredientCombos": []
        }


if __name__ == "__main__":
    import sys

    sample_text = """ENE
    QUEA
    Supplemented Food Facts
    Ingredients: Sugar, Salt, Natural Flavour (vanilla), Milk powder.
    Ingrédients : Sucre, Sel, Arôme naturel (vanille), Lait en poudre.
    """

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