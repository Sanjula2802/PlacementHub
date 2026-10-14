import secrets
import random
from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify, g
from backend.database import db
from backend.config import Config
from backend.models import (
    User, StudentProfile, AttendanceRecord, VerificationToken,
    AdminAccessSession, AdminInvitation
)
from backend.auth_middleware import (
    hash_password, check_password, generate_jwt_token,
    validate_password_complexity, EMAIL_REGEX, STUDENT_ID_REGEX,
    jwt_required
)

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

# ==========================================
# 1. STUDENT SIGNUP (PUBLIC - NO VERIFICATION CODE REQUIRED)
# ==========================================
@auth_bp.route('/student/signup', methods=['POST'])
def student_signup():
    data = request.get_json() or {}

    full_name = (data.get('fullName') or '').strip()
    student_id = (data.get('studentId') or '').strip().upper()
    email = (data.get('email') or '').strip().lower()
    department = (data.get('department') or '').strip()
    section = (data.get('section') or '').strip().upper()
    year = (data.get('year') or '').strip()
    password = data.get('password') or ''

    # 1. Name validation
    if not full_name:
        return jsonify({'success': False, 'error': 'Full Name is required.'}), 400

    # 2. Student ID validation
    if not STUDENT_ID_REGEX.match(student_id):
        return jsonify({
            'success': False,
            'error': 'Please enter a valid 10-character Student ID (e.g., 22R11A0501).'
        }), 400

    # 3. MLRIT College Email validation
    if not EMAIL_REGEX.match(email):
        return jsonify({
            'success': False,
            'error': 'Please use your official MLRIT college email (e.g., [studentId]@mlrit.ac.in).'
        }), 400

    # 4. Student ID and Email match
    email_prefix = email.split('@')[0].upper()
    if email_prefix != student_id:
        return jsonify({
            'success': False,
            'error': 'Student ID and college email do not match.'
        }), 400

    # 5. Department validation (CSE, CSE-AI/ML, CSE-DS, ECE, EEE, MECH, AERO)
    if department not in Config.ALLOWED_DEPARTMENTS:
        return jsonify({
            'success': False,
            'error': f'Please select a valid branch ({", ".join(Config.ALLOWED_DEPARTMENTS)}).'
        }), 400

    # 6. Section validation (A-G)
    if section not in Config.ALLOWED_SECTIONS:
        return jsonify({
            'success': False,
            'error': f'Please select a valid section ({", ".join(Config.ALLOWED_SECTIONS)}).'
        }), 400

    # 7. Year validation (3rd Year, 4th Year)
    if year not in Config.ALLOWED_YEARS:
        return jsonify({
            'success': False,
            'error': f'Please select a valid year ({", ".join(Config.ALLOWED_YEARS)}).'
        }), 400

    # 8. Password complexity
    if not validate_password_complexity(password):
        return jsonify({
            'success': False,
            'error': 'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.'
        }), 400

    # 9. Duplicate check
    existing_user = User.query.filter(
        (User.student_id == student_id) | (User.email == email)
    ).first()
    if existing_user:
        return jsonify({
            'success': False,
            'error': 'An account with this Student ID or email already exists.'
        }), 400

    # 10. Create student user (is_verified = True immediately as requested)
    user_id = f"usr_{int(datetime.utcnow().timestamp() * 1000)}_{secrets.token_hex(3)}"
    new_student = User(
        id=user_id,
        full_name=full_name,
        email=email,
        role='student',
        student_id=student_id,
        department=department,
        section=section,
        year=year,
        password_hash=hash_password(password),
        is_verified=True, # STUDENTS REQUIRE NO VERIFICATION CODE
        is_super_admin=False
    )
    db.session.add(new_student)

    # Create associated profile
    profile = StudentProfile(
        user_id=new_student.id,
        placement_status='Not Placed',
        active_backlogs=0,
        applications_count=0,
        offers_count=0
    )
    db.session.add(profile)

    # Create default attendance record
    att = AttendanceRecord(
        student_id=new_student.id,
        aptitude=85,
        technical=85,
        softskills=85,
        mock=85,
        overall=85,
        status='Eligible'
    )
    db.session.add(att)

    db.session.commit()

    # Generate JWT token so student can proceed directly to dashboard/login
    token = generate_jwt_token(new_student)

    return jsonify({
        'success': True,
        'message': 'Student account registered successfully! You may now log in.',
        'user': new_student.to_dict(),
        'token': token,
        'email': email,
        'studentId': student_id
    }), 201


