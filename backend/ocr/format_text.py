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
Your task is to analyze the extracted INGREDIENT LIST using the knowledge base of **examine.com** (or equivalent authoritative evidence-based source). The analysis must prioritize the **weighted, cumulative risk of ingredient combinations** over individual ingredient quality.

**ANALYSIS FOCUS & RULESET:**
1.  **Core Priority:** Identify and detail negative/damaging effects and risks, especially synergistic negative effects.
2.  **Required Detail:** Essential side effects and harmful ingredients MUST be supported by a brief mention of **scientific findings or studies** (cite the source/context, e.g., "[Examine.com: Multiple human trials]").
3.  **Beneficial Effects:** Must be included to allow the user to weigh them against the risks.
4.  **Non-Redundancy:** Ensure that the content in 'worstSideEffectsSummary' is a high-level summary and **NOT** a direct copy of the detailed points in the 'badIngredientCombos' section.

**CALCULATION LOGIC FOR overallWeightedHealthScore (STARTING SCORE: 100):**
* The score must weigh the overall health impact, emphasizing the deduction for damaging effects.
1.  **Deduction 1 (Critical Synergy):** Subtract **25** for the combined effect of multiple strong stimulants (e.g., high-dose caffeine + synephrine/yohimbine).
2.  **Deduction 2 (Artificial Sweeteners):** Subtract **20** for the use of multiple non-nutritive, artificial sweeteners (e.g., sucralose AND acesulfame K).
3.  **Deduction 3 (Toxicity Potential):** Subtract **10** for the presence of potentially accumulating fat-soluble vitamins (A, D, E, K) or high-risk B vitamins (e.g., high-dose B6).
4.  **Discretionary Deduction:** Apply an additional **1 to 20 point deduction** for other significant, high-risk ingredient combinations not covered above.
5.  **Return Final Score.**

**TASK & FORMATTING RULES (STRICT JSON OUTPUT ONLY):**
1.  **Assessment Rule:** Assign **appAssessment** based on the final calculated score: “EXCELLENT” (Score 80+), “GOOD” (Score 70-79), ”MODERATE" (Score 50-69), or “POOR” (Score 0-49).
2.  **Array Formatting:** The fields **worstSideEffectsSummary**, **positiveBenefitsSummary**, **comboRisks**, and **scientificSupport** must be structured as **ARRAYS OF STRINGS** for display as bullet points.
3.  **Output:** Provide the **ENTIRE analysis** as a single JSON object that **STRICTLY** adheres to the REQUIRED JSON STRUCTURE.
"""

def _get_client(api_key: Optional[str] = None, model_name: str = "gemini-2.0-flash-exp"):
    key = api_key or DEFAULT_GEMINI_KEY
    if not key:
        raise RuntimeError(
            "GEMINI_API_KEY is not configured. Provide api_key or set GEMINI_API_KEY env var."
        )
    genai.configure(api_key=key)
    return genai.GenerativeModel(model_name)


def extract_ingredients(
    label_text: str,
    *,
    api_key: Optional[str] = None,
    model_name: str = "gemini-2.0-flash-exp"
) -> Dict[str, Any]:

    model = _get_client(api_key, model_name)

    # Define the expected schema for strict JSON output
    # This ensures the model returns exactly what you want
    response = model.generate_content(
        label_text,  # User input goes here
        generation_config=genai.types.GenerationConfig(
            system_instruction=SYSTEM_MESSAGE,
            response_mime_type="application/json",  # Enforce JSON mode
            response_schema={
                "type": "OBJECT",
                "properties": {
                    "appAssessment": {"type": "STRING"},
                    "overallWeightedHealthScore": {"type": "INTEGER"},
                    "worstSideEffectsSummary": {
                        "type": "ARRAY",
                        "items": {"type": "STRING"}
                    },
                    "positiveBenefitsSummary": {
                        "type": "ARRAY",
                        "items": {"type": "STRING"}
                    },
                    "badIngredientCombos": {
                        "type": "ARRAY",
                        "items": {
                            "type": "OBJECT",
                            "properties": {
                                "combo": {"type": "STRING"},
                                "risksFactor": {"type": "STRING"},
                                "comboRisks": {
                                    "type": "ARRAY",
                                    "items": {"type": "STRING"}
                                },
                                "scientificSupport": {
                                    "type": "ARRAY",
                                    "items": {"type": "STRING"}
                                }
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