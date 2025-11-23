import os
import requests

WORKER_URL = os.getenv('CLOUDFLARE_WORKER_URL', 'http://localhost:8787')
print(f"DEBUG: Cloudflare Client using URL: {WORKER_URL}")

class CloudflareD1Client:
    """Client for interacting with Cloudflare Worker D1 API"""
    
    @staticmethod
    def register_user(username, password_hash, allergies=None):
        """Register a new user in D1"""
        try:
            response = requests.post(
                f'{WORKER_URL}/register',
                json={
                    'username': username,
                    'password_hash': password_hash,
                    'allergies': allergies or []
                },
                timeout=10
            )
            return response.json(), response.status_code
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_user(username):
        """Get user by username from D1"""
        try:
            response = requests.post(
                f'{WORKER_URL}/login',
                json={'username': username},
                timeout=10
            )
            return response.json(), response.status_code
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_allergies(user_id):
        """Get user allergies from D1"""
        try:
            print(f"DEBUG: Fetching allergies for user {user_id} from {WORKER_URL}/allergies")
            response = requests.get(
                f'{WORKER_URL}/allergies',
                params={'userId': user_id},
                timeout=10
            )
            print(f"DEBUG: Worker response: {response.status_code} - {response.text}")
            return response.json(), response.status_code
        except Exception as e:
            print(f"DEBUG: Error fetching allergies: {str(e)}")
            return {'error': str(e)}, 500
    
    @staticmethod
    def update_allergies(user_id, allergies):
        """Update user allergies in D1"""
        try:
            response = requests.put(
                f'{WORKER_URL}/allergies',
                json={
                    'userId': user_id,
                    'allergies': allergies
                },
                timeout=10
            )
            return response.json(), response.status_code
        except Exception as e:
            return {'error': str(e)}, 500
