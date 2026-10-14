import json
from datetime import datetime
from backend.database import db

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.String(64), primary_key=True)
    full_name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    role = db.Column(db.String(20), nullable=False, default='student') # 'student' | 'admin'
    admin_status = db.Column(db.String(30), nullable=True) # 'ACTIVE' | 'PENDING_POLICY' | 'DENIED_POLICY'
    student_id = db.Column(db.String(30), unique=True, nullable=True, index=True)
    admin_id = db.Column(db.String(30), unique=True, nullable=True, index=True)
    department = db.Column(db.String(80), nullable=True) # CSE, CSE-AI/ML, CSE-DS, ECE, EEE, MECH, AERO or Placement Cell
    section = db.Column(db.String(10), nullable=True) # A, B, C, D, E, F, G
    year = db.Column(db.String(20), nullable=True) # 3rd Year, 4th Year
    phone = db.Column(db.String(20), nullable=True)
    cgpa = db.Column(db.Float, default=0.0)
    avatar = db.Column(db.Text, nullable=True)
    password_hash = db.Column(db.String(255), nullable=False)
    is_verified = db.Column(db.Boolean, default=False)
    is_super_admin = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    profile = db.relationship('StudentProfile', backref='user', uselist=False, cascade='all, delete-orphan')
    attendance = db.relationship('AttendanceRecord', backref='user', uselist=False, cascade='all, delete-orphan')
    drive_registrations = db.relationship('DriveRegistration', backref='student', lazy='dynamic', cascade='all, delete-orphan')
    job_applications = db.relationship('JobApplication', backref='student', lazy='dynamic', cascade='all, delete-orphan')
    internship_applications = db.relationship('InternshipApplication', backref='student', lazy='dynamic', cascade='all, delete-orphan')
    cert_registrations = db.relationship('StudentCertification', backref='student', lazy='dynamic', cascade='all, delete-orphan')
    exam_results = db.relationship('StudentExamResult', backref='student', lazy='dynamic', cascade='all, delete-orphan')
    queries = db.relationship('StudentQuery', backref='student', lazy='dynamic', cascade='all, delete-orphan')
    reviews = db.relationship('Review', backref='student', lazy='dynamic', cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'fullName': self.full_name,
            'name': self.full_name,
            'email': self.email,
            'role': self.role,
            'adminStatus': self.admin_status,
            'studentId': self.student_id,
            'adminId': self.admin_id,
            'department': self.department,
            'section': self.section or '',
            'year': self.year or '',
            'phone': self.phone or '',
            'cgpa': self.cgpa or 0.0,
            'avatar': self.avatar or '',
            'isVerified': self.is_verified,
            'isSuperAdmin': self.is_super_admin,
            'createdAt': self.created_at.isoformat() if self.created_at else None
        }


class StudentProfile(db.Model):
    __tablename__ = 'student_profiles'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(64), db.ForeignKey('users.id', ondelete='CASCADE'), unique=True, nullable=False)
    skills = db.Column(db.Text, nullable=True) # JSON list
    placement_status = db.Column(db.String(30), default='Not Placed') # 'Not Placed' | 'Placed' | 'In Process'
    applications_count = db.Column(db.Integer, default=0)
    offers_count = db.Column(db.Integer, default=0)
    current_offer = db.Column(db.String(100), default='')
    resume_url = db.Column(db.String(255), default='')
    tenth_marks = db.Column(db.String(30), default='')
    twelfth_marks = db.Column(db.String(30), default='')
    active_backlogs = db.Column(db.Integer, default=0)
    bio = db.Column(db.Text, default='')
    github = db.Column(db.String(255), default='')
    linkedin = db.Column(db.String(255), default='')
    portfolio = db.Column(db.String(255), default='')
    academic_history = db.Column(db.Text, nullable=True) # JSON list
    certifications_list = db.Column(db.Text, nullable=True) # JSON list

    def to_dict(self):
        user = self.user
        skills_list = json.loads(self.skills) if self.skills else []
        acad_list = json.loads(self.academic_history) if self.academic_history else []
        certs_list = json.loads(self.certifications_list) if self.certifications_list else []

        return {
            'id': user.student_id or user.id,
            'userId': user.id,
            'name': user.full_name,
            'email': user.email,
            'phone': user.phone or '',
            'department': user.department or '',
            'section': user.section or '',
            'year': user.year or '',
            'cgpa': user.cgpa or 0.0,
            'avatar': user.avatar or '',
            'skills': skills_list,
            'status': self.placement_status,
            'applicationsCount': self.applications_count,
            'offersCount': self.offers_count,
            'currentOffer': self.current_offer or '',
            'resumeUrl': self.resume_url or '',
            'tenthMarks': self.tenth_marks or '',
            'twelfthMarks': self.twelfth_marks or '',
            'activeBacklogs': self.active_backlogs,
            'bio': self.bio or '',
            'socials': {
                'github': self.github or '',
                'linkedin': self.linkedin or '',
                'portfolio': self.portfolio or ''
            },
            'academicHistory': acad_list,
            'certificationsList': certs_list
        }


