import os
from backend.database import db
from backend.models import User, StudentProfile, AttendanceRecord
from backend.config import Config
from backend.auth_middleware import hash_password

PRESERVED_STUDENTS = [
    {"id": "usr_student_sample_01", "full_name": "Rahul Varma", "email": "22r11a0599@mlrit.ac.in", "student_id": "22R11A0599", "department": "CSE", "section": "A", "year": "4th Year", "password_hash": "$2b$10$Yefkp6B/PN3XqqW/fAmjtOn4i6UG6Bg5f064NHzj4YzwTQySdup1K"},
    {"id": "usr_1791973608830_7fd0bf", "full_name": "Ananya Sharma", "email": "22r11a6199@mlrit.ac.in", "student_id": "22R11A6199", "department": "CSE-DS", "section": "B", "year": "4th Year", "password_hash": "$2b$10$sZQ3g3s59zM.Ea3K1ub94.Nak6sJqEkhkhjkQrrW0TZlWAdzicMOu"},
    {"id": "usr_1791975769823_cc301d", "full_name": "Ananya Sharma", "email": "22r11a1585@mlrit.ac.in", "student_id": "22R11A1585", "department": "CSE-DS", "section": "B", "year": "4th Year", "password_hash": "$2b$10$JS4QQu3iBDouFVBqmMcMCeugCqmqxJ.mwwb9efBB0Ru/4c1brPc6a"},
    {"id": "usr_1791976008693_c5321b", "full_name": "Sanjula", "email": "24r21a6681@mlrit.ac.in", "student_id": "24R21A6681", "department": "CSE-AI/ML", "section": "B", "year": "3rd Year", "password_hash": "$2b$10$OSjwi5CwB.YV0vkWAAKH6O.Y0RKb2Jlwn0izFHFtM2r4d2eYWYy1C"},
    {"id": "usr_1791976708097_064af2", "full_name": "Ananya Sharma", "email": "22r11a1797@mlrit.ac.in", "student_id": "22R11A1797", "department": "CSE-DS", "section": "B", "year": "4th Year", "password_hash": "$2b$10$b8A7YVaBrFf9e66YUaq6nuLDm/SEqQ36tnQTj5KBU0VdzfkmicLFi"},
    {"id": "usr_1791976756243_e44f9e", "full_name": "Ananya Sharma", "email": "22r11a9729@mlrit.ac.in", "student_id": "22R11A9729", "department": "CSE-DS", "section": "B", "year": "4th Year", "password_hash": "$2b$10$K17FcsyV0L0HIARQtYsMh.uHpSEpASnxvuWpdfbzISgDEDF4/Bj9u"},
    {"id": "usr_1791977789257_d1c909", "full_name": "Ananya Sharma", "email": "22r11a9325@mlrit.ac.in", "student_id": "22R11A9325", "department": "CSE-DS", "section": "B", "year": "4th Year", "password_hash": "$2b$10$z.tkRmKEzOEbwihajDW4vuKZy7mvqXT7zp5t7vpP6f/1OjQcU6HbS"},
    {"id": "usr_1791977847251_2ad018", "full_name": "Ananya Sharma", "email": "22r11a4088@mlrit.ac.in", "student_id": "22R11A4088", "department": "CSE-DS", "section": "B", "year": "4th Year", "password_hash": "$2b$10$Fif2aPcqPpSR1ncLTpm1kex8Bm9rl8KGXzMFab.MwpgLO1DWMcTJC"},
]

def seed_database():
    """
    Ensures essential system administrative accounts and verified student rosters exist.
    Prevents demo/sample content (drives, jobs, etc.) from being reinserted on application startup.
    Preserves all existing student accounts and permanent records across local and cloud instances.
    """
    # 1. Provision Primary Administrator if not exists
    admin_exists = User.query.filter_by(role='admin').first()
    if not admin_exists:
        if Config.IS_PRODUCTION:
            initial_admin_password = os.getenv('INITIAL_ADMIN_PASSWORD')
            if not initial_admin_password:
                raise RuntimeError(
                    "[CRITICAL CONFIGURATION ERROR] A fresh production deployment requires the "
                    "'INITIAL_ADMIN_PASSWORD' environment variable to be explicitly set to initialize "
                    "the primary administrator account securely. A known default password cannot be used."
                )
        else:
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

    # 2. Provision Preserved Student Accounts on fresh databases
    if not User.query.filter_by(role='student').first():
        print("[System Init] Initializing preserved student accounts roster...")
        for st in PRESERVED_STUDENTS:
            student_user = User(
                id=st['id'],
                full_name=st['full_name'],
                email=st['email'],
                role='student',
                student_id=st['student_id'],
                department=st['department'],
                section=st['section'],
                year=st['year'],
                password_hash=st['password_hash'],
                is_verified=True,
                is_super_admin=False
            )
            db.session.add(student_user)

            profile = StudentProfile(
                user_id=st['id'],
                skills='[]',
                placement_status='Not Placed',
                applications_count=0,
                offers_count=0
            )
            db.session.add(profile)

            att = AttendanceRecord(
                student_id=st['id'],
                aptitude=85,
                technical=85,
                softskills=85,
                mock=85,
                overall=85,
                status='Eligible'
            )
            db.session.add(att)

        db.session.commit()
        print(f"[System Init] {len(PRESERVED_STUDENTS)} student accounts initialized successfully.")
