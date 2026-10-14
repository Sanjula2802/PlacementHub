import axios from 'axios';

const API_BASE = '/api';
export const TOKEN_STORAGE_KEY = 'placementhub_auth_token';

export const getStoredToken = () => {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
};

export const setStoredToken = (token) => {
  try {
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch (err) {
    console.error('Failed to store auth token:', err);
  }
};

export const clearStoredToken = () => {
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear auth token:', err);
  }
};

// Create Axios instance with base configuration
const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 15000
});

// Request interceptor to attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = getStoredToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to unwrap data and normalize errors
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response) {
      const errData = error.response.data || {};
      const customError = new Error(errData.error || `Request failed with status ${error.response.status}`);
      customError.status = error.response.status;
      customError.code = errData.code;
      customError.data = errData;
      return Promise.reject(customError);
    } else if (error.request) {
      const netErr = new Error('Cannot connect to backend server. Please ensure the Flask server is running on port 5000.');
      netErr.isNetworkError = true;
      return Promise.reject(netErr);
    }
    return Promise.reject(error);
  }
);

export const api = {
  // ================= Auth Endpoints =================
  studentSignup: (formData) => apiClient.post('/auth/student/signup', formData),

  validateAdminAccessCode: (accessCode) => apiClient.post('/auth/admin/validate-access-code', { accessCode }),

  adminSignup: (data) => apiClient.post('/auth/admin/signup', data),

  verifyEmail: (email, code) => apiClient.post('/auth/verify-email', { email, code }),

  resendVerification: (email) => apiClient.post('/auth/resend-verification', { email }),

  login: (identifier, password, portal) => apiClient.post('/auth/login', { identifier, password, portal }),

  getMe: () => apiClient.get('/auth/me'),

  getPolicyStatus: () => apiClient.get('/auth/admin/policy-status'),

  // ================= Placement Drives =================
  getDrives: () => apiClient.get('/drives'),

  getDrive: (id) => apiClient.get(`/drives/${id}`),

  createDrive: (data) => apiClient.post('/drives', data),

  updateDrive: (id, data) => apiClient.put(`/drives/${id}`, data),

  deleteDrive: (id) => apiClient.delete(`/drives/${id}`),

  registerDrive: (id) => apiClient.post(`/drives/${id}/register`),

  // ================= Job Opportunities =================
  getJobs: () => apiClient.get('/jobs'),

  createJob: (data) => apiClient.post('/jobs', data),

  updateJob: (id, data) => apiClient.put(`/jobs/${id}`, data),

  deleteJob: (id) => apiClient.delete(`/jobs/${id}`),

  applyJob: (id) => apiClient.post(`/jobs/${id}/apply`),

  // ================= Internships =================
  getInternships: () => apiClient.get('/internships'),

  createInternship: (data) => apiClient.post('/internships', data),

  updateInternship: (id, data) => apiClient.put(`/internships/${id}`, data),

  deleteInternship: (id) => apiClient.delete(`/internships/${id}`),

  applyInternship: (id) => apiClient.post(`/internships/${id}/apply`),

  // ================= Training Classes =================
  getTraining: () => apiClient.get('/training'),

  createTraining: (data) => apiClient.post('/training', data),

  updateTraining: (id, data) => apiClient.put(`/training/${id}`, data),

  deleteTraining: (id) => apiClient.delete(`/training/${id}`),

  // ================= Attendance =================
  getAttendanceSummary: () => apiClient.get('/attendance/summary'),

  getStudentsAttendance: () => apiClient.get('/attendance/students'),

  updateStudentAttendance: (studentId, moduleName, newScore) =>
    apiClient.put(`/attendance/students/${studentId}`, { moduleName, newScore }),

  // ================= Certifications =================
  getCertifications: () => apiClient.get('/certifications'),

  createCertification: (data) => apiClient.post('/certifications', data),

  registerCertification: (id) => apiClient.post(`/certifications/${id}/register`),

  // ================= Assessment Exams =================
  getExams: () => apiClient.get('/exams'),

  createExam: (data) => apiClient.post('/exams', data),

  // ================= Student Queries =================
  getQueries: () => apiClient.get('/queries'),

  addQuery: (data) => apiClient.post('/queries', data),

  replyQuery: (id, responseText) => apiClient.post(`/queries/${id}/reply`, { responseText }),

  // ================= Reviews & Feedback =================
  getReviews: () => apiClient.get('/reviews'),

  addReview: (data) => apiClient.post('/reviews', data),

  // ================= Announcements =================
  getAnnouncements: () => apiClient.get('/announcements'),

  createAnnouncement: (data) => apiClient.post('/announcements', data),

  deleteAnnouncement: (id) => apiClient.delete(`/announcements/${id}`),

  // ================= Notifications =================
  getNotifications: () => apiClient.get('/notifications'),

  markNotificationRead: (id) => apiClient.put(`/notifications/${id}/read`),

  markAllNotificationsRead: () => apiClient.put('/notifications/read-all'),

  // ================= Profile =================
  getProfile: () => apiClient.get('/profile'),

  updateProfile: (data) => apiClient.put('/profile', data),

  updateProfileAvatar: (avatar) => apiClient.put('/profile/avatar', { avatar }),

  // ================= Admin Endpoints =================
  getAdminStudents: () => apiClient.get('/admin/students'),

  getSecurityStatus: () => apiClient.get('/admin/security-status'),

  createAdminInvitation: (email) => apiClient.post('/admin/invitations', { email }),

  getAdminInvitations: () => apiClient.get('/admin/invitations')
};

export default api;
