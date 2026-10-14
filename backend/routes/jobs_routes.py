import json
from datetime import datetime
from flask import Blueprint, request, jsonify, g
from backend.database import db
from backend.models import JobOpportunity, JobApplication
from backend.auth_middleware import jwt_required, admin_required, student_required

jobs_bp = Blueprint('jobs', __name__, url_prefix='/api/jobs')

@jobs_bp.route('', methods=['GET'])
@jwt_required(optional=True)
def get_jobs():
    current_student_id = g.current_user.id if getattr(g, 'current_user', None) and g.current_user.role == 'student' else None
    jobs = JobOpportunity.query.order_by(JobOpportunity.id.desc()).all()
    return jsonify({
        'success': True,
        'jobs': [j.to_dict(current_student_id) for j in jobs]
    }), 200

@jobs_bp.route('', methods=['POST'])
@admin_required()
def create_job():
    data = request.get_json() or {}
    title = data.get('title', '').strip()
    company = data.get('company', '').strip()

    if not title or not company:
        return jsonify({'success': False, 'error': 'Title and Company are required.'}), 400

    count = JobOpportunity.query.count() + 101
    job_id = data.get('id') or f"JOB-2026-{count}"

    allowed_branches = data.get('allowedBranches', [])
    skills_required = data.get('skillsRequired', [])

    new_job = JobOpportunity(
        id=job_id,
        title=title,
        company=company,
        location=data.get('location', 'Hyderabad'),
        job_type=data.get('type') or data.get('jobType', 'Full-time'),
        salary=data.get('salary', 'Competitive'),
        salary_value=float(data.get('salaryValue') or 0.0),
        experience=data.get('experience', 'Fresher (2026 Batch)'),
        min_cgpa=float(data.get('minCgpa') or 6.5),
        allowed_branches=json.dumps(allowed_branches if isinstance(allowed_branches, list) else []),
        skills_required=json.dumps(skills_required if isinstance(skills_required, list) else []),
        description=data.get('description', ''),
        requirements=data.get('requirements', ''),
        deadline=data.get('deadline', datetime.utcnow().strftime('%Y-%m-%d')),
        posted_date=data.get('postedDate', datetime.utcnow().strftime('%Y-%m-%d')),
        status='Active'
    )
    db.session.add(new_job)
    db.session.commit()

    return jsonify({
        'success': True,
        'message': f"Job listing for {title} posted successfully.",
        'job': new_job.to_dict()
    }), 201

@jobs_bp.route('/<job_id>', methods=['PUT'])
@admin_required()
def update_job(job_id):
    job = JobOpportunity.query.get(job_id)
    if not job:
        return jsonify({'success': False, 'error': 'Job not found.'}), 404

    data = request.get_json() or {}
    if 'title' in data: job.title = data['title']
    if 'company' in data: job.company = data['company']
    if 'location' in data: job.location = data['location']
    if 'type' in data: job.job_type = data['type']
    if 'salary' in data: job.salary = data['salary']
    if 'salaryValue' in data: job.salary_value = float(data['salaryValue'] or 0.0)
    if 'experience' in data: job.experience = data['experience']
    if 'minCgpa' in data: job.min_cgpa = float(data['minCgpa'] or 0.0)
    if 'allowedBranches' in data: job.allowed_branches = json.dumps(data['allowedBranches'])
    if 'skillsRequired' in data: job.skills_required = json.dumps(data['skillsRequired'])
    if 'description' in data: job.description = data['description']
    if 'requirements' in data: job.requirements = data['requirements']
    if 'deadline' in data: job.deadline = data['deadline']
    if 'status' in data: job.status = data['status']

    db.session.commit()
    return jsonify({
        'success': True,
        'message': 'Job listing updated successfully.',
        'job': job.to_dict()
    }), 200

@jobs_bp.route('/<job_id>', methods=['DELETE'])
@admin_required()
def delete_job(job_id):
    job = JobOpportunity.query.get(job_id)
    if not job:
        return jsonify({'success': False, 'error': 'Job not found.'}), 404

    db.session.delete(job)
    db.session.commit()
    return jsonify({
        'success': True,
        'message': 'Job listing deleted successfully.'
    }), 200

@jobs_bp.route('/<job_id>/apply', methods=['POST'])
@student_required()
def apply_for_job(job_id):
    job = JobOpportunity.query.get(job_id)
    if not job:
        return jsonify({'success': False, 'error': 'Job not found.'}), 404

    student = g.current_user
    existing_app = JobApplication.query.filter_by(job_id=job_id, student_id=student.id).first()

    if existing_app:
        db.session.delete(existing_app)
        db.session.commit()
        return jsonify({
            'success': True,
            'hasApplied': False,
            'message': f"Application withdrawn for {job.title}",
            'job': job.to_dict(student.id)
        }), 200
    else:
        new_app = JobApplication(
            job_id=job_id,
            student_id=student.id,
            status='Applied'
        )
        db.session.add(new_app)
        db.session.commit()
        return jsonify({
            'success': True,
            'hasApplied': True,
            'message': f"Applied successfully for {job.title}!",
            'job': job.to_dict(student.id)
        }), 200
