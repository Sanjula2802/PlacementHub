import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import {
  createInvitation,
  getAllInvitations,
  getAllUsers
} from '../data/store.js';
import {
  generateNumericCode,
  generateSecureToken,
  getAdminEmailAllowlist,
  setAdminEmailAllowlist
} from '../config.js';

const router = express.Router();

// Apply authentication and strict admin check on all /api/admin routes
router.use(authenticateToken);
router.use(requireAdmin);

// ==========================================
// 1. GENERATE ONE-TIME ADMIN INVITATION
// ==========================================
router.post('/invitations', (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({
        success: false,
        error: 'A valid official email address is required to issue an invitation.'
      });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const token = generateSecureToken(24);
    const code = generateNumericCode(6);

    const invitation = createInvitation({
      email: trimmedEmail,
      token,
      code,
      invitedBy: req.user.email
    });

    return res.status(201).json({
      success: true,
      message: `Admin invitation successfully generated for ${trimmedEmail}.`,
      invitation: {
        id: invitation.id,
        email: invitation.email,
        token: invitation.token,
        code: invitation.code,
        expiresAt: invitation.expiresAt,
        invitedBy: invitation.invitedBy
      }
    });
  } catch (err) {
    console.error('Create invitation error:', err);
    return res.status(500).json({ success: false, error: 'Server error generating invitation.' });
  }
});

// ==========================================
// 2. LIST INVITATIONS
// ==========================================
router.get('/invitations', (req, res) => {
  try {
    const invitations = getAllInvitations();
    return res.json({ success: true, invitations });
  } catch (err) {
    console.error('Get invitations error:', err);
    return res.status(500).json({ success: false, error: 'Server error fetching invitations.' });
  }
});

// ==========================================
// 3. GET REGISTERED STUDENTS (ADMIN ONLY)
// ==========================================
router.get('/students', (req, res) => {
  try {
    const allUsers = getAllUsers();
    const students = allUsers
      .filter((u) => u.role === 'student')
      .map((s) => ({
        id: s.id,
        fullName: s.fullName,
        studentId: s.studentId,
        email: s.email,
        department: s.department,
        section: s.section,
        year: s.year,
        cgpa: s.cgpa,
        isVerified: s.isVerified,
        createdAt: s.createdAt
      }));

    return res.json({ success: true, students });
  } catch (err) {
    console.error('Get students error:', err);
    return res.status(500).json({ success: false, error: 'Server error fetching students.' });
  }
});

// ==========================================
// 4. CONFIGURE ADMINISTRATOR EMAIL ALLOWLIST POLICY
// ==========================================
router.get('/policy', (req, res) => {
  try {
    const allowlist = getAdminEmailAllowlist();
    return res.json({
      success: true,
      allowlist,
      isConfigured: Boolean(allowlist)
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Server error fetching policy.' });
  }
});

router.post('/policy', (req, res) => {
  try {
    const { allowlist } = req.body;
    setAdminEmailAllowlist(allowlist || '');
    return res.json({
      success: true,
      message: 'Administrator email allowlist policy updated successfully.',
      allowlist: getAdminEmailAllowlist(),
      isConfigured: Boolean(getAdminEmailAllowlist())
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Server error updating policy.' });
  }
});

// ==========================================
// 5. SECURITY AUDIT & SYSTEM STATUS
// ==========================================
router.get('/security-status', (req, res) => {
  try {
    const allUsers = getAllUsers();
    const totalStudents = allUsers.filter((u) => u.role === 'student').length;
    const verifiedStudents = allUsers.filter((u) => u.role === 'student' && u.isVerified).length;
    const totalAdmins = allUsers.filter((u) => u.role === 'admin').length;
    const activeAdmins = allUsers.filter((u) => u.role === 'admin' && (u.adminStatus === 'ACTIVE' || u.isSuperAdmin)).length;
    const pendingAdmins = allUsers.filter((u) => u.role === 'admin' && u.adminStatus === 'PENDING_POLICY').length;
    const invitations = getAllInvitations();
    const pendingInvitations = invitations.filter((i) => !i.used && Date.now() < i.expiresAt).length;

    return res.json({
      success: true,
      security: {
        serverRoleEnforcement: 'ACTIVE',
        authenticationStrategy: 'JWT_HMAC_SHA256',
        passwordEncryption: 'BCRYPT_10_ROUNDS',
        totalAdmins,
        activeAdmins,
        pendingAdmins,
        totalStudents,
        verifiedStudents,
        pendingInvitations,
        currentUserRole: req.user.role,
        isPolicyConfigured: Boolean(getAdminEmailAllowlist())
      }
    });
  } catch (err) {
    console.error('Security status error:', err);
    return res.status(500).json({ success: false, error: 'Server error fetching security status.' });
  }
});

export default router;
