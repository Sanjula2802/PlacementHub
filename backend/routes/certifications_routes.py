from flask import Blueprint, request, jsonify, g
from backend.database import db
from backend.models import Certification, StudentCertification
from backend.auth_middleware import jwt_required, admin_required, student_required

certifications_bp = Blueprint('certifications', __name__, url_prefix='/api/certifications')

@certifications_bp.route('', methods=['GET'])
@jwt_required(optional=True)
def get_certifications():
    current_student_id = g.current_user.id if getattr(g, 'current_user', None) and g.current_user.role == 'student' else None
    certs = Certification.query.order_by(Certification.id.asc()).all()
    return jsonify({
        'success': True,
        'certifications': [c.to_dict(current_student_id) for c in certs]
    }), 200

@certifications_bp.route('', methods=['POST'])
@admin_required()
def create_certification():
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    provider = data.get('provider', '').strip()

    if not name or not provider:
        return jsonify({'success': False, 'error': 'Certification name and Provider are required.'}), 400

    count = Certification.query.count() + 1
    cert_id = data.get('id') or f"CERT-{count:03d}"

    new_cert = Certification(
        id=cert_id,
        name=name,
        provider=provider,
        category=data.get('category', 'Cloud Computing'),
        description=data.get('description', ''),
        voucher_code=data.get('voucherCode', 'MLRIT-FREE-2026'),
        discount=data.get('discount', '100% Free Voucher'),
        deadline=data.get('deadline', '2026-12-31'),
        status='Open',
        enrolled_count=0
    )
    db.session.add(new_cert)
    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'Certification opportunity created successfully.',
        'certification': new_cert.to_dict()
    }), 201

@certifications_bp.route('/<cert_id>/register', methods=['POST'])
@student_required()
def register_certification(cert_id):
    cert = Certification.query.get(cert_id)
    if not cert:
        return jsonify({'success': False, 'error': 'Certification not found.'}), 404

    student = g.current_user
    existing_reg = StudentCertification.query.filter_by(cert_id=cert_id, student_id=student.id).first()

    if existing_reg:
        db.session.delete(existing_reg)
        cert.enrolled_count = max(0, cert.enrolled_count - 1)
        db.session.commit()
        return jsonify({
            'success': True,
            'isRegistered': False,
            'message': f"Unregistered from {cert.name}",
            'certification': cert.to_dict(student.id)
        }), 200
    else:
        new_reg = StudentCertification(cert_id=cert_id, student_id=student.id)
        cert.enrolled_count += 1
        db.session.add(new_reg)
        db.session.commit()
        return jsonify({
            'success': True,
            'isRegistered': True,
            'message': f"Registered for {cert.name} successfully!",
            'certification': cert.to_dict(student.id)
        }), 200
