import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const POLICY_FILE = path.join(__dirname, 'data', 'policy.json');

export const CONFIG = {
  PORT: process.env.PORT || 5000,
  JWT_SECRET: process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? '' : 'dev_jwt_secret_not_for_production'),
  JWT_EXPIRES_IN: '7d',

  // Shared Admin Access Code (Validated on backend via environment)
  ADMIN_ACCESS_CODE: process.env.ADMIN_ACCESS_CODE || (process.env.NODE_ENV === 'production' ? '' : 'MLRIT@2026'),

  // Administrator Email Allowlist default
  ADMIN_EMAIL_ALLOWLIST: process.env.ADMIN_EMAIL_ALLOWLIST || '',

  // Strict MLRIT validation rules
  MLRIT_EMAIL_REGEX: /^[a-zA-Z0-9]+@mlrit\.ac\.in$/i,
  STUDENT_ID_REGEX: /^[0-9]{2}[a-zA-Z0-9]{8}$/i,

  // Verification & Access Token Expirations
  EMAIL_VERIFICATION_EXPIRY_HOURS: 24,
  ADMIN_INVITE_EXPIRY_HOURS: 48,
  ADMIN_ACCESS_SESSION_EXPIRY_MINUTES: 20,

  // Password complexity policy
  PASSWORD_POLICY: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
    requireSpecial: true
  }
};

export const generateSecureToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

export const generateNumericCode = (digits = 6) => {
  const min = Math.pow(10, digits - 1);
  const max = Math.pow(10, digits) - 1;
  return Math.floor(min + Math.random() * (max - min + 1)).toString();
};

export const getAdminEmailAllowlist = () => {
  try {
    if (fs.existsSync(POLICY_FILE)) {
      const raw = fs.readFileSync(POLICY_FILE, 'utf-8');
      const data = JSON.parse(raw);
      if (data && typeof data.adminEmailAllowlist === 'string') {
        return data.adminEmailAllowlist.trim();
      }
    }
  } catch {
    // Ignore and fallback
  }

  return (process.env.ADMIN_EMAIL_ALLOWLIST || CONFIG.ADMIN_EMAIL_ALLOWLIST || '').trim();
};

export const setAdminEmailAllowlist = (allowlist) => {
  try {
    fs.writeFileSync(
      POLICY_FILE,
      JSON.stringify({ adminEmailAllowlist: allowlist || '' }, null, 2),
      'utf-8'
    );
    return true;
  } catch (err) {
    console.error('Error writing policy.json:', err);
    return false;
  }
};

/**
 * Checks if the college administrator email authorization policy is configured,
 * and if the given email is authorized under the allowlist.
 *
 * @param {string} email
 * @returns {{ isPolicyConfigured: boolean, isAuthorized: boolean, reason: string }}
 */
export const checkAdminEmailAuthorization = (email) => {
  const allowlistRaw = getAdminEmailAllowlist();

  // If allowlist is not configured or empty, policy has not yet been confirmed
  if (!allowlistRaw) {
    return {
      isPolicyConfigured: false,
      isAuthorized: false,
      reason: 'POLICY_UNCONFIGURED'
    };
  }

  if (!email || typeof email !== 'string') {
    return {
      isPolicyConfigured: true,
      isAuthorized: false,
      reason: 'INVALID_EMAIL'
    };
  }

  const normalizedEmail = email.trim().toLowerCase();
  const allowedList = allowlistRaw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  const isMatched = allowedList.some((entry) => {
    // Exact match
    if (entry === normalizedEmail) return true;
    // Wildcard domain match, e.g. "*@admin.mlrit.ac.in"
    if (entry.startsWith('*@')) {
      const domain = entry.slice(2);
      return normalizedEmail.endsWith(`@${domain}`);
    }
    return false;
  });

  return {
    isPolicyConfigured: true,
    isAuthorized: isMatched,
    reason: isMatched ? 'AUTHORIZED' : 'EMAIL_NOT_IN_ALLOWLIST'
  };
};
