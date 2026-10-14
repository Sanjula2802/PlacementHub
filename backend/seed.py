import os
from backend.database import db
from backend.models import User
from backend.config import Config
from backend.auth_middleware import hash_password

def seed_database():
    """
    Ensures essential system administrative accounts exist.
    Prevents demo/sample content from being reinserted on application startup.
    Preserves all existing student accounts and permanent records.
    In production, prevents known default passwords from being used.
    """
    admin_exists = User.query.filter_by(role='admin').first()
    if admin_exists:
        # Administrative credentials already exist in database; preserve untouched
        return

    # In production, require INITIAL_ADMIN_PASSWORD environment variable
    if Config.IS_PRODUCTION:
        initial_admin_password = os.getenv('INITIAL_ADMIN_PASSWORD')
        if not initial_admin_password:
            raise RuntimeError(
                "[CRITICAL CONFIGURATION ERROR] A fresh production deployment requires the "
                "'INITIAL_ADMIN_PASSWORD' environment variable to be explicitly set to initialize "
                "the primary administrator account securely. A known default password cannot be used."
            )
    else:
        # Development / local mode initial fallback
        initial_admin_password = os.getenv('INITIAL_ADMIN_PASSWORD', 'AdminSecure@2026')

    print("[System Init] Setting up primary administrative account...")

    super_admin = User(
        id='usr_admin_default_01',
        full_name='Placement Officer',
        email=os.getenv('ADMIN_EMAIL', 'faculty.placement@mlrit.ac.in'),
        role='admin',
        admin_id=os.getenv('ADMIN_ID', 'ADM101'),
        department='Placement Cell',
        password_hash=hash_password(initial_admin_password),
        is_verified=True,
        is_super_admin=True,
        admin_status='ACTIVE'
    )
    db.session.add(super_admin)
    db.session.commit()
    print("[System Init] Primary placement administrator account ready.")
