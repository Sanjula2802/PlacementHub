import secrets
from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify, g
from backend.database import db
from backend.models import User, StudentProfile, AttendanceRecord, AdminInvitation, PlacementDrive, JobOpportunity
from backend.auth_middleware import admin_required

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')

@admin_bp.route('/students', methods=['GET'])
@admin_required()
def get_students():
    students = User.query.filter_by(role='student').order_by(User.full_name.asc()).all()
    results = []

    for s in students:
        p = s.profile
        att = s.attendance
        results.append({
            'id': s.student_id or s.id,
            'userId': s.id,
            'name': s.full_name,
            'email': s.email,
            'department': s.department or 'CSE',
            'section': s.section or 'A',
            'year': s.year or '4th Year',
            'cgpa': s.cgpa or 0.0,
            'phone': s.phone or '',
            'avatar': s.avatar or '',
            'status': p.placement_status if p else 'Not Placed',
            'offersCount': p.offers_count if p else 0,
            'currentOffer': p.current_offer if p else '',
            'activeBacklogs': p.active_backlogs if p else 0,
            'attendance': att.overall if att else 85
        })

    return jsonify({
        'success': True,
        'students': results
    }), 200

@admin_bp.route('/security-status', methods=['GET'])
@admin_required()
def get_security_status():
    admin = g.current_user
    total_students = User.query.filter_by(role='student').count()
    total_admins = User.query.filter_by(role='admin').count()
    total_drives = PlacementDrive.query.count()
    total_jobs = JobOpportunity.query.count()

    return jsonify({
        'success': True,
        'status': 'OPERATIONAL',
        'isSuperAdmin': admin.is_super_admin,
        'adminId': admin.admin_id,
        'email': admin.email,
        'department': admin.department,
        'metrics': {
            'totalStudents': total_students,
            'totalAdmins': total_admins,
            'totalDrives': total_drives,
            'totalJobs': total_jobs
        }
    }), 200

@admin_bp.route('/invitations', methods=['GET'])
@admin_required()
def get_invitations():
    invs = AdminInvitation.query.order_by(AdminInvitation.created_at.desc()).all()
    return jsonify({
        'success': True,
        'invitations': [i.to_dict() for i in invs]
    }), 200

@admin_bp.route('/invitations', methods=['POST'])
@admin_required()
def create_invitation():
    if not g.current_user.is_super_admin:
        return jsonify({'success': False, 'error': 'Only Super Administrators can issue official admin invitations.'}), 403

    data = request.get_json() or {}
    email = (data.get('email') or '').strip().lower()

    if not email:
        return jsonify({'success': False, 'error': 'Target email address is required.'}), 400

    token = secrets.token_hex(24)
    code = f"{secrets.randbelow(900000) + 100000}"
    inv_id = f"inv_{int(datetime.utcnow().timestamp() * 1000)}_{secrets.token_hex(2)}"

    inv = AdminInvitation(
        id=inv_id,
        email=email,
        token=token,
        code=code,
        invited_by=g.current_user.full_name or 'Super Admin',
        expires_at=datetime.utcnow() + timedelta(days=2),
        used=False
    )
    db.session.add(inv)
    db.session.commit()

    return jsonify({
        'success': True,
        'message': f"One-time admin invitation generated for {email}.",
        'invitation': inv.to_dict()
    }), 201
