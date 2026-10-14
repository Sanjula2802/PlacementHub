import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {
  CONFIG,
  generateNumericCode,
  generateSecureToken,
  checkAdminEmailAuthorization
} from '../config.js';
import {
  findUserByIdentifier,
  findUserByEmail,
  createUser,
  saveVerificationCode,
  verifyCode,
  findInvitationByTokenOrCode,
  markInvitationAsUsed,
  saveAdminAccessSession,
  isValidAdminAccessSession,
  consumeAdminAccessSession
} from '../data/store.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Helper: Password complexity validator
const validatePasswordComplexity = (pwd) => {
  if (!pwd || typeof pwd !== 'string') return false;
  const minLength = pwd.length >= CONFIG.PASSWORD_POLICY.minLength;
  const hasUpper = /[A-Z]/.test(pwd);
  const hasLower = /[a-z]/.test(pwd);
  const hasNumber = /[0-9]/.test(pwd);
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(pwd);
  return minLength && hasUpper && hasLower && hasNumber && hasSpecial;
};

// ==========================================
// 1. STUDENT SIGNUP (PUBLIC)
// ==========================================
router.post('/student/signup', async (req, res) => {
  try {
    const { fullName, studentId, email, department, section, year, password } = req.body;

    // 1. Full name validation
    if (!fullName || typeof fullName !== 'string' || !fullName.trim()) {
      return res.status(400).json({ success: false, error: 'Full Name is required.' });
    }

    // 2. Student ID format validation
    const trimmedId = (studentId || '').trim();
    if (!CONFIG.STUDENT_ID_REGEX.test(trimmedId)) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid 10-character Student ID (e.g., 22R11A0501).'
      });
    }

    // 3. MLRIT College Email validation
    const trimmedEmail = (email || '').trim().toLowerCase();
    if (!CONFIG.MLRIT_EMAIL_REGEX.test(trimmedEmail)) {
      return res.status(400).json({
        success: false,
        error: 'Please use your official MLRIT college email (e.g., [studentId]@mlrit.ac.in).'
      });
    }

    // 4. Student ID and Email Match validation
    const emailPrefix = trimmedEmail.split('@')[0];
    if (emailPrefix.toLowerCase() !== trimmedId.toLowerCase()) {
      return res.status(400).json({
        success: false,
        error: 'Student ID and college email do not match.'
      });
    }

    // 5. Branch, Section & Year validation
    const ALLOWED_DEPARTMENTS = [
      'CSE',
      'CSE-AI/ML',
      'CSE-DS',
      'ECE',
      'EEE',
      'MECH',
      'AERO'
    ];
    const ALLOWED_SECTIONS = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    const ALLOWED_YEARS = ['3rd Year', '4th Year'];

    if (!department || !ALLOWED_DEPARTMENTS.includes(department)) {
      return res.status(400).json({
        success: false,
        error: 'Please select a valid branch (CSE, CSE-AI/ML, CSE-DS, ECE, EEE, MECH, AERO).'
      });
    }

    if (!section || !ALLOWED_SECTIONS.includes(section)) {
      return res.status(400).json({
        success: false,
        error: 'Please select a valid section (A, B, C, D, E, F, G).'
      });
    }

    if (!year || !ALLOWED_YEARS.includes(year)) {
      return res.status(400).json({
        success: false,
        error: 'Please select a valid year (3rd Year or 4th Year).'
      });
    }

    // 6. Password complexity
    if (!validatePasswordComplexity(password)) {
      return res.status(400).json({
        success: false,
        error:
          'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.'
      });
    }

    // 7. Duplicate Check
    const existingUser = findUserByIdentifier(trimmedId) || findUserByEmail(trimmedEmail);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'An account with this Student ID or email already exists.'
      });
    }

    // 8. Hash Password
    const passwordHash = await bcrypt.hash(password, 10);

    // 9. Assign role strictly as 'student' on backend (isVerified: true, no verification code required)
    const newUser = createUser({
      fullName,
      studentId: trimmedId,
      email: trimmedEmail,
      role: 'student', // STRICTLY server-assigned
      department,
      section,
      year,
      passwordHash,
      isVerified: true,
      isSuperAdmin: false
    });

    return res.status(201).json({
      success: true,
      message: 'Student account registered successfully! You may now log in.',
      email: trimmedEmail,
      studentId: trimmedId
    });
  } catch (err) {
    console.error('Student signup error:', err);
    return res.status(500).json({ success: false, error: 'Server error during student registration.' });
  }
});

