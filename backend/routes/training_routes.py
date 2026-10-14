from datetime import datetime
from flask import Blueprint, request, jsonify
from backend.database import db
from backend.models import TrainingClass
from backend.auth_middleware import admin_required

training_bp = Blueprint('training', __name__, url_prefix='/api/training')

@training_bp.route('', methods=['GET'])
def get_training_classes():
    classes = TrainingClass.query.order_by(TrainingClass.id.asc()).all()
    return jsonify({
        'success': True,
        'training': [t.to_dict() for t in classes]
    }), 200

@training_bp.route('', methods=['POST'])
@admin_required()
def create_training_class():
    data = request.get_json() or {}
    title = data.get('title', '').strip()
    trainer = data.get('trainer', '').strip()

    if not title or not trainer:
        return jsonify({'success': False, 'error': 'Title and Trainer name are required.'}), 400

    count = TrainingClass.query.count() + 1
    trn_id = data.get('id') or f"TRN-{count:03d}"

    new_class = TrainingClass(
        id=trn_id,
        title=title,
        trainer=trainer,
        category=data.get('category', 'Technical'),
        date_time=data.get('schedule') or data.get('dateTime', 'TBD'),
        duration=data.get('duration', '2 Hours'),
        venue=data.get('venue', 'Seminar Hall 1 / Microsoft Teams'),
        meeting_link=data.get('meetingLink', ''),
        description=data.get('description', ''),
        status=data.get('status', 'Upcoming'),
        total_registered=int(data.get('totalRegistered') or 0)
    )
    db.session.add(new_class)
    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'Training session scheduled successfully.',
        'training': new_class.to_dict()
    }), 201

@training_bp.route('/<trn_id>', methods=['PUT'])
@admin_required()
def update_training_class(trn_id):
    trn = TrainingClass.query.get(trn_id)
    if not trn:
        return jsonify({'success': False, 'error': 'Training class not found.'}), 404

    data = request.get_json() or {}
    if 'title' in data: trn.title = data['title']
    if 'trainer' in data: trn.trainer = data['trainer']
    if 'category' in data: trn.category = data['category']
    if 'schedule' in data or 'dateTime' in data: trn.date_time = data.get('schedule') or data.get('dateTime')
    if 'duration' in data: trn.duration = data['duration']
    if 'venue' in data: trn.venue = data['venue']
    if 'meetingLink' in data: trn.meeting_link = data['meetingLink']
    if 'description' in data: trn.description = data['description']
    if 'status' in data: trn.status = data['status']
    if 'totalRegistered' in data: trn.total_registered = int(data['totalRegistered'])

    db.session.commit()
    return jsonify({
        'success': True,
        'message': 'Training session updated successfully.',
        'training': trn.to_dict()
    }), 200

@training_bp.route('/<trn_id>', methods=['DELETE'])
@admin_required()
def delete_training_class(trn_id):
    trn = TrainingClass.query.get(trn_id)
    if not trn:
        return jsonify({'success': False, 'error': 'Training class not found.'}), 404

    db.session.delete(trn)
    db.session.commit()
    return jsonify({
        'success': True,
        'message': 'Training session removed successfully.'
    }), 200
