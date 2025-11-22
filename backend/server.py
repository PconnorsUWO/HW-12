import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
from ocr.main import run_pipeline

app = Flask(__name__)
CORS(app) # Enable CORS for all routes

# Configure upload folder
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route('/analyze', methods=['POST'])
def analyze_image():
    if 'image' not in request.files:
        return jsonify({'error': 'No image part'}), 400
    
    file = request.files['image']
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file:
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        try:
            # Run the OCR pipeline
            result = run_pipeline(filepath)
            
            # Clean up (optional: delete file after processing)
            # os.remove(filepath)
            
            return jsonify(result)
        except Exception as e:
            import traceback
            error_details = traceback.format_exc()
            print(f"ERROR: {error_details}")
            return jsonify({
                'error': str(e),
                'details': error_details
            }), 500

if __name__ == '__main__':
    # Run on 0.0.0.0 to be accessible from local network (e.g. phone)
    app.run(host='0.0.0.0', port=5001, debug=True)
