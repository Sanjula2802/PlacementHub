from flask import Blueprint, request, jsonify, g
from backend.database import db
from backend.models import AssessmentExam, StudentExamResult
from backend.auth_middleware import jwt_required, admin_required

exams_bp = Blueprint('exams', __name__, url_prefix='/api/exams')

@exams_bp.route('', methods=['GET'])
@jwt_required(optional=True)
def get_exams():
    current_student_id = g.current_user.id if getattr(g, 'current_user', None) and g.current_user.role == 'student' else None
    exams = AssessmentExam.query.order_by(AssessmentExam.id.asc()).all()
    return jsonify({
        'success': True,
        'exams': [e.to_dict(current_student_id) for e in exams]
    }), 200

@exams_bp.route('', methods=['POST'])
@admin_required()
def create_exam():
    data = request.get_json() or {}
    title = data.get('title', '').strip()

    if not title:
        return jsonify({'success': False, 'error': 'Exam title is required.'}), 400

    count = AssessmentExam.query.count() + 1
    exam_id = data.get('id') or f"EXM-2026-{count:02d}"

    new_exam = AssessmentExam(
        id=exam_id,
        title=title,
        category=data.get('category', 'Aptitude'),
        date_time=data.get('schedule') or data.get('dateTime', 'TBD'),
        duration=data.get('duration', '60 Mins'),
        total_marks=int(data.get('totalMarks') or 100),
        passing_marks=int(data.get('passingMarks') or 60),
        exam_link=data.get('examLink', 'https://assessment.mlrit.ac.in'),
        status=data.get('status', 'Upcoming')
    )
    db.session.add(new_exam)
    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'Assessment exam scheduled successfully.',
        'exam': new_exam.to_dict()
    }), 201
