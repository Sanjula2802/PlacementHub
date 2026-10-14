import json
from datetime import datetime
from flask import Blueprint, request, jsonify, g
from backend.database import db
from backend.models import Internship, InternshipApplication
from backend.auth_middleware import jwt_required, admin_required, student_required

internships_bp = Blueprint('internships', __name__, url_prefix='/api/internships')

@internships_bp.route('', methods=['GET'])
@jwt_required(optional=True)
def get_internships():
    current_student_id = g.current_user.id if getattr(g, 'current_user', None) and g.current_user.role == 'student' else None
    internships = Internship.query.order_by(Internship.id.desc()).all()
    return jsonify({
        'success': True,
        'internships': [item.to_dict(current_student_id) for item in internships]
    }), 200

@internships_bp.route('', methods=['POST'])
@admin_required()
def create_internship():
    data = request.get_json() or {}
    title = data.get('title', '').strip()
    company = data.get('company', '').strip()

    if not title or not company:
        return jsonify({'success': False, 'error': 'Title and Company are required.'}), 400

    count = Internship.query.count() + 201
    internship_id = data.get('id') or f"INT-2026-{count}"

    allowed_branches = data.get('allowedBranches', [])
    skills_required = data.get('skillsRequired', [])

    new_item = Internship(
        id=internship_id,
        title=title,
        company=company,
        location=data.get('location', 'Hyderabad'),
        duration=data.get('duration', '6 Months'),
        stipend=data.get('stipend', '₹25,000 / month'),
        min_cgpa=float(data.get('minCgpa') or 6.5),
        allowed_branches=json.dumps(allowed_branches if isinstance(allowed_branches, list) else []),
        skills_required=json.dumps(skills_required if isinstance(skills_required, list) else []),
        description=data.get('description', ''),
        requirements=data.get('requirements', ''),
        deadline=data.get('deadline', datetime.utcnow().strftime('%Y-%m-%d')),
        posted_date=data.get('postedDate', datetime.utcnow().strftime('%Y-%m-%d')),
        status='Active'
    )
    db.session.add(new_item)
    db.session.commit()

    return jsonify({
        'success': True,
        'message': f"Internship {title} posted successfully.",
        'internship': new_item.to_dict()
    }), 201

@internships_bp.route('/<internship_id>', methods=['PUT'])
@admin_required()
def update_internship(internship_id):
    item = Internship.query.get(internship_id)
    if not item:
        return jsonify({'success': False, 'error': 'Internship not found.'}), 404

    data = request.get_json() or {}
    if 'title' in data: item.title = data['title']
    if 'company' in data: item.company = data['company']
    if 'location' in data: item.location = data['location']
    if 'duration' in data: item.duration = data['duration']
    if 'stipend' in data: item.stipend = data['stipend']
    if 'minCgpa' in data: item.min_cgpa = float(data['minCgpa'] or 0.0)
    if 'allowedBranches' in data: item.allowed_branches = json.dumps(data['allowedBranches'])
    if 'skillsRequired' in data: item.skills_required = json.dumps(data['skillsRequired'])
    if 'description' in data: item.description = data['description']
    if 'requirements' in data: item.requirements = data['requirements']
    if 'deadline' in data: item.deadline = data['deadline']
    if 'status' in data: item.status = data['status']

    db.session.commit()
    return jsonify({
        'success': True,
        'message': 'Internship updated successfully.',
        'internship': item.to_dict()
    }), 200

@internships_bp.route('/<internship_id>', methods=['DELETE'])
@admin_required()
def delete_internship(internship_id):
    item = Internship.query.get(internship_id)
    if not item:
        return jsonify({'success': False, 'error': 'Internship not found.'}), 404

    db.session.delete(item)
    db.session.commit()
    return jsonify({
        'success': True,
        'message': 'Internship removed successfully.'
    }), 200

@internships_bp.route('/<internship_id>/apply', methods=['POST'])
@student_required()
def apply_for_internship(internship_id):
    item = Internship.query.get(internship_id)
    if not item:
        return jsonify({'success': False, 'error': 'Internship not found.'}), 404

    student = g.current_user
    existing_app = InternshipApplication.query.filter_by(internship_id=internship_id, student_id=student.id).first()

    if existing_app:
        db.session.delete(existing_app)
        db.session.commit()
        return jsonify({
            'success': True,
            'hasApplied': False,
            'message': f"Application withdrawn for {item.title}",
            'internship': item.to_dict(student.id)
        }), 200
    else:
        new_app = InternshipApplication(
            internship_id=internship_id,
            student_id=student.id,
            status='Applied'
        )
        db.session.add(new_app)
        db.session.commit()
        return jsonify({
            'success': True,
            'hasApplied': True,
            'message': f"Applied for {item.title} successfully!",
            'internship': item.to_dict(student.id)
        }), 200
