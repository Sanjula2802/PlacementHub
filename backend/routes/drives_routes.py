import json
from datetime import datetime
from flask import Blueprint, request, jsonify, g
from backend.database import db
from backend.models import PlacementDrive, DriveRegistration, User
from backend.auth_middleware import jwt_required, admin_required, student_required

drives_bp = Blueprint('drives', __name__, url_prefix='/api/drives')

@drives_bp.route('', methods=['GET'])
@jwt_required(optional=True)
def get_drives():
    current_student_id = g.current_user.id if getattr(g, 'current_user', None) and g.current_user.role == 'student' else None
    drives = PlacementDrive.query.order_by(PlacementDrive.created_at.desc()).all()
    return jsonify({
        'success': True,
        'drives': [d.to_dict(current_student_id) for d in drives]
    }), 200

@drives_bp.route('/<drive_id>', methods=['GET'])
@jwt_required(optional=True)
def get_drive(drive_id):
    current_student_id = g.current_user.id if getattr(g, 'current_user', None) and g.current_user.role == 'student' else None
    drive = PlacementDrive.query.get(drive_id)
    if not drive:
        return jsonify({'success': False, 'error': 'Placement drive not found.'}), 404
    return jsonify({
        'success': True,
        'drive': drive.to_dict(current_student_id)
    }), 200

@drives_bp.route('', methods=['POST'])
@admin_required()
def create_drive():
    data = request.get_json() or {}
    company = data.get('company', '').strip()
    role = data.get('role', '').strip()

    if not company or not role:
        return jsonify({'success': False, 'error': 'Company name and Role are required.'}), 400

    count = PlacementDrive.query.count() + 1
    drive_id = data.get('id') or f"DRV-2026-{str(count).padStart(3, '0') if hasattr(str(count), 'padStart') else f'{count:03d}'}"

    allowed_branches = data.get('allowedBranches', [])
    skills_required = data.get('skillsRequired', [])

    new_drive = PlacementDrive(
        id=drive_id,
        company=company,
        role=role,
        package=data.get('package', 'TBD'),
        package_value=float(data.get('packageValue') or 0.0),
        tier=data.get('tier', 'Tier 1'),
        location=data.get('location', 'Hyderabad'),
        eligibility=data.get('eligibility', 'CGPA >= 7.0'),
        min_cgpa=float(data.get('minCgpa') or 7.0),
        allowed_branches=json.dumps(allowed_branches if isinstance(allowed_branches, list) else []),
        drive_date=data.get('driveDate', datetime.utcnow().strftime('%Y-%m-%d')),
        deadline=data.get('deadline', datetime.utcnow().strftime('%Y-%m-%d')),
        venue=data.get('venue', 'Campus Auditorium / Virtual'),
        selection_process=data.get('selectionProcess', 'Test -> Technical -> HR'),
        description=data.get('description', ''),
        skills_required=json.dumps(skills_required if isinstance(skills_required, list) else []),
        vacancies=str(data.get('vacancies', 'Open')),
        status=data.get('status', 'Upcoming')
    )
    db.session.add(new_drive)
    db.session.commit()

    return jsonify({
        'success': True,
        'message': f"Placement drive for {company} created successfully.",
        'drive': new_drive.to_dict()
    }), 201

@drives_bp.route('/<drive_id>', methods=['PUT'])
@admin_required()
def update_drive(drive_id):
    drive = PlacementDrive.query.get(drive_id)
    if not drive:
        return jsonify({'success': False, 'error': 'Drive not found.'}), 404

    data = request.get_json() or {}
    if 'company' in data: drive.company = data['company']
    if 'role' in data: drive.role = data['role']
    if 'package' in data: drive.package = data['package']
    if 'packageValue' in data: drive.package_value = float(data['packageValue'] or 0.0)
    if 'tier' in data: drive.tier = data['tier']
    if 'location' in data: drive.location = data['location']
    if 'eligibility' in data: drive.eligibility = data['eligibility']
    if 'minCgpa' in data: drive.min_cgpa = float(data['minCgpa'] or 0.0)
    if 'allowedBranches' in data: drive.allowed_branches = json.dumps(data['allowedBranches'])
    if 'driveDate' in data: drive.drive_date = data['driveDate']
    if 'deadline' in data: drive.deadline = data['deadline']
    if 'venue' in data: drive.venue = data['venue']
    if 'selectionProcess' in data: drive.selection_process = data['selectionProcess']
    if 'description' in data: drive.description = data['description']
    if 'skillsRequired' in data: drive.skills_required = json.dumps(data['skillsRequired'])
    if 'vacancies' in data: drive.vacancies = str(data['vacancies'])
    if 'status' in data: drive.status = data['status']

    db.session.commit()
    return jsonify({
        'success': True,
        'message': 'Drive updated successfully.',
        'drive': drive.to_dict()
    }), 200

@drives_bp.route('/<drive_id>', methods=['DELETE'])
@admin_required()
def delete_drive(drive_id):
    drive = PlacementDrive.query.get(drive_id)
    if not drive:
        return jsonify({'success': False, 'error': 'Drive not found.'}), 404

    db.session.delete(drive)
    db.session.commit()
    return jsonify({
        'success': True,
        'message': 'Placement drive deleted successfully.'
    }), 200

@drives_bp.route('/<drive_id>/register', methods=['POST'])
@student_required()
def register_for_drive(drive_id):
    drive = PlacementDrive.query.get(drive_id)
    if not drive:
        return jsonify({'success': False, 'error': 'Drive not found.'}), 404

    student = g.current_user
    existing_reg = DriveRegistration.query.filter_by(drive_id=drive_id, student_id=student.id).first()

    if existing_reg:
        # Deregister
        db.session.delete(existing_reg)
        db.session.commit()
        return jsonify({
            'success': True,
            'isRegistered': False,
            'message': f"Deregistered from {drive.company} drive.",
            'drive': drive.to_dict(student.id)
        }), 200
    else:
        # Check eligibility: CGPA
        if student.cgpa and drive.min_cgpa and student.cgpa < drive.min_cgpa:
            return jsonify({
                'success': False,
                'error': f"Minimum CGPA of {drive.min_cgpa} required for this drive (Your CGPA: {student.cgpa})."
            }), 400

        new_reg = DriveRegistration(
            drive_id=drive_id,
            student_id=student.id,
            status='Registered'
        )
        db.session.add(new_reg)
        db.session.commit()
        return jsonify({
            'success': True,
            'isRegistered': True,
            'message': f"Registered successfully for {drive.company} drive!",
            'drive': drive.to_dict(student.id)
        }), 200
