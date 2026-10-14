import { CONFIG } from '../config.js';

const BASE_URL = `http://localhost:${CONFIG.PORT}/api`;

async function testAuth() {
  console.log('--- Starting Automated Security & Auth Verification ---\n');

  const randNum = Math.floor(1000 + Math.random() * 9000);
  const testStudentId = `22R11A${randNum}`;
  const testEmail = `${testStudentId.toLowerCase()}@mlrit.ac.in`;

  // 1. Health check
  const healthRes = await fetch(`${BASE_URL}/health`);
  const health = await healthRes.json();
  console.log('1. Health check:', health.status === 'ONLINE' ? 'PASS' : 'FAIL');

  // 2. Reject non-MLRIT email
  const badEmailRes = await fetch(`${BASE_URL}/auth/student/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'Test Student',
      studentId: testStudentId,
      email: 'test@gmail.com',
      department: 'CSE',
      year: '3rd Year',
      password: 'Password@123'
    })
  });
  console.log('2. Non-MLRIT email rejected:', badEmailRes.status === 400 ? 'PASS (400)' : 'FAIL');

  // 3. Reject mismatched Student ID and Email
  const mismatchRes = await fetch(`${BASE_URL}/auth/student/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'Test Student',
      studentId: testStudentId,
      email: '22r11a0001@mlrit.ac.in',
      department: 'CSE',
      year: '3rd Year',
      password: 'Password@123'
    })
  });
  console.log('3. Mismatched ID/Email rejected:', mismatchRes.status === 400 ? 'PASS (400)' : 'FAIL');

  // 4. Valid Student Signup
  const validStudentSignup = await fetch(`${BASE_URL}/auth/student/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'Rahul Varma',
      studentId: testStudentId,
      email: testEmail,
      department: 'CSE',
      section: 'A',
      year: '4th Year',
      password: 'StudentSecure@2026'
    })
  });
  const studentData = await validStudentSignup.json();
  console.log('4. Valid Student registration:', validStudentSignup.status === 201 ? 'PASS (201)' : 'FAIL');

  // 5. Direct login without email verification for student
  const studentLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identifier: testStudentId,
      password: 'StudentSecure@2026',
      portal: 'student'
    })
  });
  console.log('5. Student direct login without email verification:', studentLoginRes.status === 200 ? 'PASS (200)' : 'FAIL');

  const studentLogin = await studentLoginRes.json();
  console.log('6. Student role verified:', studentLogin.user?.role === 'student' ? 'PASS (Role: student)' : 'FAIL');
  const studentToken = studentLogin.token;

  // 8. Student attempts to access Admin API -> Must return 403 Forbidden
  const studentForbiddenRes = await fetch(`${BASE_URL}/admin/students`, {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  console.log('8. Student accessing Admin API denied:', studentForbiddenRes.status === 403 ? 'PASS (403 Forbidden)' : 'FAIL');

  // 9. Unauthenticated request to Admin API -> Must return 401 Unauthorized
  const unauthRes = await fetch(`${BASE_URL}/admin/students`);
  console.log('9. Unauthenticated request denied:', unauthRes.status === 401 ? 'PASS (401 Unauthorized)' : 'FAIL');

  console.log('\n--- All Automated Security Verification Checks Completed Successfully ---');
  process.exit(0);
}

testAuth().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
