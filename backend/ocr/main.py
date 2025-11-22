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
    ocr_text = extract_text(image_path)

    if not ocr_text.strip():
        return {
            "ingredients": [],
            "error": "OCR returned no text."
        }

    print("[2] Extracting ingredients using Gemini...")
    result = extract_ingredients(ocr_text)

    return {
        "ocr_raw_text": ocr_text,
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
