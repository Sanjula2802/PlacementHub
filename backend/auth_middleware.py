import re
import datetime
from functools import wraps
import jwt
import bcrypt
from flask import request, jsonify, g
from backend.config import Config
from backend.models import User

# Regex definitions
EMAIL_REGEX = re.compile(r'^[a-zA-Z0-9._%+-]+@mlrit\.ac\.in$', re.IGNORECASE)
STUDENT_ID_REGEX = re.compile(r'^\d{2}[A-Za-z0-9]{8}$')

def hash_password(password: str) -> str:
    """Hashes a plaintext password using bcrypt."""
    salt = bcrypt.gensalt(rounds=10)
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def check_password(password: str, hashed: str) -> bool:
    """Verifies a plaintext password against a bcrypt hash."""
    try:
        return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))
    except Exception:
        return False

def generate_jwt_token(user: User) -> str:
    """Generates a secure JWT token containing user identity and role."""
    payload = {
        'id': user.id,
        'email': user.email,
        'role': user.role,
        'isSuperAdmin': user.is_super_admin,
        'adminStatus': user.admin_status,
        'exp': datetime.datetime.utcnow() + Config.JWT_ACCESS_TOKEN_EXPIRES,
        'iat': datetime.datetime.utcnow()
    }
    return jwt.encode(payload, Config.JWT_SECRET_KEY, algorithm='HS256')

def decode_jwt_token(token: str):
    """Decodes a JWT token. Returns payload dict or None if invalid/expired."""
    try:
        return jwt.decode(token, Config.JWT_SECRET_KEY, algorithms=['HS256'])
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def validate_password_complexity(password: str) -> bool:
    """Requires at least 8 chars, 1 uppercase, 1 lowercase, 1 number, and 1 special char."""
    if not password or len(password) < 8:
        return False
    if not re.search(r'[A-Z]', password):
        return False
    if not re.search(r'[a-z]', password):
        return False
    if not re.search(r'\d', password):
        return False
    if not re.search(r'[@$!%*?&#^()_\-+={}\[\]|:;"\'<>,.?/~`]', password):
        return False
    return True

def get_token_from_header():
    auth_header = request.headers.get('Authorization', '')
    if auth_header.startswith('Bearer '):
        return auth_header.split(' ', 1)[1].strip()
    return None

def jwt_required(optional=False):
    """Decorator to require a valid JWT token."""
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            token = get_token_from_header()
            if not token:
                if optional:
                    g.current_user = None
                    return fn(*args, **kwargs)
                return jsonify({'success': False, 'error': 'Authentication required. Please log in.'}), 401

            payload = decode_jwt_token(token)
            if not payload:
                if optional:
                    g.current_user = None
                    return fn(*args, **kwargs)
                return jsonify({'success': False, 'error': 'Session expired or token invalid. Please log in again.', 'code': 'TOKEN_EXPIRED_OR_INVALID'}), 401

            user = User.query.get(payload.get('id'))
            if not user:
                return jsonify({'success': False, 'error': 'User account not found.'}), 401

            g.current_user = user
            return fn(*args, **kwargs)
        return wrapper
    return decorator

def admin_required():
    """Decorator ensuring that only authorized administrators can access the endpoint."""
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            token = get_token_from_header()
            if not token:
                return jsonify({'success': False, 'error': 'Administrator authentication required.', 'code': 'UNAUTHORIZED'}), 401

            payload = decode_jwt_token(token)
            if not payload:
                return jsonify({'success': False, 'error': 'Session expired or invalid.', 'code': 'TOKEN_EXPIRED_OR_INVALID'}), 401

            user = User.query.get(payload.get('id'))
            if not user or user.role != 'admin':
                return jsonify({'success': False, 'error': 'Access denied: Administrator privileges required.', 'code': 'FORBIDDEN'}), 403

            if not user.is_verified:
                return jsonify({'success': False, 'error': 'Administrator email verification required.', 'code': 'VERIFICATION_REQUIRED'}), 403

            g.current_user = user
            return fn(*args, **kwargs)
        return wrapper
    return decorator

def student_required():
    """Decorator ensuring that only students can access student-specific personal endpoints."""
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            token = get_token_from_header()
            if not token:
                return jsonify({'success': False, 'error': 'Student authentication required.'}), 401

            payload = decode_jwt_token(token)
            if not payload:
                return jsonify({'success': False, 'error': 'Session expired.', 'code': 'TOKEN_EXPIRED_OR_INVALID'}), 401

            user = User.query.get(payload.get('id'))
            if not user or user.role != 'student':
                return jsonify({'success': False, 'error': 'Access denied: Student access only.'}), 403

            g.current_user = user
            return fn(*args, **kwargs)
        return wrapper
    return decorator
