from flask import Blueprint, request, jsonify, g
from backend.database import db
from backend.models import AttendanceRecord, User
from backend.auth_middleware import jwt_required, admin_required

attendance_bp = Blueprint('attendance', __name__, url_prefix='/api/attendance')

@attendance_bp.route('/summary', methods=['GET'])
@jwt_required()
def get_attendance_summary():
    user = g.current_user
    att = AttendanceRecord.query.filter_by(student_id=user.id).first()

    if not att:
        # Provide default high standing attendance
        return jsonify({
            'success': True,
            'summary': {
                'overallPercentage': 85,
                'minimumRequired': 75,
                'status': 'Eligible for All Placement Drives',
                'categories': [
                    {'id': 'aptitude', 'name': 'Aptitude & Reasoning', 'percentage': 85, 'attended': 34, 'total': 40, 'faculty': 'Prof. Raghavendra', 'status': 'Eligible'},
                    {'id': 'technical', 'name': 'Technical Coding & DSA', 'percentage': 88, 'attended': 44, 'total': 50, 'faculty': 'Dr. K. Srinivas', 'status': 'Eligible'},
                    {'id': 'softskills', 'name': 'Soft Skills & Interview Prep', 'percentage': 82, 'attended': 25, 'total': 30, 'faculty': 'Prof. Lakshmi Menon', 'status': 'Eligible'},
                    {'id': 'mock', 'name': 'Company Specific Mock Drives', 'percentage': 85, 'attended': 17, 'total': 20, 'faculty': 'Er. Vikrant Sharma', 'status': 'Eligible'}
                ],
                'recentSessions': [
                    {'title': 'Dynamic Programming Bootcamp', 'date': '2026-10-12', 'status': 'Present', 'type': 'Technical'},
                    {'title': 'HR Situational Mock Questions', 'date': '2026-10-10', 'status': 'Present', 'type': 'Soft Skills'},
                    {'title': 'TCS NQT Advanced Mock Test', 'date': '2026-10-06', 'status': 'Present', 'type': 'Aptitude'}
                ]
            }
        }), 200

    overall = att.overall
    status_text = 'Eligible for All Placement Drives' if overall >= 75 else f'At Risk (<75% - Action Required)'

    return jsonify({
        'success': True,
        'summary': {
            'overallPercentage': overall,
            'minimumRequired': 75,
            'status': status_text,
            'categories': [
                {'id': 'aptitude', 'name': 'Aptitude & Reasoning', 'percentage': att.aptitude, 'attended': int(att.aptitude * 0.4), 'total': 40, 'faculty': 'Prof. Raghavendra', 'status': 'Eligible' if att.aptitude >= 75 else 'Low Attendance'},
                {'id': 'technical', 'name': 'Technical Coding & DSA', 'percentage': att.technical, 'attended': int(att.technical * 0.5), 'total': 50, 'faculty': 'Dr. K. Srinivas', 'status': 'Eligible' if att.technical >= 75 else 'Low Attendance'},
                {'id': 'softskills', 'name': 'Soft Skills & Interview Prep', 'percentage': att.softskills, 'attended': int(att.softskills * 0.3), 'total': 30, 'faculty': 'Prof. Lakshmi Menon', 'status': 'Eligible' if att.softskills >= 75 else 'Low Attendance'},
                {'id': 'mock', 'name': 'Company Specific Mock Drives', 'percentage': att.mock, 'attended': int(att.mock * 0.2), 'total': 20, 'faculty': 'Er. Vikrant Sharma', 'status': 'Eligible' if att.mock >= 75 else 'Low Attendance'}
            ],
            'recentSessions': [
                {'title': 'Dynamic Programming Bootcamp', 'date': '2026-10-12', 'status': 'Present', 'type': 'Technical'},
                {'title': 'HR Situational Mock Questions', 'date': '2026-10-10', 'status': 'Present', 'type': 'Soft Skills'},
                {'title': 'TCS NQT Advanced Mock Test', 'date': '2026-10-06', 'status': 'Present', 'type': 'Aptitude'}
            ]
        }
    }), 200

@attendance_bp.route('/students', methods=['GET'])
@admin_required()
def get_all_students_attendance():
    records = AttendanceRecord.query.all()
    # If no records exist, gather from students
    students = User.query.filter_by(role='student').all()
    result = []

    for s in students:
        att = s.attendance
        if not att:
            att = AttendanceRecord(
                student_id=s.id,
                aptitude=85,
                technical=85,
                softskills=85,
                mock=85,
                overall=85,
                status='Eligible'
            )
            db.session.add(att)
            db.session.commit()
        result.append(att.to_dict())

    return jsonify({
        'success': True,
        'studentsAttendance': result
    }), 200

@attendance_bp.route('/students/<student_identifier>', methods=['PUT'])
@admin_required()
def update_student_attendance(student_identifier):
    data = request.get_json() or {}

    # Student identifier can be user.id or student_id (e.g. 22R11A0599)
    user = User.query.filter(
        (User.id == student_identifier) | (User.student_id == student_identifier.upper())
    ).first()

    if not user:
        return jsonify({'success': False, 'error': 'Student not found.'}), 404

    att = user.attendance
    if not att:
        att = AttendanceRecord(student_id=user.id)
        db.session.add(att)

    module = data.get('moduleName')
    new_score = data.get('newScore')

    if module and new_score is not None:
        score_val = max(0, min(100, int(new_score)))
        if module == 'aptitude': att.aptitude = score_val
        elif module == 'technical': att.technical = score_val
        elif module == 'softskills': att.softskills = score_val
        elif module == 'mock': att.mock = score_val

    # Recalculate overall
    overall = round((att.aptitude + att.technical + att.softskills + att.mock) / 4)
    att.overall = overall
    att.status = 'Eligible' if overall >= 75 else 'At Risk (<75%)'

    db.session.commit()
    return jsonify({
        'success': True,
        'message': f"Attendance score updated for student {user.student_id or user.full_name}",
        'record': att.to_dict()
    }), 200