class PlacementDrive(db.Model):
    __tablename__ = 'placement_drives'

    id = db.Column(db.String(64), primary_key=True)
    company = db.Column(db.String(120), nullable=False)
    role = db.Column(db.String(120), nullable=False)
    package = db.Column(db.String(50), nullable=False)
    package_value = db.Column(db.Float, default=0.0)
    tier = db.Column(db.String(30), default='Tier 1')
    location = db.Column(db.String(120), default='Hyderabad')
    eligibility = db.Column(db.String(120), default='CGPA >= 7.0, No active backlogs')
    min_cgpa = db.Column(db.Float, default=7.0)
    allowed_branches = db.Column(db.Text, nullable=True) # JSON list
    drive_date = db.Column(db.String(50), nullable=False)
    deadline = db.Column(db.String(50), nullable=False)
    venue = db.Column(db.String(120), default='Auditorium / Online')
    selection_process = db.Column(db.Text, default='Online Test -> Technical Interview -> HR Round')
    description = db.Column(db.Text, nullable=True)
    skills_required = db.Column(db.Text, nullable=True) # JSON list
    vacancies = db.Column(db.String(50), default='Open')
    status = db.Column(db.String(30), default='Upcoming')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    registrations = db.relationship('DriveRegistration', backref='drive', lazy='dynamic', cascade='all, delete-orphan')

    def to_dict(self, current_student_user_id=None):
        branches = json.loads(self.allowed_branches) if self.allowed_branches else []
        skills = json.loads(self.skills_required) if self.skills_required else []

        registered_students_list = []
        is_registered = False

        for reg in self.registrations.all():
            st = reg.student
            if current_student_user_id and (st.id == current_student_user_id or st.student_id == current_student_user_id):
                is_registered = True
            registered_students_list.append({
                'id': st.student_id or st.id,
                'name': st.full_name,
                'email': st.email,
                'cgpa': st.cgpa or 0.0,
                'status': reg.status
            })

        return {
            'id': self.id,
            'company': self.company,
            'role': self.role,
            'package': self.package,
            'packageValue': self.package_value,
            'tier': self.tier,
            'location': self.location,
            'eligibility': self.eligibility,
            'minCgpa': self.min_cgpa,
            'allowedBranches': branches,
            'driveDate': self.drive_date,
            'deadline': self.deadline,
            'venue': self.venue,
            'selectionProcess': self.selection_process,
            'description': self.description or '',
            'skills': skills,
            'skillsRequired': skills,
            'vacancies': self.vacancies,
            'status': self.status,
            'isRegistered': is_registered,
            'registeredStudents': registered_students_list
        }


