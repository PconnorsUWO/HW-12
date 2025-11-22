import requests
import json
from pathlib import Path

def test_image_processing(image_path):
    url = "http://localhost:8000/process-image"
    
    try:
        with open(image_path, "rb") as f:
            files = {"file": ("test.jpg", f, "image/jpeg")}
            response = requests.post(url, files=files)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
    except FileNotFoundError:
        print(f"Image file not found: {image_path}")
    except requests.exceptions.ConnectionError:
        print("Server not running. Start with: python backend/server/server.py")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    # Get the root directory and construct path to test image
    ROOT_DIR = Path(__file__).resolve().parents[0]  # Assuming test_ep.py is in root
    DATA_DIR = ROOT_DIR / "backend" / "data"
    
    # Use the test image from your data directory
    test_image_path = DATA_DIR / "test.jpg"
    
    print(f"Looking for image at: {test_image_path}")
    
    if test_image_path.exists():
        test_image_processing(str(test_image_path))
    else:
        print(f"Test image not found at {test_image_path}")
        print("Please add a test image to backend/data/test.jpg or update the path")