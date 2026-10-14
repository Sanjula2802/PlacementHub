import bcrypt from 'bcryptjs';
import {
  createUser,
  findUserByEmail,
  findUserByIdentifier,
  createInvitation
} from '../data/store.js';
import { CONFIG, generateSecureToken, generateNumericCode } from '../config.js';

const args = process.argv.slice(2);

async function run() {
  console.log('==============================================');
  console.log('   PlacementHub Super Admin Provisioning CLI  ');
  console.log('==============================================\n');

  // Check if CLI command is to generate an invitation
  if (args[0] === '--invite') {
    const inviteEmail = args[1] || process.env.INVITE_EMAIL;
    if (!inviteEmail) {
      console.error('Error: Please specify email to invite: node initSuperAdmin.js --invite <email>');
      process.exit(1);
    }
    const token = generateSecureToken(24);
    const code = generateNumericCode(6);
    const inv = createInvitation({
      email: inviteEmail,
      token,
      code,
      invitedBy: 'Super Admin CLI'
    });
    console.log(`[SUCCESS] Admin Invitation generated successfully!`);
    console.log(`Email:           ${inv.email}`);
    console.log(`One-Time Code:   ${inv.code}`);
    console.log(`Invite Token:    ${inv.token}`);
    console.log(`Expires In:      ${CONFIG.ADMIN_INVITE_EXPIRY_HOURS} hours`);
    console.log(`Invite URL:      http://localhost:5173/login?invite=${inv.token}`);
    process.exit(0);
  }

  // Provisioning Super Admin
  const email = (args[0] || process.env.SUPER_ADMIN_EMAIL || '').trim().toLowerCase();
  const adminId = (args[1] || process.env.SUPER_ADMIN_ID || 'SUPERADM01').trim().toUpperCase();
  const fullName = args[2] || process.env.SUPER_ADMIN_NAME || 'Super Administrator';
  const password = args[3] || process.env.SUPER_ADMIN_PASSWORD;

  if (!email || !password) {
    console.log('Usage: node server/scripts/initSuperAdmin.js <email> <adminId> <fullName> <password>');
    console.log('Or use environment variables:');
    console.log('  SUPER_ADMIN_EMAIL="dean@mlrit.ac.in"');
    console.log('  SUPER_ADMIN_ID="ADM001"');
    console.log('  SUPER_ADMIN_NAME="Dean Placements"');
    console.log('  SUPER_ADMIN_PASSWORD="YourStrongPassword!1"');
    console.log('\nTo generate a one-time invite token for another admin:');
    console.log('  node server/scripts/initSuperAdmin.js --invite <email>\n');
    process.exit(1);
  }

  // Check if account already exists
  const existing = findUserByEmail(email) || findUserByIdentifier(adminId);
  if (existing) {
    console.log(`[INFO] Administrator account (${email} / ${adminId}) already exists.`);
    process.exit(0);
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);

  // Create super admin
  const admin = createUser({
    fullName,
    email,
    adminId,
    role: 'admin',
    department: 'Placement Cell',
    passwordHash,
    isVerified: true,
    isSuperAdmin: true
  });

  console.log('[SUCCESS] Super Administrator account provisioned successfully!');
  console.log(`Name:        ${admin.fullName}`);
  console.log(`Admin ID:    ${admin.adminId}`);
  console.log(`Email:       ${admin.email}`);
  console.log(`Role:        ${admin.role} (Super Admin: true)`);
  console.log('Status:      Verified & Ready for login\n');
  process.exit(0);
}

run().catch((err) => {
  console.error('[ERROR] Failed to provision Super Admin:', err);
  process.exit(1);
});