// ==========================================
// 2. ADMIN ACCESS CODE VALIDATION
// ==========================================
router.post('/admin/validate-access-code', (req, res) => {
  try {
    const { accessCode } = req.body;

    if (!accessCode || typeof accessCode !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Please enter the administrator access code.'
      });
    }

    // Compare with server environment configuration (MLRIT@2026)
    const expectedCode = CONFIG.ADMIN_ACCESS_CODE.trim();
    if (accessCode.trim() !== expectedCode) {
      return res.status(400).json({
        success: false,
        error: 'Invalid administrator access code. Please verify the code with placement administration.'
      });
    }

    // Generate short-lived session token allowing the Admin Signup form to be filled and submitted
    const sessionToken = generateSecureToken(24);
    saveAdminAccessSession(sessionToken);

    return res.json({
      success: true,
      message: 'Access code verified successfully. You may now complete administrator registration.',
      accessSessionToken: sessionToken
    });
  } catch (err) {
    console.error('Validate access code error:', err);
    return res.status(500).json({ success: false, error: 'Server error validating access code.' });
  }
});

// ==========================================
// 3. ADMIN SIGNUP (PROTECTED BY ACCESS CODE)
// ==========================================
router.post('/admin/signup', async (req, res) => {
  try {
    const { accessSessionToken, fullName, adminId, email, password } = req.body;

    // 1. Verify access code session token
    if (!accessSessionToken || !isValidAdminAccessSession(accessSessionToken)) {
      return res.status(403).json({
        success: false,
        error: 'Your access code session has expired or is invalid. Please re-enter the administrator access code.'
      });
    }

    // 2. Full Name validation
    if (!fullName || typeof fullName !== 'string' || !fullName.trim()) {
      return res.status(400).json({ success: false, error: 'Full Name is required.' });
    }

    // 3. Admin ID validation
    const trimmedAdminId = (adminId || '').trim().toUpperCase();
    if (!trimmedAdminId) {
      return res.status(400).json({ success: false, error: 'Admin ID is required.' });
    }

    // 4. Email format validation
    const trimmedEmail = (email || '').trim().toLowerCase();
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      return res.status(400).json({ success: false, error: 'Please enter a valid administrator email address.' });
    }

    // 5. Password complexity validation
    if (!validatePasswordComplexity(password)) {
      return res.status(400).json({
        success: false,
        error:
          'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.'
      });
    }

    // 6. Duplicate check
    const existingUser = findUserByIdentifier(trimmedAdminId) || findUserByEmail(trimmedEmail);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'An administrator account with this Admin ID or email already exists.'
      });
    }

    // 7. Check allowlist policy on backend
    const authCheck = checkAdminEmailAuthorization(trimmedEmail);
    let initialStatus = 'PENDING_POLICY';
    if (authCheck.isPolicyConfigured) {
      initialStatus = authCheck.isAuthorized ? 'PENDING_POLICY' : 'DENIED_POLICY';
    }

    // 8. Hash Password
    const passwordHash = await bcrypt.hash(password, 10);

    // 9. Create Admin User
    const newAdmin = createUser({
      fullName,
      adminId: trimmedAdminId,
      email: trimmedEmail,
      role: 'admin', // Assigned strictly on backend
      adminStatus: initialStatus,
      department: 'Placement Cell',
      passwordHash,
      isVerified: false,
      isSuperAdmin: false
    });

    // 10. Consume access session token (prevent reuse)
    consumeAdminAccessSession(accessSessionToken);

    // 11. Generate 6-digit email verification code
    const verificationCode = generateNumericCode(6);
    saveVerificationCode(trimmedEmail, verificationCode);

    return res.status(201).json({
      success: true,
      message:
        'Admin account registered successfully! A 6-digit verification code has been dispatched to your email address.',
      email: trimmedEmail,
      adminId: trimmedAdminId,
      adminStatus: newAdmin.adminStatus,
      isPolicyConfigured: authCheck.isPolicyConfigured,
      verificationCode // returned for test/preview environment
    });
  } catch (err) {
    console.error('Admin signup error:', err);
    return res.status(500).json({ success: false, error: 'Server error during administrator registration.' });
  }
});

