import base64
import json
import os
from pathlib import Path
from dotenv import load_dotenv
import requests

PARENT_DIR = Path(__file__).resolve().parent

ROOT_DIR = Path(__file__).resolve().parents[2]
load_dotenv(str(ROOT_DIR / ".env"))

GOOGLE_API_KEY = os.getenv("VISION_API_KEY")
# don't raise at import time so module can be imported/used for local testing
# if you want strict behavior, raise inside extract_text before making the request

DATA_DIR = ROOT_DIR / "backend" / "data"

def extract_text(image_path: str) -> str:
    image_path = Path(image_path)

    # If a relative path or missing, try data dir and cwd before failing
    if not image_path.exists():
        candidate = DATA_DIR / image_path.name
        if candidate.exists():
            image_path = candidate
        else:
            candidate_cwd = Path.cwd() / image_path
            if candidate_cwd.exists():
                image_path = candidate_cwd
            else:
                raise FileNotFoundError(f"Image not found: {image_path} (tried {candidate} and {candidate_cwd})")

    with open(image_path, "rb") as img_file:
        img_data = base64.b64encode(img_file.read()).decode()

    if not GOOGLE_API_KEY:
        raise RuntimeError("VISION_API_KEY missing. Set VISION_API_KEY in .env at project root or export VISION_API_KEY in your environment.")

    url = f"https://vision.googleapis.com/v1/images:annotate?key={GOOGLE_API_KEY}"

    payload = {
        "requests": [
            {
                "image": {"content": img_data},
                "features": [{"type": "TEXT_DETECTION"}],
            }
        ]
    }

    # POST request
    response = requests.post(url, json=payload)
    try:
        response.raise_for_status()
    except requests.exceptions.HTTPError as e:
        # Try to get a helpful error payload from Google and raise a clearer error
        try:
            err_body = response.json()
        except Exception:
            err_body = response.text

        hint = ""
        if response.status_code == 403:
            hint = (
                " (403 Forbidden) — check that the Vision API is enabled for your project, "
                "that billing is enabled, and that the API key has appropriate restrictions or is unrestricted."
            )

        raise RuntimeError(
            f"Vision API request failed with status {response.status_code}{hint}: {err_body}"
        ) from e

    result = response.json()

    try:
        return result["responses"][0]["textAnnotations"][0]["description"]
    except Exception:
        return ""


if __name__ == "__main__":
    sample_path = DATA_DIR / "test.jpg"  # change this if needed
    text = extract_text(sample_path)
    print(text)
