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

@app.route('/news', methods=['GET'])
def get_news():
    try:
        api_key = os.getenv("NEWS_API_KEY")
        if not api_key:
            return jsonify({'error': 'NEWS_API_KEY not found'}), 500

        # Fetch news about nutrition and food science
        url = "https://newsapi.org/v2/everything"
        
        # Credible domains for health research
        domains = "sciencedaily.com,medicalnewstoday.com,nature.com,scientificamerican.com,mayoclinic.org,nih.gov,eurekalert.org,healthline.com,webmd.com"
        
        # Focus on ingredients, additives, and specific health impacts
        params = {
            'q': '(ingredient OR additive OR "food compound" OR caffeine OR sugar OR sweetener OR preservative) AND (health OR disease OR cancer OR heart OR metabolic OR toxicity) AND (study OR research)',
            'domains': domains,
            'language': 'en',
            'sortBy': 'publishedAt',
            'pageSize': 10,
            'apiKey': api_key
        }
        
        import requests
        response = requests.get(url, params=params)
        data = response.json()
        
        if data.get('status') != 'ok':
            return jsonify({'error': data.get('message', 'Failed to fetch news')}), 500
            
        return jsonify(data['articles'])

    except Exception as e:
        print(f"NEWS ERROR: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Run on 0.0.0.0 to be accessible from local network (e.g. phone)
    app.run(host='0.0.0.0', port=5001, debug=True)
