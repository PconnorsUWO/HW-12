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

**HEALTH SCORE (REPEATABLE RUBRIC):**
Start from Score = 100. Apply penalties in the exact order below. The final score must be between 0 and 100 (round to nearest integer).

1.  **Serious Safety Risks (per ingredient)**:
    -   Known serious risk at typical supplement doses (e.g. strong liver toxicity, strong cardiovascular risk, banned substances): -25 points each, max -50 total.
    -   Known moderate risk (requires caution, but not typically banned): -10 points each, max -30 total.

2.  **Dosage Above Common Safety Limits (per ingredient)**:
    -   If an ingredient’s dose is >100% and <=150% of a widely accepted upper safe limit: -5.
    -   If >150% and <=200% of upper limit: -10.
    -   If >200% of upper limit: -20.
    -   **Special case for caffeine**: Total caffeine >400 mg/day equivalent: additional -15 (on top of the above, if applicable).

3.  **Novel / Poorly Studied Ingredients (per ingredient)**:
    -   Well-studied ingredients with good human data: 0 penalty.
    -   Limited human data / mostly animal or in vitro data: -3.
    -   Very novel, proprietary blends, or ingredients with unclear identity or almost no data: -7.

4.  **Formulation Concerns**:
    -   "Proprietary blend" where individual doses are not disclosed and includes stimulants or potent actives: -10.
    -   Use of multiple overlapping stimulants (e.g. caffeine + synephrine + yohimbine, etc.): -10.
    -   Excessive use of artificial colors, sweeteners, or fillers (judgement based on typical supplement norms): -3 to -5 total.

5.  **Ingredient Interactions**:
    -   Potentially dangerous interaction between ingredients (e.g. multiple blood-pressure-raising agents, multiple anticoagulants, strong stimulant stacks): -10 per distinct high-risk combination, max -20.

6.  **Uncertainty Buffer**:
    -   If many ingredients have unclear doses or limited safety data (e.g. >5 such ingredients): apply an additional -5 to -10 based on overall uncertainty.

7.  **Clamp Score**:
    -   If the score is >100, set to 100.
    -   If the score is <0, set to 0.

**IMPORTANT INSTRUCTIONS:**
-   **Treat Ingredients as Stable Across Scans**: If multiple OCR scans of the same product produce slightly different text (e.g. minor spelling differences or line breaks), assume they represent the same ingredient list whenever the ingredient names and doses are effectively the same. Do not change the health score for trivial OCR differences.
-   **Use the Same Rubric Every Time**: Always apply the scoring rubric exactly as written above, in the same order, and with the same point values. Do not improvise new scoring rules.

**ANALYSIS REQUIREMENTS:**
-   **Overall Analysis**: Balanced, evidence-based assessment (safety, efficacy, quality).
-   **Ingredients**: List with primary functions.
-   **Harmful Components**: Risks, dosage concerns, purity.
-   **Side Effects**: Severity and frequency.
-   **Combinations**: Dangerous interactions.
-   **Sources**: Scholarly references.
-   **Score**: Calculated based on the rubric above.
"""

def _get_client(api_key: Optional[str] = None, model_name: str = "gemini-2.5-flash-lite", system_instruction: Optional[str] = None):
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
    model_name: str = "gemini-2.5-flash-lite"
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