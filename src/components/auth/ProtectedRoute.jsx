import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { usePlacement } from '../../context/PlacementContext';
import AccessDeniedPage from '../../pages/auth/AccessDeniedPage';

export const ProtectedRoute = ({ allowedRole, children }) => {
  const { currentUser, isAuthChecking } = usePlacement();
  const location = useLocation();

  // Show loading indicator while session is being verified against the backend
  if (isAuthChecking) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#F8FAFC',
          color: '#334155',
          fontFamily: 'inherit'
        }}
      >
        <div
          style={{
            width: 42,
            height: 42,
            border: '3px solid #E2E8F0',
            borderTopColor: '#2563EB',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ marginTop: 16, fontSize: '0.875rem', fontWeight: 500, color: '#64748B' }}>
          Verifying security credentials with server...
        </p>
      </div>
    );
  }

  // 1. Unauthenticated users must be redirected to login
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Role Check: Admin Route Protection
  if (allowedRole === 'admin') {
    if (currentUser.role !== 'admin') {
      return <AccessDeniedPage reason="ROLE_NOT_ADMIN" />;
    }

    // Check policy status for non-superadmin accounts
    if (!currentUser.isSuperAdmin) {
      if (currentUser.adminStatus === 'PENDING_POLICY') {
        return <AccessDeniedPage reason="POLICY_NOT_CONFIGURED" />;
      }
      if (currentUser.adminStatus === 'DENIED_POLICY') {
        return <AccessDeniedPage reason="EMAIL_NOT_AUTHORIZED" />;
      }
    }
  }

  // 3. Role Check: Student Route Protection for Admin users
  if (allowedRole === 'student' && currentUser.role !== 'student') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Render children or Outlet for nested routes
  return children ? children : <Outlet />;
};

export default ProtectedRoute;
