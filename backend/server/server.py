from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
import tempfile
import os
import sys
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

# Import your existing OCR functions
from ocr.get_text import extract_text
from ocr.format_text import _get_client

app = FastAPI(title="OCR + Gemini API", version="1.0.0")

@app.post("/process-image")
async def process_image(file: UploadFile = File(...)):
    """
    Endpoint to process an uploaded image:
    1. Extract text using OCR
    2. Process extracted text with Gemini
    3. Return the result
    """
    
    # Validate file type
    if not file.content_type or not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    try:
        # Create a temporary file to store the uploaded image
        with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_image_path = temp_file.name
        
        # Step 1: Extract text from image using OCR
        extracted_text = extract_text(temp_image_path)
        
        if not extracted_text.strip():
            return JSONResponse(
                content={"error": "No text found in the image"},
                status_code=200
            )
        
        # Step 2: Process extracted text with Gemini
        client = _get_client()
        
        # Create a prompt that formats and enhances the extracted text
        prompt = f"""
        Please format and enhance the following text extracted from an image via OCR. 
        Fix any obvious OCR errors, improve formatting, and make it more readable:
        
        {extracted_text}
        """
        
        response = client.models.generate_content(
            model="gemini-3-pro-preview",
            contents=prompt,
        )
        
        # Clean up temporary file
        os.unlink(temp_image_path)
        
        return JSONResponse(content={
            "success": True,
            "original_text": extracted_text,
            "formatted_text": response.text,
            "filename": file.filename
        })
        
    except Exception as e:
        # Clean up temporary file if it exists
        if 'temp_image_path' in locals() and os.path.exists(temp_image_path):
            os.unlink(temp_image_path)
            
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "OCR + Gemini API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)