import random
from datetime import datetime
from flask import Blueprint, request, jsonify, g
from backend.database import db
from backend.models import StudentQuery
from backend.auth_middleware import jwt_required, admin_required, student_required

queries_bp = Blueprint('queries', __name__, url_prefix='/api/queries')

@queries_bp.route('', methods=['GET'])
@jwt_required()
def get_queries():
    user = g.current_user
    if user.role == 'admin':
        # Admin views all queries
        queries = StudentQuery.query.order_by(StudentQuery.created_at.desc()).all()
    else:
        # Students view only their own queries
        queries = StudentQuery.query.filter_by(student_id=user.id).order_by(StudentQuery.created_at.desc()).all()

    return jsonify({
        'success': True,
        'queries': [q.to_dict() for q in queries]
    }), 200

@queries_bp.route('', methods=['POST'])
@student_required()
def submit_query():
    data = request.get_json() or {}
    subject = data.get('subject', '').strip()
    message = data.get('message', '').strip()

    if not subject or not message:
        return jsonify({'success': False, 'error': 'Subject and Message are required.'}), 400

    student = g.current_user
    query_id = data.get('id') or f"QRY-{random.randint(1000, 9999)}"

    new_query = StudentQuery(
        id=query_id,
        student_id=student.id,
        student_name=student.full_name,
        subject=subject,
        category=data.get('category', 'Eligibility'),
        message=message,
        status='Pending',
        created_at=datetime.utcnow().strftime('%Y-%m-%d %H:%M')
    )
    db.session.add(new_query)
    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'Your query has been submitted to the Placement Cell.',
        'query': new_query.to_dict()
    }), 201

@queries_bp.route('/<query_id>/reply', methods=['POST'])
@admin_required()
def reply_to_query(query_id):
    query = StudentQuery.query.get(query_id)
    if not query:
        return jsonify({'success': False, 'error': 'Query not found.'}), 404

    data = request.get_json() or {}
    admin_response = data.get('responseText') or data.get('adminResponse') or ''

    if not admin_response.strip():
        return jsonify({'success': False, 'error': 'Response text cannot be empty.'}), 400

    admin = g.current_user
    query.admin_response = admin_response.strip()
    query.status = 'Resolved'
    query.resolved_by = admin.full_name or 'Placement Officer'
    query.resolved_at = datetime.utcnow().strftime('%Y-%m-%d %H:%M')

    db.session.commit()
    return jsonify({
        'success': True,
        'message': 'Response recorded and query marked as Resolved.',
        'query': query.to_dict()
    }), 200
