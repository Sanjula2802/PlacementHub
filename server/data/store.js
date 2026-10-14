import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { CONFIG, checkAdminEmailAuthorization } from '../config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'db.json');

// Initial clean database schema - zero fake accounts or demo credentials
const INITIAL_DB = {
  users: [],
  verificationTokens: [],
  invitations: [],
  accessSessions: []
};

// Ensure database file exists
const ensureDbFile = () => {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DB, null, 2), 'utf-8');
  }
};

// Read database
export const readDb = () => {
  ensureDbFile();
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!parsed.accessSessions) parsed.accessSessions = [];
    return parsed;
  } catch (err) {
    console.error('Error reading db.json:', err);
    return INITIAL_DB;
  }
};

// Write database
export const writeDb = (data) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing db.json:', err);
    return false;
  }
};

// User Operations
export const findUserById = (id) => {
  const db = readDb();
  const user = db.users.find((u) => u.id === id);
  if (!user) return null;
  return evaluateAndUpdateAdminPolicy(user, db);
};

export const findUserByEmail = (email) => {
  if (!email) return null;
  const db = readDb();
  const lower = email.trim().toLowerCase();
  const user = db.users.find((u) => u.email.toLowerCase() === lower);
  if (!user) return null;
  return evaluateAndUpdateAdminPolicy(user, db);
};

export const findUserByIdentifier = (identifier) => {
  if (!identifier) return null;
  const db = readDb();
  const query = identifier.trim().toLowerCase();
  const user = db.users.find(
    (u) =>
      u.email.toLowerCase() === query ||
      (u.studentId && u.studentId.toLowerCase() === query) ||
      (u.adminId && u.adminId.toLowerCase() === query)
  );
  if (!user) return null;
  return evaluateAndUpdateAdminPolicy(user, db);
};

/**
 * Automatically evaluates whether a pending admin account has become authorized
 * once the administrator email allowlist policy has been configured.
 */
function evaluateAndUpdateAdminPolicy(user, db) {
  if (user.role === 'admin' && !user.isSuperAdmin) {
    const authCheck = checkAdminEmailAuthorization(user.email);
    let changed = false;

    if (authCheck.isPolicyConfigured) {
      if (authCheck.isAuthorized && user.isVerified) {
        if (user.adminStatus !== 'ACTIVE') {
          user.adminStatus = 'ACTIVE';
          changed = true;
        }
      } else if (!authCheck.isAuthorized) {
        if (user.adminStatus !== 'DENIED_POLICY') {
          user.adminStatus = 'DENIED_POLICY';
          changed = true;
        }
      }
    } else {
      // Policy is not configured yet
      if (user.adminStatus !== 'PENDING_POLICY') {
        user.adminStatus = 'PENDING_POLICY';
        changed = true;
      }
    }

    if (changed) {
      writeDb(db);
    }
  }
  return user;
}

