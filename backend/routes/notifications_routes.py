from flask import Blueprint, jsonify, g
from backend.database import db
from backend.models import Notification
from backend.auth_middleware import jwt_required

notifications_bp = Blueprint('notifications', __name__, url_prefix='/api/notifications')

@notifications_bp.route('', methods=['GET'])
@jwt_required(optional=True)
def get_notifications():
    user = getattr(g, 'current_user', None)
    if user:
        notifs = Notification.query.filter(
            (Notification.user_id == user.id) | (Notification.user_id.is_(None))
        ).order_by(Notification.id.desc()).all()
    else:
        notifs = Notification.query.filter(Notification.user_id.is_(None)).order_by(Notification.id.desc()).all()

    return jsonify({
        'success': True,
        'notifications': [n.to_dict() for n in notifs]
    }), 200

@notifications_bp.route('/<int:notif_id>/read', methods=['PUT'])
@jwt_required(optional=True)
def mark_notification_read(notif_id):
    notif = Notification.query.get(notif_id)
    if notif:
        notif.read = True
        db.session.commit()
    return jsonify({'success': True}), 200

@notifications_bp.route('/read-all', methods=['PUT'])
@jwt_required(optional=True)
def mark_all_notifications_read():
    user = getattr(g, 'current_user', None)
    if user:
        notifs = Notification.query.filter(
            (Notification.user_id == user.id) | (Notification.user_id.is_(None))
        ).all()
    else:
        notifs = Notification.query.filter(Notification.user_id.is_(None)).all()

    for n in notifs:
        n.read = True
    db.session.commit()
    return jsonify({'success': True, 'message': 'All notifications marked as read.'}), 200
