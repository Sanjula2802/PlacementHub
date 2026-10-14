import json
from flask import Blueprint, request, jsonify, g
from backend.database import db
from backend.models import User, StudentProfile
from backend.auth_middleware import jwt_required

profile_bp = Blueprint('profile', __name__, url_prefix='/api/profile')

@profile_bp.route('', methods=['GET'])
@jwt_required()
def get_profile():
    user = g.current_user
    if user.role != 'student':
        return jsonify({
            'success': True,
            'profile': {
                'id': user.admin_id or user.id,
                'name': user.full_name,
                'email': user.email,
                'department': user.department or 'Placement Cell',
                'avatar': user.avatar or '',
                'role': user.role
            }
        }), 200

    profile = user.profile
    if not profile:
        profile = StudentProfile(user_id=user.id)
        db.session.add(profile)
        db.session.commit()

    return jsonify({
        'success': True,
        'profile': profile.to_dict()
    }), 200

@profile_bp.route('', methods=['PUT'])
@jwt_required()
def update_profile():
    user = g.current_user
    data = request.get_json() or {}

    # Update basic User fields if provided
    if 'name' in data: user.full_name = data['name'].strip()
    if 'phone' in data: user.phone = data['phone'].strip()
    if 'cgpa' in data:
        try:
            user.cgpa = float(data['cgpa'])
        except (ValueError, TypeError):
            pass

    # Update extended profile if student
    if user.role == 'student':
        profile = user.profile
        if not profile:
            profile = StudentProfile(user_id=user.id)
            db.session.add(profile)

        if 'bio' in data: profile.bio = data['bio']
        if 'tenthMarks' in data: profile.tenth_marks = str(data['tenthMarks'])
        if 'twelfthMarks' in data: profile.twelfth_marks = str(data['twelfthMarks'])
        if 'activeBacklogs' in data:
            try:
                profile.active_backlogs = int(data['activeBacklogs'])
            except (ValueError, TypeError):
                pass
        if 'resumeUrl' in data: profile.resume_url = data['resumeUrl']
        if 'currentOffer' in data: profile.current_offer = data['currentOffer']
        if 'status' in data: profile.placement_status = data['status']

        if 'socials' in data and isinstance(data['socials'], dict):
            profile.github = data['socials'].get('github', profile.github)
            profile.linkedin = data['socials'].get('linkedin', profile.linkedin)
            profile.portfolio = data['socials'].get('portfolio', profile.portfolio)

        if 'skills' in data and isinstance(data['skills'], list):
            profile.skills = json.dumps(data['skills'])

        if 'academicHistory' in data and isinstance(data['academicHistory'], list):
            profile.academic_history = json.dumps(data['academicHistory'])

        if 'certificationsList' in data and isinstance(data['certificationsList'], list):
            profile.certifications_list = json.dumps(data['certificationsList'])

    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'Profile updated successfully.',
        'profile': user.profile.to_dict() if user.role == 'student' else user.to_dict()
    }), 200

@profile_bp.route('/avatar', methods=['PUT'])
@jwt_required()
def update_avatar():
    user = g.current_user
    data = request.get_json() or {}
    avatar_url = data.get('avatar', '').strip()

    user.avatar = avatar_url
    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'Profile picture updated successfully.' if avatar_url else 'Profile picture removed.',
        'avatar': avatar_url
    }), 200