class DriveRegistration(db.Model):
    __tablename__ = 'drive_registrations'

    id = db.Column(db.Integer, primary_key=True)
    drive_id = db.Column(db.String(64), db.ForeignKey('placement_drives.id', ondelete='CASCADE'), nullable=False)
    student_id = db.Column(db.String(64), db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    status = db.Column(db.String(30), default='Registered')
    registered_at = db.Column(db.DateTime, default=datetime.utcnow)


class JobOpportunity(db.Model):
    __tablename__ = 'job_opportunities'

    id = db.Column(db.String(64), primary_key=True)
    title = db.Column(db.String(120), nullable=False)
    company = db.Column(db.String(120), nullable=False)
    location = db.Column(db.String(120), default='Hyderabad')
    job_type = db.Column(db.String(50), default='Full-time')
    salary = db.Column(db.String(50), nullable=False)
    salary_value = db.Column(db.Float, default=0.0)
    experience = db.Column(db.String(50), default='Fresher (2026 Batch)')
    min_cgpa = db.Column(db.Float, default=6.5)
    allowed_branches = db.Column(db.Text, nullable=True) # JSON list
    skills_required = db.Column(db.Text, nullable=True) # JSON list
    description = db.Column(db.Text, nullable=True)
    requirements = db.Column(db.Text, nullable=True)
    deadline = db.Column(db.String(50), nullable=False)
    posted_date = db.Column(db.String(50), default=lambda: datetime.utcnow().strftime('%Y-%m-%d'))
    status = db.Column(db.String(30), default='Active')

    applications = db.relationship('JobApplication', backref='job', lazy='dynamic', cascade='all, delete-orphan')

    def to_dict(self, current_student_user_id=None):
        branches = json.loads(self.allowed_branches) if self.allowed_branches else []
        skills = json.loads(self.skills_required) if self.skills_required else []
        apps = self.applications.all()
        has_applied = False
        applied_date = None

        if current_student_user_id:
            for app in apps:
                if app.student_id == current_student_user_id:
                    has_applied = True
                    applied_date = app.applied_date.strftime('%Y-%m-%d') if app.applied_date else None
                    break

        return {
            'id': self.id,
            'title': self.title,
            'company': self.company,
            'location': self.location,
            'type': self.job_type,
            'salary': self.salary,
            'salaryValue': self.salary_value,
            'experience': self.experience,
            'minCgpa': self.min_cgpa,
            'allowedBranches': branches,
            'skills': skills,
            'skillsRequired': skills,
            'description': self.description or '',
            'requirements': self.requirements or '',
            'deadline': self.deadline,
            'postedDate': self.posted_date,
            'hasApplied': has_applied,
            'appliedDate': applied_date,
            'applicantsCount': len(apps),
            'openings': '15',
            'status': self.status
        }


class JobApplication(db.Model):
    __tablename__ = 'job_applications'

    id = db.Column(db.Integer, primary_key=True)
    job_id = db.Column(db.String(64), db.ForeignKey('job_opportunities.id', ondelete='CASCADE'), nullable=False)
    student_id = db.Column(db.String(64), db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    status = db.Column(db.String(30), default='Applied')
    applied_date = db.Column(db.DateTime, default=datetime.utcnow)


class Internship(db.Model):
    __tablename__ = 'internships'

    id = db.Column(db.String(64), primary_key=True)
    title = db.Column(db.String(120), nullable=False)
    company = db.Column(db.String(120), nullable=False)
    location = db.Column(db.String(120), default='Remote / Hybrid')
    duration = db.Column(db.String(50), default='6 Months')
    stipend = db.Column(db.String(50), default='₹25,000 / month')
    min_cgpa = db.Column(db.Float, default=6.5)
    allowed_branches = db.Column(db.Text, nullable=True) # JSON list
    skills_required = db.Column(db.Text, nullable=True) # JSON list
    description = db.Column(db.Text, nullable=True)
    requirements = db.Column(db.Text, nullable=True)
    deadline = db.Column(db.String(50), nullable=False)
    posted_date = db.Column(db.String(50), default=lambda: datetime.utcnow().strftime('%Y-%m-%d'))
    status = db.Column(db.String(30), default='Active')

    applications = db.relationship('InternshipApplication', backref='internship', lazy='dynamic', cascade='all, delete-orphan')

    def to_dict(self, current_student_user_id=None):
        branches = json.loads(self.allowed_branches) if self.allowed_branches else []
        skills = json.loads(self.skills_required) if self.skills_required else []
        apps = self.applications.all()
        has_applied = False
        applied_date = None

        if current_student_user_id:
            for app in apps:
                if app.student_id == current_student_user_id:
                    has_applied = True
                    applied_date = app.applied_date.strftime('%Y-%m-%d') if app.applied_date else None
                    break

        return {
            'id': self.id,
            'title': self.title,
            'company': self.company,
            'location': self.location,
            'duration': self.duration,
            'stipend': self.stipend,
            'minCgpa': self.min_cgpa,
            'allowedBranches': branches,
            'skills': skills,
            'skillsRequired': skills,
            'description': self.description or '',
            'requirements': self.requirements or '',
            'deadline': self.deadline,
            'postedDate': self.posted_date,
            'hasApplied': has_applied,
            'appliedDate': applied_date,
            'applicantsCount': len(apps),
            'ppoOffered': 'Full-Time PPO based on performance',
            'status': self.status
        }


class InternshipApplication(db.Model):
    __tablename__ = 'internship_applications'

    id = db.Column(db.Integer, primary_key=True)
    internship_id = db.Column(db.String(64), db.ForeignKey('internships.id', ondelete='CASCADE'), nullable=False)
    student_id = db.Column(db.String(64), db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    status = db.Column(db.String(30), default='Applied')
    applied_date = db.Column(db.DateTime, default=datetime.utcnow)


class TrainingClass(db.Model):
    __tablename__ = 'training_classes'

    id = db.Column(db.String(64), primary_key=True)
    title = db.Column(db.String(120), nullable=False)
    trainer = db.Column(db.String(120), nullable=False)
    category = db.Column(db.String(50), default='Technical') # 'Technical' | 'Aptitude' | 'Soft Skills'
    date_time = db.Column(db.String(80), nullable=False)
    duration = db.Column(db.String(50), default='2 Hours')
    venue = db.Column(db.String(120), default='Seminar Hall 1 / Microsoft Teams')
    meeting_link = db.Column(db.String(255), nullable=True)
    description = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(30), default='Upcoming')
    total_registered = db.Column(db.Integer, default=0)

    def to_dict(self):
        dt_parts = self.date_time.split(' ') if self.date_time else []
        return {
            'id': self.id,
            'name': self.title,
            'title': self.title,
            'trainer': self.trainer,
            'trainerRole': 'Corporate Lead Trainer',
            'category': self.category,
            'topic': self.description or self.category or '',
            'mode': 'In-Person / Interactive Live',
            'attendanceMandatory': True,
            'materialsLink': self.meeting_link or 'https://teams.microsoft.com',
            'schedule': self.date_time,
            'dateTime': self.date_time,
            'date': dt_parts[0] if dt_parts else '',
            'time': ' '.join(dt_parts[1:]) if len(dt_parts) > 1 else '',
            'duration': self.duration,
            'venue': self.venue,
            'meetingLink': self.meeting_link or '',
            'description': self.description or '',
            'status': self.status,
            'totalRegistered': self.total_registered
        }


class AttendanceRecord(db.Model):
    __tablename__ = 'attendance_records'

    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.String(64), db.ForeignKey('users.id', ondelete='CASCADE'), unique=True, nullable=False)
    aptitude = db.Column(db.Integer, default=85)
    technical = db.Column(db.Integer, default=88)
    softskills = db.Column(db.Integer, default=82)
    mock = db.Column(db.Integer, default=84)
    overall = db.Column(db.Integer, default=85)
    status = db.Column(db.String(40), default='Eligible')
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        u = self.user
        return {
            'id': u.student_id or u.id,
            'userId': u.id,
            'name': u.full_name,
            'email': u.email,
            'branch': u.department or 'CSE',
            'section': u.section or 'A',
            'year': u.year or '4th Year',
            'aptitude': self.aptitude,
            'technical': self.technical,
            'softskills': self.softskills,
            'mock': self.mock,
            'overall': self.overall,
            'status': self.status
        }


class Certification(db.Model):
    __tablename__ = 'certifications'

    id = db.Column(db.String(64), primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    provider = db.Column(db.String(100), nullable=False)
    category = db.Column(db.String(50), default='Cloud Computing')
    description = db.Column(db.Text, nullable=True)
    voucher_code = db.Column(db.String(50), default='MLRIT-FREE-2026')
    discount = db.Column(db.String(50), default='100% Free Voucher')
    deadline = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(30), default='Open')
    enrolled_count = db.Column(db.Integer, default=0)

    registrations = db.relationship('StudentCertification', backref='cert', lazy='dynamic', cascade='all, delete-orphan')

    def to_dict(self, current_student_user_id=None):
        is_registered = False
        if current_student_user_id:
            reg = self.registrations.filter_by(student_id=current_student_user_id).first()
            if reg:
                is_registered = True

        return {
            'id': self.id,
            'name': self.name,
            'provider': self.provider,
            'category': self.category,
            'description': self.description or '',
            'voucherCode': self.voucher_code,
            'discount': self.discount,
            'voucherDiscount': self.discount,
            'deadline': self.deadline,
            'status': 'Registered' if is_registered else self.status,
            'enrolledCount': self.enrolled_count
        }


class StudentCertification(db.Model):
    __tablename__ = 'student_certifications'

    id = db.Column(db.Integer, primary_key=True)
    cert_id = db.Column(db.String(64), db.ForeignKey('certifications.id', ondelete='CASCADE'), nullable=False)
    student_id = db.Column(db.String(64), db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    status = db.Column(db.String(30), default='Registered')
    enrolled_at = db.Column(db.DateTime, default=datetime.utcnow)


class AssessmentExam(db.Model):
    __tablename__ = 'assessment_exams'

    id = db.Column(db.String(64), primary_key=True)
    title = db.Column(db.String(120), nullable=False)
    category = db.Column(db.String(50), default='Aptitude')
    date_time = db.Column(db.String(80), nullable=False)
    duration = db.Column(db.String(50), default='60 Mins')
    total_marks = db.Column(db.Integer, default=100)
    passing_marks = db.Column(db.Integer, default=60)
    exam_link = db.Column(db.String(255), default='https://assessment.mlrit.ac.in')
    status = db.Column(db.String(30), default='Upcoming')

    results = db.relationship('StudentExamResult', backref='exam', lazy='dynamic', cascade='all, delete-orphan')

    def to_dict(self, current_student_user_id=None):
        score = None
        rank = None
        status = self.status

        if current_student_user_id:
            res = self.results.filter_by(student_id=current_student_user_id).first()
            if res:
                score = res.score
                rank = res.rank
                status = res.status

        dt_parts = self.date_time.split(' ') if self.date_time else []
        return {
            'id': self.id,
            'name': self.title,
            'title': self.title,
            'type': self.category,
            'category': self.category,
            'platform': 'HackerEarth Assessment Center',
            'syllabus': 'Data Structures, Algorithms, Core CS and Analytical Aptitude',
            'instructions': 'Online proctored test with camera monitoring. Do not switch tabs.',
            'schedule': self.date_time,
            'dateTime': self.date_time,
            'date': dt_parts[0] if dt_parts else '',
            'time': ' '.join(dt_parts[1:]) if len(dt_parts) > 1 else '',
            'duration': self.duration,
            'totalMarks': self.total_marks,
            'passingMarks': self.passing_marks,
            'examLink': self.exam_link,
            'status': status,
            'score': score,
            'rank': rank
        }


class StudentExamResult(db.Model):
    __tablename__ = 'student_exam_results'

    id = db.Column(db.Integer, primary_key=True)
    exam_id = db.Column(db.String(64), db.ForeignKey('assessment_exams.id', ondelete='CASCADE'), nullable=False)
    student_id = db.Column(db.String(64), db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    score = db.Column(db.Integer, nullable=True)
    rank = db.Column(db.Integer, nullable=True)
    status = db.Column(db.String(30), default='Completed')
    attempted_at = db.Column(db.DateTime, default=datetime.utcnow)


class Review(db.Model):
    __tablename__ = 'reviews'

    id = db.Column(db.String(64), primary_key=True)
    student_id = db.Column(db.String(64), db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    student_name = db.Column(db.String(120), nullable=False)
    company = db.Column(db.String(120), nullable=False)
    role = db.Column(db.String(120), nullable=False)
    rating = db.Column(db.Integer, default=5)
    interview_experience = db.Column(db.Text, nullable=False)
    difficulty = db.Column(db.String(30), default='Medium')
    tips = db.Column(db.Text, nullable=True)
    rounds_count = db.Column(db.Integer, default=3)
    created_at = db.Column(db.String(50), default=lambda: datetime.utcnow().strftime('%Y-%m-%d'))

    def to_dict(self):
        return {
            'id': self.id,
            'studentId': self.student_id,
            'studentName': self.student_name,
            'company': self.company,
            'trainingName': self.company,
            'role': self.role,
            'rating': self.rating,
            'comment': self.interview_experience,
            'experience': self.interview_experience,
            'interviewExperience': self.interview_experience,
            'difficulty': self.difficulty,
            'tips': self.tips or '',
            'rounds': self.rounds_count,
            'date': self.created_at,
            'createdAt': self.created_at
        }


class StudentQuery(db.Model):
    __tablename__ = 'student_queries'

    id = db.Column(db.String(64), primary_key=True)
    student_id = db.Column(db.String(64), db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    student_name = db.Column(db.String(120), nullable=False)
    subject = db.Column(db.String(200), nullable=False)
    category = db.Column(db.String(80), default='Eligibility')
    message = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(30), default='Pending') # 'Pending' | 'Resolved'
    admin_response = db.Column(db.Text, nullable=True)
    resolved_by = db.Column(db.String(120), nullable=True)
    resolved_at = db.Column(db.String(50), nullable=True)
    created_at = db.Column(db.String(50), default=lambda: datetime.utcnow().strftime('%Y-%m-%d %H:%M'))

    def to_dict(self):
        return {
            'id': self.id,
            'studentId': self.student_id,
            'studentName': self.student_name,
            'subject': self.subject,
            'category': self.category,
            'message': self.message,
            'status': self.status,
            'adminResponse': self.admin_response,
            'resolvedBy': self.resolved_by,
            'resolvedAt': self.resolved_at,
            'createdAt': self.created_at
        }


class Announcement(db.Model):
    __tablename__ = 'announcements'

    id = db.Column(db.String(64), primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(80), default='Placement Guideline')
    priority = db.Column(db.String(30), default='High') # 'High' | 'Medium' | 'Low'
    badge_color = db.Column(db.String(30), default='danger')
    author = db.Column(db.String(120), default='Placement Cell Office')
    date = db.Column(db.String(50), default=lambda: datetime.utcnow().strftime('%Y-%m-%d'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'content': self.content,
            'category': self.category,
            'priority': self.priority,
            'badgeColor': self.badge_color or ('danger' if self.priority == 'High' else 'primary'),
            'author': self.author,
            'date': self.date
        }


class Notification(db.Model):
    __tablename__ = 'notifications'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(64), nullable=True) # None for broadcast to all
    title = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    notif_type = db.Column(db.String(30), default='info')
    time = db.Column(db.String(50), default='Just now')
    read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'message': self.message,
            'type': self.notif_type,
            'time': self.time,
            'read': self.read
        }


class VerificationToken(db.Model):
    __tablename__ = 'verification_tokens'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), nullable=False, index=True)
    code = db.Column(db.String(10), nullable=False)
    expires_at = db.Column(db.DateTime, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class AdminAccessSession(db.Model):
    __tablename__ = 'admin_access_sessions'

    id = db.Column(db.Integer, primary_key=True)
    token = db.Column(db.String(120), unique=True, nullable=False)
    expires_at = db.Column(db.DateTime, nullable=False)
    used = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class AdminInvitation(db.Model):
    __tablename__ = 'admin_invitations'

    id = db.Column(db.String(64), primary_key=True)
    email = db.Column(db.String(120), nullable=False)
    token = db.Column(db.String(120), unique=True, nullable=False)
    code = db.Column(db.String(20), nullable=False)
    invited_by = db.Column(db.String(120), default='Super Admin')
    expires_at = db.Column(db.DateTime, nullable=False)
    used = db.Column(db.Boolean, default=False)
    used_by = db.Column(db.String(64), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'token': self.token,
            'code': self.code,
            'invitedBy': self.invited_by,
            'expiresAt': self.expires_at.isoformat() if self.expires_at else None,
            'used': self.used,
            'usedBy': self.used_by
        }