# ==========================================
# 2. ADMIN ACCESS CODE VALIDATION
# ==========================================
@auth_bp.route('/admin/validate-access-code', methods=['POST'])
def validate_admin_access_code():
    data = request.get_json() or {}
    access_code = data.get('accessCode', '').strip()

    if not access_code:
        return jsonify({'success': False, 'error': 'Please enter the administrative access code.'}), 400

    if access_code != Config.ADMIN_ACCESS_CODE:
        return jsonify({'success': False, 'error': 'Invalid access code. Please verify credentials with TPO.'}), 403

    # Generate temporary access session token
    session_token = f"adm_sess_{secrets.token_urlsafe(32)}"
    expires_at = datetime.utcnow() + timedelta(minutes=15)

    session = AdminAccessSession(
        token=session_token,
        expires_at=expires_at,
        used=False
    )
    db.session.add(session)
    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'Access code validated successfully.',
        'accessSessionToken': session_token
    }), 200


# ==========================================
# 3. ADMIN SIGNUP (REQUIRES ACCESS CODE & MANDATORY EMAIL VERIFICATION)
# ==========================================
@auth_bp.route('/admin/signup', methods=['POST'])
def admin_signup():
    data = request.get_json() or {}

    access_session_token = (data.get('accessSessionToken') or '').strip()
    full_name = (data.get('fullName') or '').strip()
    admin_id = (data.get('adminId') or '').strip().upper()
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''

    # 1. Validate session token
    if not access_session_token:
        return jsonify({'success': False, 'error': 'Admin access authorization code session missing or expired.'}), 403

    session = AdminAccessSession.query.filter_by(token=access_session_token, used=False).first()
    if not session or session.expires_at < datetime.utcnow():
        return jsonify({'success': False, 'error': 'Admin access session expired. Please re-enter the access code.'}), 403

    # 2. Name validation
    if not full_name:
        return jsonify({'success': False, 'error': 'Full Name is required.'}), 400

    # 3. Admin ID validation
    if not admin_id or len(admin_id) < 3:
        return jsonify({'success': False, 'error': 'Admin ID is required (e.g., ADM101).'}), 400

    # 4. Email validation
    if not EMAIL_REGEX.match(email):
        return jsonify({'success': False, 'error': 'Administrator email must belong to the @mlrit.ac.in domain.'}), 400

    # 5. Password complexity
    if not validate_password_complexity(password):
        return jsonify({
            'success': False,
            'error': 'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.'
        }), 400

    # 6. Duplicate check
    existing = User.query.filter((User.admin_id == admin_id) | (User.email == email)).first()
    if existing:
        return jsonify({'success': False, 'error': 'An administrator account with this Admin ID or email already exists.'}), 400

    # Mark session token as used
    session.used = True

    # 7. Create admin user (MANDATORY EMAIL VERIFICATION REQUIRED: is_verified=False)
    user_id = f"usr_{int(datetime.utcnow().timestamp() * 1000)}_{secrets.token_hex(3)}"
    new_admin = User(
        id=user_id,
        full_name=full_name,
        email=email,
        role='admin',
        admin_id=admin_id,
        department='Placement Cell',
        password_hash=hash_password(password),
        is_verified=False, # ADMINS MANDATORILY REQUIRE EMAIL VERIFICATION
        is_super_admin=False,
        admin_status='ACTIVE'
    )
    db.session.add(new_admin)

    # 8. Generate 6-digit numeric verification code
    code = f"{random.randint(100000, 999999)}"
    token = VerificationToken(
        email=email,
        code=code,
        expires_at=datetime.utcnow() + timedelta(minutes=20)
    )
    db.session.add(token)

    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'Admin account registered successfully! A 6-digit verification code has been dispatched to your email address.',
        'email': email,
        'adminId': admin_id,
        'verificationCode': code # Provided for testing simulation
    }), 201


