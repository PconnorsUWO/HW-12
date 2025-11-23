import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'app.db')

def init_db():
    """Initialize the database with required tables"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Allergies table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS allergies (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            allergy TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    ''')
    
    conn.commit()
    conn.close()

def get_connection():
    """Get a database connection"""
    return sqlite3.connect(DB_PATH)
