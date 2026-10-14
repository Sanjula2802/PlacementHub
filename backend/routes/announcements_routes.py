import random
from datetime import datetime
from flask import Blueprint, request, jsonify, g
from backend.database import db
from backend.models import Announcement
from backend.auth_middleware import admin_required

announcements_bp = Blueprint('announcements', __name__, url_prefix='/api/announcements')

@announcements_bp.route('', methods=['GET'])
def get_announcements():
    announcements = Announcement.query.order_by(Announcement.created_at.desc()).all()
    return jsonify({
        'success': True,
        'announcements': [a.to_dict() for a in announcements]
    }), 200

@announcements_bp.route('', methods=['POST'])
@admin_required()
def create_announcement():
    data = request.get_json() or {}
    title = data.get('title', '').strip()
    content = data.get('content', '').strip()

    if not title or not content:
        return jsonify({'success': False, 'error': 'Title and Content are required.'}), 400

    admin = g.current_user
    ann_id = data.get('id') or f"ANN-{random.randint(300, 799)}"
    priority = data.get('priority', 'High')
    badge_color = 'danger' if priority == 'High' else 'primary'

    new_ann = Announcement(
        id=ann_id,
        title=title,
        content=content,
        category=data.get('category', 'Placement Guideline'),
        priority=priority,
        badge_color=badge_color,
        author=admin.full_name or 'Placement Cell Office',
        date=datetime.utcnow().strftime('%Y-%m-%d')
    )
    db.session.add(new_ann)
    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'Announcement posted for students.',
        'announcement': new_ann.to_dict()
    }), 201

@announcements_bp.route('/<ann_id>', methods=['DELETE'])
@admin_required()
def delete_announcement(ann_id):
    ann = Announcement.query.get(ann_id)
    if not ann:
        return jsonify({'success': False, 'error': 'Announcement not found.'}), 404

    db.session.delete(ann)
    db.session.commit()
    return jsonify({
        'success': True,
        'message': 'Announcement deleted successfully.'
    }), 200