# ==========================================
# 4. EMAIL VERIFICATION (FOR ADMIN ACCOUNTS)
# ==========================================
@auth_bp.route('/verify-email', methods=['POST'])
def verify_email():
    data = request.get_json() or {}
    email = (data.get('email') or '').strip().lower()
    code = (data.get('code') or '').strip()

    if not email or not code:
        return jsonify({'success': False, 'error': 'Email and verification code are required.'}), 400

    token_record = VerificationToken.query.filter_by(email=email, code=code).order_by(VerificationToken.id.desc()).first()
    if not token_record:
        return jsonify({'success': False, 'error': 'Invalid verification code.'}), 400

    if token_record.expires_at < datetime.utcnow():
        return jsonify({'success': False, 'error': 'Verification code has expired. Please request a new one.'}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'success': False, 'error': 'User not found.'}), 404

    user.is_verified = True
    # Clean up token
    db.session.delete(token_record)
    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'Email verified successfully! You may now log in.',
        'adminStatus': user.admin_status
    }), 200


# ==========================================
# 5. RESEND VERIFICATION CODE (ADMIN)
# ==========================================
@auth_bp.route('/resend-verification', methods=['POST'])
def resend_verification():
    data = request.get_json() or {}
    email = (data.get('email') or '').strip().lower()

    if not email:
        return jsonify({'success': False, 'error': 'Email is required.'}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'success': False, 'error': 'No account found with this email.'}), 404

    if user.is_verified:
        return jsonify({'success': False, 'error': 'This account is already verified. Please log in.'}), 400

    code = f"{random.randint(100000, 999999)}"
    token = VerificationToken(
        email=email,
        code=code,
        expires_at=datetime.utcnow() + timedelta(minutes=20)
    )
    db.session.add(token)
    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'A fresh verification code has been dispatched.',
        'verificationCode': code
    }), 200


# ==========================================
# 6. LOGIN (STUDENT & ADMIN)
# ==========================================
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    identifier = (data.get('identifier') or '').strip()
    password = data.get('password') or ''
    portal = data.get('portal', 'student')

    if not identifier or not password:
        return jsonify({'success': False, 'error': 'Please enter your ID/email and password.'}), 400

    # Find user by email, student_id, or admin_id
    user = User.query.filter(
        (User.email == identifier.lower()) |
        (User.student_id == identifier.upper()) |
        (User.admin_id == identifier.upper())
    ).first()

    if not user:
        return jsonify({'success': False, 'error': 'Invalid ID/email or password.'}), 401

    # Verify password hash
    if not check_password(password, user.password_hash):
        return jsonify({'success': False, 'error': 'Invalid ID/email or password.'}), 401

    # Admin Email Verification Check
    if user.role == 'admin' and not user.is_verified:
        return jsonify({
            'success': False,
            'error': 'Email verification required before login. Please verify your administrator email.',
            'requiresVerification': True,
            'email': user.email
        }), 403

    # Portal role authorization check
    if portal == 'admin' and user.role != 'admin':
        return jsonify({
            'success': False,
            'error': 'Access denied: This account does not have administrator privileges.',
            'code': 'FORBIDDEN'
        }), 403

    if portal == 'student' and user.role != 'student':
        return jsonify({
            'success': False,
            'error': 'Access denied: Administrator accounts must log in via the Admin Console.',
            'code': 'FORBIDDEN'
        }), 403

    # Issue JWT token
    token = generate_jwt_token(user)

    return jsonify({
        'success': True,
        'message': f"Welcome back, {user.full_name}!",
        'user': user.to_dict(),
        'token': token
    }), 200


# ==========================================
# 7. GET AUTHENTICATED USER SESSION
# ==========================================
@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_me():
    return jsonify({
        'success': True,
        'user': g.current_user.to_dict()
    }), 200


# ==========================================
# 8. POLICY STATUS FOR ADMINS
# ==========================================
@auth_bp.route('/admin/policy-status', methods=['GET'])
def get_policy_status():
    return jsonify({
        'isPolicyConfigured': True,
        'policyType': 'CONFIGURED',
        'domain': '@mlrit.ac.in'
    }), 200