// ==========================================
// 4. EMAIL VERIFICATION
// ==========================================
router.post('/verify-email', (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        error: 'Email and verification code are required.'
      });
    }

    const result = verifyCode(email, code);
    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error });
    }

    const user = result.user;
    let message = 'Email verified successfully! You may now log in.';
    
    if (user && user.role === 'admin' && !user.isSuperAdmin) {
      if (user.adminStatus === 'PENDING_POLICY') {
        message = 'Email verified! Note: Administrator authorization has not yet been configured on the backend; access will be activated once the college admin policy is confirmed.';
      } else if (user.adminStatus === 'ACTIVE') {
        message = 'Email verified and administrator account successfully authorized!';
      }
    }

    return res.json({
      success: true,
      message,
      adminStatus: user?.adminStatus
    });
  } catch (err) {
    console.error('Email verification error:', err);
    return res.status(500).json({ success: false, error: 'Server error during email verification.' });
  }
});

// Resend Verification Code
router.post('/resend-verification', (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required.' });
    }

    const user = findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ success: false, error: 'No account found with this email.' });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, error: 'This email is already verified. Please log in.' });
    }

    const verificationCode = generateNumericCode(6);
    saveVerificationCode(email, verificationCode);

    return res.json({
      success: true,
      message: 'A fresh verification code has been dispatched.',
      verificationCode
    });
  } catch (err) {
    console.error('Resend verification error:', err);
    return res.status(500).json({ success: false, error: 'Server error resending verification code.' });
  }
});

// ==========================================
// 5. LOGIN (STUDENT & ADMIN)
// ==========================================
router.post('/login', async (req, res) => {
  try {
    const { identifier, password, portal } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please enter your ID/email and password.'
      });
    }

    const user = findUserByIdentifier(identifier);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid ID/email or password.'
      });
    }

    // Verify Password Hash
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid ID/email or password.'
      });
    }

    // Require Email Verification ONLY for admin accounts
    if (user.role === 'admin' && !user.isVerified) {
      return res.status(403).json({
        success: false,
        error: 'Email verification required before login. Please verify your administrator email.',
        requiresVerification: true,
        email: user.email
      });
    }

    // Prevent cross-portal role mismatch
    if (portal === 'admin' && user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied: This account does not have administrator privileges.',
        code: 'FORBIDDEN'
      });
    }

    if (portal === 'student' && user.role !== 'student') {
      return res.status(403).json({
        success: false,
        error: 'Access denied: Administrator accounts must log in via the Admin Console.',
        code: 'FORBIDDEN'
      });
    }

    // Enforce Policy Checks on Admin Logins
    if (user.role === 'admin' && !user.isSuperAdmin) {
      if (user.adminStatus === 'PENDING_POLICY') {
        return res.status(403).json({
          success: false,
          error:
            'Administrator authorization has not been configured. Your account is pending confirmation of the official college admin email policy.',
          code: 'ADMIN_POLICY_NOT_CONFIGURED',
          adminStatus: 'PENDING_POLICY',
          email: user.email
        });
      }

      if (user.adminStatus === 'DENIED_POLICY') {
        return res.status(403).json({
          success: false,
          error: 'Access denied: Your email address is not in the college-authorized administrator allowlist.',
          code: 'ADMIN_EMAIL_NOT_AUTHORIZED',
          adminStatus: 'DENIED_POLICY',
          email: user.email
        });
      }
    }

    // Sign JWT Token with server-verified role
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role, // strictly embedded in signed JWT
        adminStatus: user.adminStatus,
        name: user.fullName,
        isSuperAdmin: Boolean(user.isSuperAdmin)
      },
      CONFIG.JWT_SECRET,
      { expiresIn: CONFIG.JWT_EXPIRES_IN }
    );

    const safeUser = {
      id: user.id,
      name: user.fullName,
      email: user.email,
      role: user.role,
      adminStatus: user.adminStatus,
      studentId: user.studentId,
      adminId: user.adminId,
      department: user.department,
      section: user.section,
      year: user.year,
      cgpa: user.cgpa,
      avatar: user.avatar,
      isVerified: user.isVerified,
      isSuperAdmin: user.isSuperAdmin
    };

    return res.json({
      success: true,
      token,
      user: safeUser
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, error: 'Server error during login.' });
  }
});

