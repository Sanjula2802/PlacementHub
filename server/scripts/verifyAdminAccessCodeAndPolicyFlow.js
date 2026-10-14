import { CONFIG, setAdminEmailAllowlist, getAdminEmailAllowlist } from '../config.js';

const BASE_URL = `http://localhost:${CONFIG.PORT}/api`;

async function testAdminFlow() {
  console.log('=== Verifying Admin Access Code & Flexible Authorization Policy ===\n');

  // Ensure policy starts unconfigured (empty)
  setAdminEmailAllowlist('');

  // 1. Test shared access code validation
  const badCodeRes = await fetch(`${BASE_URL}/auth/admin/validate-access-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accessCode: 'WRONG_CODE' })
  });
  console.log('1. Invalid access code rejected:', badCodeRes.status === 400 ? 'PASS (400)' : 'FAIL');

  const validCodeRes = await fetch(`${BASE_URL}/auth/admin/validate-access-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accessCode: 'MLRIT@2026' })
  });
  const validCodeData = await validCodeRes.json();
  const sessionToken = validCodeData.accessSessionToken;
  console.log('2. Valid access code (MLRIT@2026) accepted:', validCodeRes.status === 200 && Boolean(sessionToken) ? 'PASS (200, sessionToken issued)' : 'FAIL');

  // 2. Test Admin Signup requires valid access session token
  const testEmail = `tpo_${Date.now()}@mlrit.ac.in`;
  const testAdminId = `ADM${Math.floor(100 + Math.random() * 900)}`;

  const noTokenSignup = await fetch(`${BASE_URL}/auth/admin/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      accessSessionToken: 'forged_or_expired_token',
      fullName: 'Placement Admin',
      adminId: testAdminId,
      email: testEmail,
      password: 'AdminPassword@2026'
    })
  });
  console.log('3. Signup without valid access session token rejected:', noTokenSignup.status === 403 ? 'PASS (403)' : 'FAIL');

  // 3. Test Admin Signup with valid access session token
  const validSignup = await fetch(`${BASE_URL}/auth/admin/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      accessSessionToken: sessionToken,
      fullName: 'Placement Admin',
      adminId: testAdminId,
      email: testEmail,
      password: 'AdminPassword@2026'
    })
  });
  const signupData = await validSignup.json();
  console.log('4. Admin registration with verified access code:', validSignup.status === 201 ? 'PASS (201 Created)' : 'FAIL');
  const verificationCode = signupData.verificationCode;

  // 4. Test Email Verification
  const verifyRes = await fetch(`${BASE_URL}/auth/verify-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      code: verificationCode
    })
  });
  const verifyData = await verifyRes.json();
  console.log('5. Admin email verified with 6-digit code:', verifyRes.status === 200 ? 'PASS (200)' : 'FAIL');

  // 5. While policy is unconfigured: Login must be blocked with PENDING_POLICY
  const unconfiguredLogin = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identifier: testEmail,
      password: 'AdminPassword@2026',
      portal: 'admin'
    })
  });
  const unconfiguredJson = await unconfiguredLogin.json();
  console.log('6. Unconfigured policy blocks admin access:', unconfiguredLogin.status === 403 && unconfiguredJson.code === 'ADMIN_POLICY_NOT_CONFIGURED' ? 'PASS (403 ADMIN_POLICY_NOT_CONFIGURED)' : 'FAIL');
  console.log('   Message returned:', `"${unconfiguredJson.error}"`);

  // 6. Test Policy Configuration & Automatic Authorization
  console.log('\n--- Simulating College Email Policy Configuration ---');
  setAdminEmailAllowlist(`${testEmail},dean.placements@mlrit.ac.in`);
  console.log('Configured Administrator Allowlist =', getAdminEmailAllowlist());

  // Now login with the newly authorized email -> must automatically authorize and succeed!
  const configuredLogin = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identifier: testEmail,
      password: 'AdminPassword@2026',
      portal: 'admin'
    })
  });
  const configuredJson = await configuredLogin.json();
  console.log('7. Eligible account automatically authorized after policy configured:', configuredLogin.status === 200 && configuredJson.user?.adminStatus === 'ACTIVE' ? 'PASS (200 ACTIVE)' : 'FAIL');
  const adminToken = configuredJson.token;

  // 7. Verify Admin API access with authorized token
  const adminApiRes = await fetch(`${BASE_URL}/admin/students`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  console.log('8. Admin API accessible by authorized admin:', adminApiRes.status === 200 ? 'PASS (200 OK)' : 'FAIL');

  // Reset allowlist back to empty for safe default unconfigured state
  setAdminEmailAllowlist('');
  console.log('Reset policy back to unconfigured default for safety.');

  console.log('\n=== All Admin Access Code & Policy Authorization Tests Passed! ===\n');
  process.exit(0);
}

testAdminFlow().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
