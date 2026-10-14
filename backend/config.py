import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

class Config:
    ENV = os.getenv('FLASK_ENV', os.getenv('ENV', 'development')).lower()
    IS_PRODUCTION = ENV in ('production', 'prod')

    SECRET_KEY = os.getenv('SECRET_KEY')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY')
    ADMIN_ACCESS_CODE = os.getenv('ADMIN_ACCESS_CODE')

    # Security enforcement for production
    if IS_PRODUCTION:
        missing_vars = []
        if not SECRET_KEY:
            missing_vars.append('SECRET_KEY')
        if not JWT_SECRET_KEY:
            missing_vars.append('JWT_SECRET_KEY')
        if not ADMIN_ACCESS_CODE:
            missing_vars.append('ADMIN_ACCESS_CODE')

        if missing_vars:
            raise RuntimeError(
                f"[CRITICAL CONFIGURATION ERROR] The application is running in production mode (FLASK_ENV={ENV}), "
                f"but the following required security environment variables are missing: {', '.join(missing_vars)}. "
                f"You must configure these variables securely in your production environment before starting the application."
            )
    else:
        # Development mode fallback defaults (used only when .env is absent)
        if not SECRET_KEY:
            SECRET_KEY = 'dev_only_local_secret_key_not_for_production'
        if not JWT_SECRET_KEY:
            JWT_SECRET_KEY = 'dev_only_local_jwt_key_not_for_production'
        if not ADMIN_ACCESS_CODE:
            ADMIN_ACCESS_CODE = 'MLRIT@2026'

    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=7)

    # Allowed student validation rules
    ALLOWED_DEPARTMENTS = [
        'CSE',
        'CSE-AI/ML',
        'CSE-DS',
        'ECE',
        'EEE',
        'MECH',
        'AERO'
    ]
    ALLOWED_SECTIONS = ['A', 'B', 'C', 'D', 'E', 'F', 'G']
    ALLOWED_YEARS = ['3rd Year', '4th Year']

    # Database connection parameters (SQLite persistent file)
    BASE_DIR = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))
    INSTANCE_DIR = os.path.join(BASE_DIR, 'instance')
    SQLITE_DB_PATH = os.path.join(INSTANCE_DIR, 'placementhub.db')

    # SQLite connection URI
    SQLALCHEMY_DATABASE_URI = os.getenv(
        'DATABASE_URL',
        f"sqlite:///{SQLITE_DB_PATH.replace(os.sep, '/')}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {}
