import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PlacementProvider } from './context/PlacementContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Auth Page
import LoginPage from './pages/auth/LoginPage';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import PlacementDrivesPage from './pages/student/PlacementDrivesPage';
import DriveDetailsPage from './pages/student/DriveDetailsPage';
import JobsPage from './pages/student/JobsPage';
import InternshipsPage from './pages/student/InternshipsPage';
import TrainingPage from './pages/student/TrainingPage';
import AttendancePage from './pages/student/AttendancePage';
import CertificationsPage from './pages/student/CertificationsPage';
import ExamsPage from './pages/student/ExamsPage';
import ReviewsPage from './pages/student/ReviewsPage';
import QueriesPage from './pages/student/QueriesPage';
import ProfilePage from './pages/student/ProfilePage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminStudentsPage from './pages/admin/AdminStudentsPage';
import AdminDrivesPage from './pages/admin/AdminDrivesPage';
import AdminJobsPage from './pages/admin/AdminJobsPage';
import AdminInternshipsPage from './pages/admin/AdminInternshipsPage';
import AdminTrainingPage from './pages/admin/AdminTrainingPage';
import AdminAttendancePage from './pages/admin/AdminAttendancePage';
import AdminCertificationsPage from './pages/admin/AdminCertificationsPage';
import AdminExamsPage from './pages/admin/AdminExamsPage';
import AdminQueriesPage from './pages/admin/AdminQueriesPage';
import AdminFeedbackPage from './pages/admin/AdminFeedbackPage';
import AdminAnnouncementsPage from './pages/admin/AdminAnnouncementsPage';
import ErrorBoundary from './components/common/ErrorBoundary';

export function App() {
  return (
    <PlacementProvider>
      <BrowserRouter>
        <ErrorBoundary>
          <Routes>
          {/* Default entry route redirects to /login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Authentication Entry Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Student Portal Routes */}
          <Route element={<ProtectedRoute allowedRole="student" />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<StudentDashboard />} />
              <Route path="/student/dashboard" element={<StudentDashboard />} />
              <Route path="/drives" element={<PlacementDrivesPage />} />
              <Route path="/drives/:id" element={<DriveDetailsPage />} />
              <Route path="/jobs" element={<JobsPage />} />
              <Route path="/internships" element={<InternshipsPage />} />
              <Route path="/training" element={<TrainingPage />} />
              <Route path="/attendance" element={<AttendancePage />} />
              <Route path="/certifications" element={<CertificationsPage />} />
              <Route path="/exams" element={<ExamsPage />} />
              <Route path="/reviews" element={<ReviewsPage />} />
              <Route path="/queries" element={<QueriesPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
          </Route>

          {/* Protected Admin Console Routes */}
          <Route element={<ProtectedRoute allowedRole="admin" />}>
            <Route element={<Layout />}>
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/students" element={<AdminStudentsPage />} />
              <Route path="/admin/drives" element={<AdminDrivesPage />} />
              <Route path="/admin/jobs" element={<AdminJobsPage />} />
              <Route path="/admin/internships" element={<AdminInternshipsPage />} />
              <Route path="/admin/training" element={<AdminTrainingPage />} />
              <Route path="/admin/attendance" element={<AdminAttendancePage />} />
              <Route path="/admin/certifications" element={<AdminCertificationsPage />} />
              <Route path="/admin/exams" element={<AdminExamsPage />} />
              <Route path="/admin/queries" element={<AdminQueriesPage />} />
              <Route path="/admin/feedback" element={<AdminFeedbackPage />} />
              <Route path="/admin/announcements" element={<AdminAnnouncementsPage />} />
            </Route>
          </Route>

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
    </PlacementProvider>
  );
}

export default App;
