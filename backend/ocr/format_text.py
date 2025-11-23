import os
import json
from typing import Optional, Dict, Any
import google.generativeai as genai
from google.generativeai import types  

DEFAULT_GEMINI_KEY = os.getenv("GEMINI_API_KEY")

SYSTEM_MESSAGE = """
INSTRUCTIONS: You are a specialist health and supplement analyst.

**INPUT:**
You will receive a JSON object from the Google Vision API containing OCR data (text annotations) from a product label.

**TASK:**
1.  **Identify Ingredients**: Locate the "Ingredients" section within the OCR text. Use the layout information (if helpful) to distinguish the list from other text.
2.  **Analyze**: Perform a comprehensive safety and health analysis of the extracted ingredients.

**OUTPUT:**
Strictly output a single JSON object matching the provided schema.
Do not include any markdown formatting (like ```json ... ```) in the response, just the raw JSON object.

**HEALTH SCORE CALCULATION (REPEATABLE RUBRIC):**
Start at 100. Deduct points strictly as follows (min 0, max 100):
Safety Risks: -25 (Serious/Banned), -10 (Moderate).
Dosage: -5 (>100 limit), -10 (>150%), -20 (>200%). Caffeine >400mg: Extra -15.
Novelty: -3 (Limited data), -7 (Very novel/Unknown).
Formulation: -10 (Proprietary blends with stimulants), -10 (Stacking stimulants), -3 (Excessive additives).
Interactions: -10 per dangerous combo.
Uncertainty: -5 to -10 if data is scarce.

**IMPORTANT INSTRUCTIONS:**
-   **Treat Ingredients as Stable Across Scans**: If multiple OCR scans of the same product produce slightly different text (e.g. minor spelling differences or line breaks), assume they represent the same ingredient list whenever the ingredient names and doses are effectively the same. Do not change the health score for trivial OCR differences.
-   **Use the Same Rubric Every Time**: Always apply the scoring rubric exactly as written above, in the same order, and with the same point values. Do not improvise new scoring rules.

**ANALYSIS REQUIREMENTS:**
-   **Overall Analysis**: Balanced, evidence-based assessment (safety, efficacy, quality).
-   **Ingredients**: List with primary functions.
-   **Harmful Components**: Risks, dosage concerns, purity.
-   **Side Effects**: Severity and frequency.
-   **Combinations**: Dangerous interactions.
-   **Sources**: Scholarly references (based on ingredients use reputable sources i.e. examine.com).
-   **Score**: Calculated based on the rubric above.
"""

def _get_client(api_key: Optional[str] = None, model_name: str = "gemini-2.5-flash", system_instruction: Optional[str] = None):
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
            temperature=0.0, # Deterministic output
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