export const createUser = (userData) => {
  const db = readDb();
  
  // Calculate initial admin status based on authorization policy
  let initialAdminStatus = null;
  if (userData.role === 'admin') {
    if (userData.isSuperAdmin) {
      initialAdminStatus = 'ACTIVE';
    } else {
      const authCheck = checkAdminEmailAuthorization(userData.email);
      if (authCheck.isPolicyConfigured && authCheck.isAuthorized && userData.isVerified) {
        initialAdminStatus = 'ACTIVE';
      } else {
        // Keep pending until policy is configured & email verified
        initialAdminStatus = 'PENDING_POLICY';
      }
    }
  }

  const newUser = {
    id: userData.id || `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    fullName: userData.fullName.trim(),
    email: userData.email.trim().toLowerCase(),
    role: userData.role, // strictly assigned by backend route logic
    adminStatus: initialAdminStatus, // 'ACTIVE' | 'PENDING_POLICY' | 'DENIED_POLICY'
    studentId: userData.studentId ? userData.studentId.trim().toUpperCase() : null,
    adminId: userData.adminId ? userData.adminId.trim().toUpperCase() : null,
    department: userData.department || (userData.role === 'admin' ? 'Placement Cell' : 'General'),
    section: userData.section || '',
    year: userData.year || '',
    cgpa: userData.cgpa || 0,
    avatar: userData.avatar || '',
    passwordHash: userData.passwordHash,
    isVerified: userData.role === 'student' ? true : Boolean(userData.isVerified),
    isSuperAdmin: Boolean(userData.isSuperAdmin),
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);
  writeDb(db);
  return newUser;
};

export const updateUser = (id, updates) => {
  const db = readDb();
  const index = db.users.findIndex((u) => u.id === id);
  if (index === -1) return null;

  db.users[index] = {
    ...db.users[index],
    ...updates
  };
  writeDb(db);
  return db.users[index];
};

export const getAllUsers = () => {
  const db = readDb();
  return db.users;
};

// Email Verification Tokens
export const saveVerificationCode = (email, code) => {
  const db = readDb();
  const lower = email.trim().toLowerCase();
  db.verificationTokens = db.verificationTokens.filter((t) => t.email.toLowerCase() !== lower);
  
  const expiry = Date.now() + CONFIG.EMAIL_VERIFICATION_EXPIRY_HOURS * 60 * 60 * 1000;
  db.verificationTokens.push({
    email: lower,
    code,
    expiresAt: expiry,
    createdAt: new Date().toISOString()
  });

  writeDb(db);
  return { email: lower, code, expiresAt: expiry };
};

export const verifyCode = (email, code) => {
  const db = readDb();
  const lower = email.trim().toLowerCase();
  const trimmedCode = code.trim();

  const recordIndex = db.verificationTokens.findIndex(
    (t) => t.email.toLowerCase() === lower && t.code === trimmedCode
  );

  if (recordIndex === -1) {
    return { success: false, error: 'Invalid verification code.' };
  }

  const record = db.verificationTokens[recordIndex];
  if (Date.now() > record.expiresAt) {
    db.verificationTokens.splice(recordIndex, 1);
    writeDb(db);
    return { success: false, error: 'Verification code has expired. Please request a new one.' };
  }

  // Code is valid: Mark user as verified
  const user = db.users.find((u) => u.email.toLowerCase() === lower);
  if (user) {
    user.isVerified = true;
    
    // If admin, check if email allowlist policy auto-authorizes this account now
    if (user.role === 'admin' && !user.isSuperAdmin) {
      const authCheck = checkAdminEmailAuthorization(user.email);
      if (authCheck.isPolicyConfigured) {
        user.adminStatus = authCheck.isAuthorized ? 'ACTIVE' : 'DENIED_POLICY';
      } else {
        user.adminStatus = 'PENDING_POLICY';
      }
    }
  }

  // Remove used token
  db.verificationTokens.splice(recordIndex, 1);
  writeDb(db);

  return { success: true, user };
};

// Admin Invitations
export const createInvitation = ({ email, token, code, invitedBy }) => {
  const db = readDb();
  const lower = email.trim().toLowerCase();
  const expiry = Date.now() + CONFIG.ADMIN_INVITE_EXPIRY_HOURS * 60 * 60 * 1000;

  const invitation = {
    id: `inv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    email: lower,
    token,
    code,
    invitedBy: invitedBy || 'Super Admin',
    expiresAt: expiry,
    used: false,
    usedBy: null,
    createdAt: new Date().toISOString()
  };

  db.invitations.push(invitation);
  writeDb(db);
  return invitation;
};

export const findInvitationByTokenOrCode = (tokenOrCode) => {
  if (!tokenOrCode) return null;
  const db = readDb();
  const query = tokenOrCode.trim();

  return (
    db.invitations.find(
      (inv) => !inv.used && (inv.token === query || inv.code === query)
    ) || null
  );
};

export const markInvitationAsUsed = (invitationId, adminUserId) => {
  const db = readDb();
  const inv = db.invitations.find((i) => i.id === invitationId);
  if (inv) {
    inv.used = true;
    inv.usedBy = adminUserId;
    inv.usedAt = new Date().toISOString();
    writeDb(db);
    return true;
  }
  return false;
};

export const getAllInvitations = () => {
  const db = readDb();
  return db.invitations.map((i) => ({
    id: i.id,
    email: i.email,
    code: i.code,
    invitedBy: i.invitedBy,
    expiresAt: i.expiresAt,
    used: i.used,
    createdAt: i.createdAt
  }));
};

// Admin Access Code Session Tokens
export const saveAdminAccessSession = (token) => {
  const db = readDb();
  const expiry = Date.now() + CONFIG.ADMIN_ACCESS_SESSION_EXPIRY_MINUTES * 60 * 1000;
  
  // Clean up expired sessions
  db.accessSessions = (db.accessSessions || []).filter((s) => s.expiresAt > Date.now());
  
  db.accessSessions.push({
    token,
    expiresAt: expiry,
    createdAt: new Date().toISOString()
  });

  writeDb(db);
  return { token, expiresAt: expiry };
};

export const isValidAdminAccessSession = (token) => {
  if (!token) return false;
  const db = readDb();
  const session = (db.accessSessions || []).find((s) => s.token === token);
  if (!session) return false;
  return Date.now() < session.expiresAt;
};

export const consumeAdminAccessSession = (token) => {
  if (!token) return false;
  const db = readDb();
  const index = (db.accessSessions || []).findIndex((s) => s.token === token);
  if (index !== -1) {
    db.accessSessions.splice(index, 1);
    writeDb(db);
    return true;
  }
  return false;
};
