import os
from sqlalchemy import text
from flask_sqlalchemy import SQLAlchemy
from backend.config import Config

db = SQLAlchemy()
_db_initialized = False

def test_database_connection():
    """
    Attempts to connect directly to the configured SQLite database.
    Returns (True, None) if successful, or (False, error_message) if failed.
    """
    try:
        with db.engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True, None
    except Exception as e:
        return False, str(e)

def setup_database_tables(app):
    """
    Creates tables and seeds initial data if database is empty.
    Preserves all existing data.
    """
    global _db_initialized
    if _db_initialized:
        return True, None

    try:
        os.makedirs(Config.INSTANCE_DIR, exist_ok=True)
        with app.app_context():
            db.create_all()
            from backend.seed import seed_database
            seed_database()
        _db_initialized = True
        return True, None
    except Exception as e:
        return False, str(e)

def init_db(app):
    """
    Initializes Flask-SQLAlchemy with the SQLite database URI.
    """
    os.makedirs(Config.INSTANCE_DIR, exist_ok=True)
    app.config['SQLALCHEMY_DATABASE_URI'] = Config.SQLALCHEMY_DATABASE_URI
    db.init_app(app)

    with app.app_context():
        connected, err = setup_database_tables(app)
        if connected:
            print(f"[Database] Successfully initialized SQLite at {Config.SQLITE_DB_PATH}")
        else:
            print(f"[Database Error] SQLite initialization failed: {err}")
