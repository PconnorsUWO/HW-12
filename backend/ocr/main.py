import json
import sys
from pathlib import Path

# Import your modules (adjust paths if needed)
from ocr.get_text import extract_text
from ocr.format_text import extract_ingredients

ROOT_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT_DIR / "data"

def run_pipeline(image_path: str):
    """
    Runs the combined OCR → Gemini ingredient extraction pipeline.

    1. OCR extracts raw text from the image.
    2. Gemini extracts ingredient list.
    3. Returns JSON-safe dict.
    """

    print("[1] Running OCR...")
    ocr_data = extract_text(image_path)

    if not ocr_data:
        return {
            "ingredients": [],
            "error": "OCR returned no data."
        }

    # --- OPTIMIZATION: Prune unnecessary data ---
    # The Vision API returns massive JSON with coordinates for every character.
    # Gemini only needs the text structure. This reduces token count significantly.
    def prune_ocr_json(data):
        if isinstance(data, dict):
            # Remove verbose fields
            return {
                k: prune_ocr_json(v) 
                for k, v in data.items() 
                if k not in ["boundingPoly", "confidence", "property"]
            }
        elif isinstance(data, list):
            return [prune_ocr_json(i) for i in data]
        else:
            return data

    pruned_data = prune_ocr_json(ocr_data)
    ocr_json_str = json.dumps(pruned_data)
    # --------------------------------------------

    print("[2] Extracting ingredients using Gemini...")
    result = extract_ingredients(ocr_json_str)

    return {
        "ocr_raw_text": ocr_data.get("fullTextAnnotation", {}).get("text", ""), # Extract readable text for debug
        "analysis": result  # Return the full analysis object
    }


if __name__ == "__main__":
    # Allow:  python main.py path/to/image.jpg
    # Or:     python main.py  (default = backend/data/test.jpg)
    try:
        image_arg = sys.argv[1]
    except IndexError:
        image_arg = DATA_DIR / "test.jpg"

    image_path = str(image_arg)

    try:
        output = run_pipeline(image_path)
        print(json.dumps(output, ensure_ascii=False, indent=2))

    except Exception as e:
        print(json.dumps({
            "error": str(e)
        }, ensure_ascii=False, indent=2))
        sys.exit(1)
