// LocalStorage keys
export const STORAGE_KEYS = {
  STUDENTS: 'placementhub_students',
  ADMINS: 'placementhub_admins',
  CURRENT_USER: 'placementhub_current_user'
};

// Initial default accounts - completely empty
const DEFAULT_STUDENTS = [];
const DEFAULT_ADMINS = [];

// Validation Helper Functions
export const isValidStudentId = (id) => {
  if (!id || typeof id !== 'string') return false;
  const trimmed = id.trim();
  // Exactly 10 characters, starts with 2 digits, followed by 8 alphanumeric characters
  return /^[0-9]{2}[a-zA-Z0-9]{8}$/.test(trimmed);
};

export const isValidMlritEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const trimmed = email.trim().toLowerCase();
  // Must match [studentId]@mlrit.ac.in and strictly end with @mlrit.ac.in
  return /^[a-zA-Z0-9]+@mlrit\.ac\.in$/.test(trimmed);
};

export const doStudentIdAndEmailMatch = (studentId, email) => {
  if (!studentId || !email) return false;
  const idLower = studentId.trim().toLowerCase();
  const emailUsername = email.trim().toLowerCase().split('@')[0];
  return idLower === emailUsername;
};

export const checkPasswordCriteria = (pwd) => {
  if (!pwd || typeof pwd !== 'string') {
    return {
      minLength: false,
      hasUpper: false,
      hasLower: false,
      hasNumber: false,
      hasSpecial: false,
      isComplete: false
    };
  }
  const minLength = pwd.length >= 8;
  const hasUpper = /[A-Z]/.test(pwd);
  const hasLower = /[a-z]/.test(pwd);
  const hasNumber = /[0-9]/.test(pwd);
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(pwd);

  return {
    minLength,
    hasUpper,
    hasLower,
    hasNumber,
    hasSpecial,
    isComplete: minLength && hasUpper && hasLower && hasNumber && hasSpecial
  };
};

// Initialize storage cleanly - remove any legacy mock accounts
export const initAuthStorage = () => {
  if (typeof window === 'undefined') return;

  try {
    const rawStudents = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    if (rawStudents) {
      const parsed = JSON.parse(rawStudents);
      if (Array.isArray(parsed)) {
        const cleaned = parsed.filter(
          (s) =>
            s.fullName !== 'Aarav Sharma' &&
            s.email !== 'aarav.sharma@college.edu' &&
            s.studentId !== 'STU2026001'
        );
        localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(cleaned));
      }
    } else {
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify([]));
    }
  } catch {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify([]));
  }

  try {
    const rawAdmins = localStorage.getItem(STORAGE_KEYS.ADMINS);
    if (rawAdmins) {
      const parsed = JSON.parse(rawAdmins);
      if (Array.isArray(parsed)) {
        const cleaned = parsed.filter(
          (a) =>
            a.fullName !== 'Dr. Vikramaditya Sharma' &&
            a.email !== 'dean.placements@college.edu' &&
            a.adminId !== 'ADM001'
        );
        localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify(cleaned));
      }
    } else {
      localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify([]));
    }
  } catch {
    localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify([]));
  }
};

// Get stored students
export const getStoredStudents = () => {
  initAuthStorage();
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.STUDENTS)) || [];
  } catch {
    return [];
  }
};

// Get stored admins
export const getStoredAdmins = () => {
  initAuthStorage();
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.ADMINS)) || [];
  } catch {
    return [];
  }
};

// Get current session user
export const getCurrentUser = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!data) return null;
    const user = JSON.parse(data);
    // Don't retain mock demo user if stored in session
    if (
      user?.name === 'Aarav Sharma' ||
      user?.name === 'Dr. Vikramaditya Sharma' ||
      user?.email === 'dean.placements@college.edu'
    ) {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      return null;
    }
    return user;
  } catch {
    return null;
  }
};

// Set current session user
export const setCurrentUser = (user) => {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
};

