import requests
import random
import time

BASE_URL = 'http://localhost:5000/api'

def test_complete_backend():
    print("==================================================")
    print(" RUNNING AUTOMATED BACKEND INTEGRATION TEST SUITE ")
    print("==================================================\n")

    # 1. Health check
    r = requests.get(f"{BASE_URL}/health")
    assert r.status_code == 200, f"Health check failed: {r.text}"
    health = r.json()
    print(f"1. Health Check: PASS (Server: {health.get('server')}, Status: {health.get('status')})")

    # 2. Student Signup Validations
    rand_id = f"22R11A{random.randint(1000, 9999)}"
    rand_email = f"{rand_id.lower()}@mlrit.ac.in"

    # 2a. Reject non-allowed department
    r = requests.post(f"{BASE_URL}/auth/student/signup", json={
        'fullName': 'Test User',
        'studentId': rand_id,
        'email': rand_email,
        'department': 'Civil Engineering',
        'section': 'A',
        'year': '3rd Year',
        'password': 'StudentSecure@2026'
    })
    assert r.status_code == 400, "Failed to reject invalid department"
    print("2. Disallowed Department Rejected: PASS (400)")

    # 2b. Reject non-allowed year (1st Year)
    r = requests.post(f"{BASE_URL}/auth/student/signup", json={
        'fullName': 'Test User',
        'studentId': rand_id,
        'email': rand_email,
        'department': 'CSE',
        'section': 'A',
        'year': '1st Year',
        'password': 'StudentSecure@2026'
    })
    assert r.status_code == 400, "Failed to reject invalid year"
    print("3. Disallowed Year (1st Year) Rejected: PASS (400)")

    # 2c. Reject non-allowed section
    r = requests.post(f"{BASE_URL}/auth/student/signup", json={
        'fullName': 'Test User',
        'studentId': rand_id,
        'email': rand_email,
        'department': 'CSE-AI/ML',
        'section': 'H',
        'year': '3rd Year',
        'password': 'StudentSecure@2026'
    })
    assert r.status_code == 400, "Failed to reject invalid section"
    print("4. Disallowed Section (H) Rejected: PASS (400)")

    # 2d. Successful Student Signup (No verification code required)
    r = requests.post(f"{BASE_URL}/auth/student/signup", json={
        'fullName': 'Ananya Sharma',
        'studentId': rand_id,
        'email': rand_email,
        'department': 'CSE-DS',
        'section': 'B',
        'year': '4th Year',
        'password': 'StudentSecure@2026'
    })
    assert r.status_code == 201, f"Student signup failed: {r.text}"
    student_signup_data = r.json()
    assert student_signup_data.get('success') is True
    assert 'token' in student_signup_data
    assert student_signup_data.get('user', {}).get('isVerified') is True
    student_token = student_signup_data['token']
    print("5. Student Signup without verification code: PASS (201 - Token issued, isVerified=True)")

    # 3. Student Immediate Login without code
    r = requests.post(f"{BASE_URL}/auth/login", json={
        'identifier': rand_email,
        'password': 'StudentSecure@2026',
        'portal': 'student'
    })
    assert r.status_code == 200, f"Student login failed: {r.text}"
    login_data = r.json()
    assert login_data.get('user', {}).get('role') == 'student'
    print("6. Student Direct Login: PASS (200 - Role verified as student)")

    # 4. Admin Access Code Validation
    r = requests.post(f"{BASE_URL}/auth/admin/validate-access-code", json={'accessCode': 'WRONG_CODE'})
    assert r.status_code == 403, "Failed to reject wrong access code"

    r = requests.post(f"{BASE_URL}/auth/admin/validate-access-code", json={'accessCode': 'MLRIT@2026'})
    assert r.status_code == 200, f"Access code validation failed: {r.text}"
    admin_session_token = r.json().get('accessSessionToken')
    assert admin_session_token, "No accessSessionToken returned"
    print("7. Admin Access Code (MLRIT@2026) Validation: PASS (200)")

    # 5. Admin Signup (Requires Email Verification)
    admin_num = random.randint(100, 999)
    admin_email = f"tpo_test_{admin_num}@mlrit.ac.in"
    r = requests.post(f"{BASE_URL}/auth/admin/signup", json={
        'accessSessionToken': admin_session_token,
        'fullName': 'Test Placement Admin',
        'adminId': f"ADM{admin_num}",
        'email': admin_email,
        'password': 'AdminSecure@2026'
    })
    assert r.status_code == 201, f"Admin signup failed: {r.text}"
    admin_signup_data = r.json()
    verif_code = admin_signup_data.get('verificationCode')
    assert verif_code, "No verification code returned for admin"
    print("8. Admin Signup with Mandatory Verification: PASS (201 - 6-digit code issued)")

    # 6. Admin Login Blocked Prior to Verification
    r = requests.post(f"{BASE_URL}/auth/login", json={
        'identifier': admin_email,
        'password': 'AdminSecure@2026',
        'portal': 'admin'
    })
    assert r.status_code == 403, "Admin login was not blocked before verification"
    assert r.json().get('requiresVerification') is True
    print("9. Admin Login Blocked Prior to Verification: PASS (403 requiresVerification=True)")

    # 7. Admin Verifies Email
    r = requests.post(f"{BASE_URL}/auth/verify-email", json={
        'email': admin_email,
        'code': verif_code
    })
    assert r.status_code == 200, f"Email verification failed: {r.text}"
    print("10. Admin Email Verification: PASS (200)")

    # 8. Admin Login Succeeds
    r = requests.post(f"{BASE_URL}/auth/login", json={
        'identifier': admin_email,
        'password': 'AdminSecure@2026',
        'portal': 'admin'
    })
    assert r.status_code == 200, f"Admin login failed: {r.text}"
    admin_login_data = r.json()
    admin_token = admin_login_data['token']
    assert admin_login_data.get('user', {}).get('role') == 'admin'
    print("11. Admin Login Post-Verification: PASS (200 - Role verified as admin)")

    # 9. Authorization Checks
    # Student accessing admin students list -> Must be 403
    r = requests.get(f"{BASE_URL}/admin/students", headers={'Authorization': f"Bearer {student_token}"})
    assert r.status_code == 403, "Student was able to access admin students API"
    print("12. Student Role Protection on Admin API: PASS (403 Forbidden)")

    # Admin accessing admin students list -> 200
    r = requests.get(f"{BASE_URL}/admin/students", headers={'Authorization': f"Bearer {admin_token}"})
    assert r.status_code == 200, f"Admin failed to access admin students: {r.text}"
    print("13. Admin Access to Admin Students API: PASS (200)")

    # 10. Placement Drives CRUD & Registration
    # Admin creates drive
    r = requests.post(f"{BASE_URL}/drives", headers={'Authorization': f"Bearer {admin_token}"}, json={
        'company': 'Atlassian India',
        'role': 'Product Engineer',
        'package': '32.0 LPA',
        'packageValue': 32.0,
        'tier': 'Super Dream',
        'allowedBranches': ['CSE', 'CSE-AI/ML', 'CSE-DS'],
        'minCgpa': 7.5,
        'driveDate': '2026-11-28',
        'deadline': '2026-11-18'
    })
    assert r.status_code == 201, f"Create drive failed: {r.text}"
    created_drive = r.json()['drive']
    drive_id = created_drive['id']
    print(f"14. Admin Create Drive ({created_drive['company']}): PASS (201)")

    # Student registers for drive
    r = requests.post(f"{BASE_URL}/drives/{drive_id}/register", headers={'Authorization': f"Bearer {student_token}"})
    assert r.status_code == 200, f"Student register drive failed: {r.text}"
    assert r.json().get('isRegistered') is True
    print("15. Student Register for Drive: PASS (200 - isRegistered=True)")

    # 11. Jobs & Internships
    r = requests.get(f"{BASE_URL}/jobs")
    assert r.status_code == 200
    jobs = r.json()['jobs']
    assert len(jobs) > 0
    print(f"16. Get Jobs Listing: PASS (200 - {len(jobs)} jobs retrieved)")

    # Student applies for job
    first_job_id = jobs[0]['id']
    r = requests.post(f"{BASE_URL}/jobs/{first_job_id}/apply", headers={'Authorization': f"Bearer {student_token}"})
    assert r.status_code == 200
    assert r.json().get('hasApplied') is True
    print("17. Student Apply for Job: PASS (200 - hasApplied=True)")

    # 12. Training Classes
    r = requests.get(f"{BASE_URL}/training")
    assert r.status_code == 200
    print(f"18. Get Training Classes: PASS (200 - {len(r.json()['training'])} classes)")

    # 13. Student Queries & Admin Reply
    r = requests.post(f"{BASE_URL}/queries", headers={'Authorization': f"Bearer {student_token}"}, json={
        'subject': 'Request for mock technical interview schedule',
        'category': 'Interview Prep',
        'message': 'Could you please confirm if mock interviews for Google SDE will be conducted this week?'
    })
    assert r.status_code == 201
    qry_id = r.json()['query']['id']
    print("19. Student Submit Query: PASS (201)")

    # Admin replies
    r = requests.post(f"{BASE_URL}/queries/{qry_id}/reply", headers={'Authorization': f"Bearer {admin_token}"}, json={
        'responseText': 'Mock interviews for Google will be held on Thursday in Seminar Hall 2 starting at 10 AM.'
    })
    assert r.status_code == 200
    assert r.json()['query']['status'] == 'Resolved'
    print("20. Admin Reply to Query: PASS (200 - Status=Resolved)")

    # 14. Attendance Module Updates
    r = requests.put(f"{BASE_URL}/attendance/students/{rand_id}", headers={'Authorization': f"Bearer {admin_token}"}, json={
        'moduleName': 'technical',
        'newScore': 95
    })
    assert r.status_code == 200
    assert r.json()['record']['technical'] == 95
    print("21. Admin Update Student Attendance: PASS (200 - technical=95)")

    # 15. Student Profile Updates
    r = requests.put(f"{BASE_URL}/profile", headers={'Authorization': f"Bearer {student_token}"}, json={
        'bio': 'Updated student bio for 2026 placement season.',
        'skills': ['Python', 'SQL', 'FastAPI', 'Machine Learning']
    })
    assert r.status_code == 200
    print("22. Student Update Profile: PASS (200)")

    # 16. Reviews & Announcements
    r = requests.get(f"{BASE_URL}/announcements")
    assert r.status_code == 200
    print(f"23. Announcements: PASS (200 - {len(r.json()['announcements'])} announcements)")

    print("\n==================================================")
    print(" ALL 23 BACKEND INTEGRATION TESTS PASSED 100%!   ")
    print("==================================================")

if __name__ == '__main__':
    test_complete_backend()