// ==========================================
// 6. VERIFY CURRENT SESSION (/api/auth/me)
// ==========================================
router.get('/me', authenticateToken, (req, res) => {
  return res.json({
    success: true,
    user: req.user
  });
});

// ==========================================
// 7. GET POLICY STATUS
// ==========================================
router.get('/admin/policy-status', (req, res) => {
  const allowlistRaw = (process.env.ADMIN_EMAIL_ALLOWLIST !== undefined 
    ? process.env.ADMIN_EMAIL_ALLOWLIST 
    : CONFIG.ADMIN_EMAIL_ALLOWLIST).trim();

  return res.json({
    success: true,
    isPolicyConfigured: Boolean(allowlistRaw)
  });
});

// ==========================================
// 8. ADMIN INVITATION ENDPOINTS (BACKWARD COMPATIBLE)
// ==========================================
router.post('/admin/validate-invite', (req, res) => {
  try {
    const { tokenOrCode } = req.body;
    if (!tokenOrCode) {
      return res.status(400).json({ success: false, error: 'Invitation token or code is required.' });
    }

    const invitation = findInvitationByTokenOrCode(tokenOrCode);
    if (!invitation) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or already used invitation token/code.'
      });
    }

    if (Date.now() > invitation.expiresAt) {
      return res.status(400).json({
        success: false,
        error: 'This invitation has expired. Please contact an authorized Super Admin.'
      });
    }

    return res.json({
      success: true,
      invitation: {
        email: invitation.email,
        expiresAt: invitation.expiresAt,
        code: invitation.code
      }
    });
  } catch (err) {
    console.error('Validate invite error:', err);
    return res.status(500).json({ success: false, error: 'Server error validating invitation.' });
  }
});

router.post('/admin/accept-invite', async (req, res) => {
  try {
    const { tokenOrCode, fullName, adminId, password } = req.body;

    if (!tokenOrCode) {
      return res.status(400).json({ success: false, error: 'Invitation token is required.' });
    }

    const invitation = findInvitationByTokenOrCode(tokenOrCode);
    if (!invitation) {
      return res.status(400).json({
        success: false,
        error: 'Invalid, already used, or expired invitation token/code.'
      });
    }

    if (Date.now() > invitation.expiresAt) {
      return res.status(400).json({
        success: false,
        error: 'This invitation has expired. Please request a new invitation.'
      });
    }

    if (!fullName || !fullName.trim()) {
      return res.status(400).json({ success: false, error: 'Full Name is required.' });
    }

    const trimmedAdminId = (adminId || '').trim().toUpperCase();
    if (!trimmedAdminId) {
      return res.status(400).json({ success: false, error: 'Admin ID is required.' });
    }

    if (!validatePasswordComplexity(password)) {
      return res.status(400).json({
        success: false,
        error:
          'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.'
      });
    }

    const existingUser = findUserByIdentifier(trimmedAdminId);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'An administrator with this Admin ID already exists.'
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newAdmin = createUser({
      fullName,
      email: invitation.email,
      adminId: trimmedAdminId,
      role: 'admin',
      adminStatus: 'ACTIVE', // Invitations by super admin are explicitly pre-authorized
      department: 'Placement Cell',
      passwordHash,
      isVerified: true,
      isSuperAdmin: false
    });

    markInvitationAsUsed(invitation.id, newAdmin.id);

    const token = jwt.sign(
      {
        id: newAdmin.id,
        email: newAdmin.email,
        role: 'admin',
        adminStatus: 'ACTIVE',
        name: newAdmin.fullName,
        isSuperAdmin: false
      },
      CONFIG.JWT_SECRET,
      { expiresIn: CONFIG.JWT_EXPIRES_IN }
    );

    return res.status(201).json({
      success: true,
      message: 'Admin account provisioned successfully!',
      token,
      user: {
        id: newAdmin.id,
        name: newAdmin.fullName,
        email: newAdmin.email,
        role: 'admin',
        adminStatus: 'ACTIVE',
        adminId: newAdmin.adminId,
        department: newAdmin.department,
        avatar: newAdmin.avatar
      }
    });
  } catch (err) {
    console.error('Accept invite error:', err);
    return res.status(500).json({ success: false, error: 'Server error accepting admin invitation.' });
  }
});

export default router;
