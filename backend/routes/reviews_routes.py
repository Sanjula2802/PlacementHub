import random
from datetime import datetime
from flask import Blueprint, request, jsonify, g
from backend.database import db
from backend.models import Review
from backend.auth_middleware import jwt_required

reviews_bp = Blueprint('reviews', __name__, url_prefix='/api/reviews')

@reviews_bp.route('', methods=['GET'])
def get_reviews():
    reviews = Review.query.order_by(Review.created_at.desc()).all()
    return jsonify({
        'success': True,
        'reviews': [r.to_dict() for r in reviews]
    }), 200

@reviews_bp.route('', methods=['POST'])
@jwt_required()
def add_review():
    data = request.get_json() or {}
    company = (data.get('company') or data.get('trainingName') or 'Placement Training').strip()
    role = (data.get('role') or 'Student Training Review').strip()
    experience = (data.get('experience') or data.get('interviewExperience') or data.get('comment') or '').strip()

    if not company or not experience:
        return jsonify({'success': False, 'error': 'Review comments and training details are required.'}), 400

    user = g.current_user
    review_id = data.get('id') or f"REV-{random.randint(500, 999)}"

    new_review = Review(
        id=review_id,
        student_id=user.id,
        student_name=data.get('studentName') or user.full_name,
        company=company,
        role=role,
        rating=int(data.get('rating') or 5),
        interview_experience=experience,
        difficulty=data.get('difficulty', 'Medium'),
        tips=data.get('tips', ''),
        rounds_count=int(data.get('rounds') or data.get('roundsCount') or 3),
        created_at=datetime.utcnow().strftime('%Y-%m-%d')
    )
    db.session.add(new_review)
    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'Feedback submitted successfully! Thank you.',
        'review': new_review.to_dict()
    }), 201
