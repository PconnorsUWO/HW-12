import os
import jwt
import bcrypt
import sqlite3
from datetime import datetime, timedelta
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
from werkzeug.utils import secure_filename
from ocr.main import run_pipeline

app = Flask(__name__)
CORS(app)

# Configure upload folder
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'your-secret-key-change-this')

# Database initialization happens in init_db() - see database.py

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

from cloudflare_client import CloudflareD1Client

# Cloudflare Worker handles database operations
db_client = CloudflareD1Client()

@app.route('/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    allergies = data.get('allergies', [])
    
    if not username or not password:
        return jsonify({'error': 'Username and password required'}), 400
    
    if len(username) < 3:
        return jsonify({'error': 'Username must be at least 3 characters'}), 400
    
    if len(password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters'}), 400
    
    # Hash password
    password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    # Store user via Cloudflare Worker
    result, status_code = db_client.register_user(username, password_hash, allergies)
    
    if status_code == 201:
        return jsonify({'message': 'User created successfully'}), 201
    else:
        return jsonify(result), status_code

@app.route('/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({'error': 'Username and password required'}), 400
    
    # Get user from Cloudflare Worker
    user_data, status_code = db_client.get_user(username)
    
    if status_code != 200:
        return jsonify({'error': 'Invalid credentials'}), 401
    
    # Check password
    if not bcrypt.checkpw(password.encode('utf-8'), user_data['password_hash'].encode('utf-8')):
        return jsonify({'error': 'Invalid credentials'}), 401
    
    # Generate JWT token
    token_payload = {
        'user_id': user_data['id'],
        'username': user_data['username'],
        'exp': datetime.utcnow() + timedelta(days=30)
    }
    
    token = jwt.encode(token_payload, app.config['SECRET_KEY'], algorithm='HS256')
    
    return jsonify({
        'token': token,
        'userId': user_data['id']
    })

@app.route('/user/allergies', methods=['GET'])
def get_user_allergies():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'error': 'Authorization required'}), 401
    
    token = auth_header.split(' ')[1]
    
    try:
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        user_id = payload['user_id']
        
        # Get allergies from Cloudflare Worker
        result, status_code = db_client.get_allergies(user_id)
        return jsonify(result), status_code
        
    except jwt.ExpiredSignatureError:
        return jsonify({'error': 'Token expired'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'error': 'Invalid token'}), 401

@app.route('/user/allergies', methods=['PUT'])
def update_user_allergies():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'error': 'Authorization required'}), 401
    
    token = auth_header.split(' ')[1]
    
    try:
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        user_id = payload['user_id']
        
        data = request.get_json()
        allergies = data.get('allergies', [])
        
        # Update allergies via Cloudflare Worker
        result, status_code = db_client.update_allergies(user_id, allergies)
        return jsonify(result), status_code
        
    except jwt.ExpiredSignatureError:
        return jsonify({'error': 'Token expired'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'error': 'Invalid token'}), 401

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