// Register a new student
export const registerStudentAccount = (studentData) => {
  const students = getStoredStudents();
  const emailLower = studentData.email.trim().toLowerCase();
  const idLower = studentData.studentId.trim().toLowerCase();

  const existingEmail = students.find((s) => s.email.toLowerCase() === emailLower);
  const existingId = students.find((s) => s.studentId.toLowerCase() === idLower);

  if (existingEmail || existingId) {
    return { success: false, error: 'An account with this Student ID or email already exists.' };
  }

  const newStudent = {
    fullName: studentData.fullName.trim(),
    studentId: studentData.studentId.trim(),
    email: emailLower,
    password: studentData.password,
    department: studentData.department,
    section: studentData.section || '',
    year: studentData.year,
    role: 'student',
    cgpa: 0,
    avatar: ''
  };

  students.push(newStudent);
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  return { success: true, message: 'Student account created successfully! Please log in.' };
};

// Register a new admin
export const registerAdminAccount = (adminData) => {
  const admins = getStoredAdmins();
  const emailLower = adminData.email.trim().toLowerCase();
  const idUpper = adminData.adminId.trim().toUpperCase();

  const existingEmail = admins.find((a) => a.email.toLowerCase() === emailLower);
  if (existingEmail) {
    return { success: false, error: 'An account with this email already exists.' };
  }

  const existingId = admins.find((a) => a.adminId.toUpperCase() === idUpper);
  if (existingId) {
    return { success: false, error: 'An administrator with this Admin ID already exists.' };
  }

  const newAdmin = {
    fullName: adminData.fullName.trim(),
    adminId: idUpper,
    email: emailLower,
    password: adminData.password,
    department: 'Placement Cell',
    role: 'admin',
    avatar: ''
  };

  admins.push(newAdmin);
  localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify(admins));
  return { success: true, message: 'Admin account created successfully! Please log in.' };
};

// Authenticate login credentials
export const authenticateUser = (role, identifier, password) => {
  const query = identifier.trim().toLowerCase();

  if (role === 'student') {
    // Check if the user entered an email address (contains '@')
    if (query.includes('@')) {
      if (!isValidMlritEmail(query)) {
        return { success: false, error: 'Please use your official MLRIT college email.' };
      }
    }

    const students = getStoredStudents();
    const account = students.find(
      (s) => s.email.toLowerCase() === query || s.studentId.toLowerCase() === query
    );

    if (!account) {
      return { success: false, error: 'No account found. Please sign up first.' };
    }

    if (account.password !== password) {
      return { success: false, error: 'Invalid ID/email or password.' };
    }

    const sessionUser = {
      role: 'student',
      id: account.studentId,
      name: account.fullName,
      email: account.email,
      department: account.department,
      section: account.section || '',
      year: account.year,
      cgpa: account.cgpa || 0,
      avatar: account.avatar || ''
    };

    setCurrentUser(sessionUser);
    return { success: true, user: sessionUser };
  }

  if (role === 'admin') {
    const admins = getStoredAdmins();
    const account = admins.find(
      (a) => a.email.toLowerCase() === query || a.adminId.toLowerCase() === query
    );

    if (!account) {
      return { success: false, error: 'No account found. Please sign up first.' };
    }

    if (account.password !== password) {
      return { success: false, error: 'Invalid ID/email or password.' };
    }

    const sessionUser = {
      role: 'admin',
      id: account.adminId,
      name: account.fullName,
      email: account.email,
      department: account.department || 'Placement Cell',
      avatar: account.avatar || ''
    };

    setCurrentUser(sessionUser);
    return { success: true, user: sessionUser };
  }

  return { success: false, error: 'Invalid role specified.' };
};

// Update profile avatar in current session and persistent records
export const updateUserAvatar = (userId, role, avatarUrl) => {
  const normalizedAvatar = avatarUrl || '';
  
  // Update in session
  const current = getCurrentUser();
  if (current) {
    const updatedUser = { ...current, avatar: normalizedAvatar };
    setCurrentUser(updatedUser);
  }

  // Update in persistent list (students or admins)
  const targetRole = role || current?.role;
  const targetId = userId || current?.id;
  const targetEmail = current?.email;

  if (targetRole === 'student') {
    const students = getStoredStudents();
    const updatedList = students.map((s) => {
      if ((targetId && s.studentId === targetId) || (targetEmail && s.email === targetEmail)) {
        return { ...s, avatar: normalizedAvatar };
      }
      return s;
    });
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(updatedList));
  } else if (targetRole === 'admin') {
    const admins = getStoredAdmins();
    const updatedList = admins.map((a) => {
      if ((targetId && a.adminId === targetId) || (targetEmail && a.email === targetEmail)) {
        return { ...a, avatar: normalizedAvatar };
      }
      return a;
    });
    localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify(updatedList));
  }
};

