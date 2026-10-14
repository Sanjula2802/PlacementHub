import jwt from 'jsonwebtoken';
import { CONFIG } from '../config.js';
import { findUserById } from '../data/store.js';

// Authenticate JWT Token
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. No authorization token provided.',
      code: 'UNAUTHORIZED'
    });
  }

  jwt.verify(token, CONFIG.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired session token. Please log in again.',
        code: 'TOKEN_EXPIRED_OR_INVALID'
      });
    }

    // Verify user still exists in persistence store and evaluate dynamic policy status
    const user = findUserById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User account not found or has been revoked.',
        code: 'USER_NOT_FOUND'
      });
    }

    // Attach verified user (without password hash)
    req.user = {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role, // server-verified role
      adminStatus: user.adminStatus, // 'ACTIVE' | 'PENDING_POLICY' | 'DENIED_POLICY'
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

    next();
  });
};

// Require Admin Role Middleware
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required.',
      code: 'UNAUTHORIZED'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Access denied: Administrator privileges required.',
      code: 'FORBIDDEN',
      currentRole: req.user.role
    });
  }

  // Super admins are always authorized
  if (req.user.isSuperAdmin) {
    return next();
  }

  // Policy-based authorization checks:
  if (req.user.adminStatus === 'PENDING_POLICY') {
    return res.status(403).json({
      success: false,
      error: 'Administrator authorization has not been configured yet. Access to administrative APIs is restricted until the college administrator email policy is confirmed.',
      code: 'ADMIN_POLICY_NOT_CONFIGURED',
      adminStatus: 'PENDING_POLICY'
    });
  }

  if (req.user.adminStatus === 'DENIED_POLICY') {
    return res.status(403).json({
      success: false,
      error: 'Access denied: Your email address is not in the college-authorized administrator allowlist.',
      code: 'ADMIN_EMAIL_NOT_AUTHORIZED',
      adminStatus: 'DENIED_POLICY'
    });
  }

  next();
};

// Require Student Role Middleware
export const requireStudent = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required.',
      code: 'UNAUTHORIZED'
    });
  }

  if (req.user.role !== 'student') {
    return res.status(403).json({
      success: false,
      error: 'Access denied: Student access required.',
      code: 'FORBIDDEN',
      currentRole: req.user.role
    });
  }

  next();
};

// Require Super Admin Middleware
export const requireSuperAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin' || !req.user.isSuperAdmin) {
    return res.status(403).json({
      success: false,
      error: 'Access denied: Super Administrator authorization required.',
      code: 'FORBIDDEN'
    });
  }

  next();
};
