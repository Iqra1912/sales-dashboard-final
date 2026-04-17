import os
from datetime import timedelta
from dotenv import load_dotenv

# Load .env file (should be done early)
load_dotenv()

# ────────────────────────────────────────────────
# Base paths — choose ONE style and be consistent
# ────────────────────────────────────────────────

# Most common & recommended: one level up from app/
# (so if structure is backend2.0/app/config.py → backend2.0/ is the base)
BASE_DIR = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))

# Alternative (if you prefer the project root explicitly):
# PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))

# We'll use BASE_DIR below

class Config:
    # Security
    SECRET_KEY = os.getenv('SECRET_KEY') or 'dev-key-change-me-please-replace-in-prod'

    # Database
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL') or \
        'sqlite:///' + os.path.join(BASE_DIR, 'instance', 'database.db')
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # File uploads
    UPLOAD_FOLDER = os.path.join(BASE_DIR, 'app', 'data', 'uploads')
    ALLOWED_EXTENSIONS = {'xlsx', 'xls', 'csv'}
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024   # 16 MiB

    # Google OAuth
    GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID') or 'your-google-client-id'
    GOOGLE_CLIENT_SECRET = os.getenv('GOOGLE_CLIENT_SECRET') or 'your-google-client-secret'

    # JWT (if you're using it)
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY') or 'salesvista-secret-key-2026'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=12)

    # Email (Flask-Mail or similar)
    MAIL_SERVER = os.getenv('MAIL_SERVER') or 'smtp.gmail.com'
    MAIL_PORT = int(os.getenv('MAIL_PORT') or 587)
    MAIL_USE_TLS = os.getenv('MAIL_USE_TLS', 'True').lower() in ('true', '1', 'yes')
    MAIL_USERNAME = os.getenv('MAIL_USERNAME') or 'test@gmail.com'
    MAIL_PASSWORD = os.getenv('MAIL_PASSWORD') or 'testpassword'
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    # Optional: remember this setting if you use Flask-Login long sessions
    # PERMANENT_SESSION_LIFETIME = timedelta(days=14)
    SESSION_COOKIE_SAMESITE = 'Lax'
    SESSION_COOKIE_SECURE = False  # Keep False for localhost
    CORS_HEADERS = 'Content-Type'
