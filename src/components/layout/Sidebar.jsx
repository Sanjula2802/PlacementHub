import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Briefcase,
  GraduationCap,
  CalendarCheck,
  Award,
  FileText,
  Star,
  HelpCircle,
  UserCheck,
  Users,
  Megaphone,
  LogOut,
  Sparkles,
  ShieldAlert,
  ChevronRight,
  X
} from 'lucide-react';
import { usePlacement } from '../../context/PlacementContext';

export const Sidebar = ({ isOpen, onClose }) => {
  const { currentUser, logout, openProfilePicModal } = usePlacement();
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = currentUser?.role === 'admin';

  const studentLinks = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Placement Drives', path: '/drives', icon: Building2 },
    { label: 'Jobs', path: '/jobs', icon: Briefcase },
    { label: 'Internships', path: '/internships', icon: Sparkles },
    { label: 'Training Classes', path: '/training', icon: GraduationCap },
    { label: 'Attendance', path: '/attendance', icon: CalendarCheck },
    { label: 'Certifications', path: '/certifications', icon: Award },
    { label: 'Exams & Tests', path: '/exams', icon: FileText },
    { label: 'Reviews & Feedback', path: '/reviews', icon: Star },
    { label: 'Career Help Desk', path: '/queries', icon: HelpCircle },
    { label: 'Student Profile', path: '/profile', icon: UserCheck }
  ];

  const adminLinks = [
    { label: 'Admin Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Students Directory', path: '/admin/students', icon: Users },
    { label: 'Placement Drives', path: '/admin/drives', icon: Building2 },
    { label: 'Jobs Management', path: '/admin/jobs', icon: Briefcase },
    { label: 'Internships', path: '/admin/internships', icon: Sparkles },
    { label: 'Training Sessions', path: '/admin/training', icon: GraduationCap },
    { label: 'Attendance Records', path: '/admin/attendance', icon: CalendarCheck },
    { label: 'Certifications', path: '/admin/certifications', icon: Award },
    { label: 'Exams & Assessments', path: '/admin/exams', icon: FileText },
    { label: 'Student Queries', path: '/admin/queries', icon: HelpCircle },
    { label: 'Training Feedback', path: '/admin/feedback', icon: Star },
    { label: 'Announcements', path: '/admin/announcements', icon: Megaphone }
  ];

  const currentNavLinks = isAdmin ? adminLinks : studentLinks;

  const handleLogout = () => {
    logout();
    navigate('/login');
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(3px)',
            zIndex: 900
          }}
        />
      )}

      <aside
        style={{
          width: 'var(--sidebar-width)',
          backgroundColor: 'var(--sidebar-bg)',
          color: 'var(--sidebar-text)',
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid var(--sidebar-border)',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 950,
          transform: isOpen ? 'translateX(0)' : undefined
        }}
        className={`sidebar-container ${isOpen ? 'sidebar-open' : ''}`}
      >
        {/* Brand / Logo */}
        <div
          style={{
            height: 'var(--navbar-height)',
            padding: '0 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--sidebar-border)'
          }}
        >
          <div
            onClick={() => navigate(isAdmin ? '/admin/dashboard' : '/dashboard')}
            style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 2px 8px rgba(37, 99, 235, 0.4)'
              }}
            >
              <GraduationCap size={22} />
            </div>
            <div>
              <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
                Placement<span style={{ color: '#60a5fa' }}>Hub</span>
              </span>
              <span
                style={{
                  display: 'block',
                  fontSize: '0.6875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: isAdmin ? '#f59e0b' : '#94a3b8',
                  fontWeight: 600
                }}
              >
                {isAdmin ? 'Admin Console' : 'Student Portal'}
              </span>
            </div>
          </div>

          {/* Mobile close button */}
          <button
            onClick={onClose}
            className="mobile-close-btn"
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              display: 'none',
              padding: 4
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Verified Role Status Display */}
        <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--sidebar-border)' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 10px',
              backgroundColor: isAdmin ? 'rgba(245, 158, 11, 0.1)' : 'rgba(37, 99, 235, 0.1)',
              border: `1px solid ${isAdmin ? 'rgba(245, 158, 11, 0.25)' : 'rgba(37, 99, 235, 0.25)'}`,
              borderRadius: 'var(--radius-md)',
              color: isAdmin ? '#fbbf24' : '#93c5fd',
              fontSize: '0.75rem',
              fontWeight: 600
            }}
          >
            {isAdmin ? <ShieldCheck size={14} color="#f59e0b" /> : <GraduationCap size={14} color="#3b82f6" />}
            <span>{isAdmin ? 'Administrator Portal' : 'Student Portal'}</span>
          </div>
        </div>

        {/* Navigation Menu List */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: 4
          }}
        >
          <div
            style={{
              fontSize: '0.6875rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#64748b',
              padding: '0 10px 8px 10px'
            }}
          >
            {isAdmin ? 'ADMINISTRATION' : 'STUDENT NAVIGATION'}
          </div>

          {currentNavLinks.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#ffffff' : 'var(--sidebar-text)',
                  backgroundColor: isActive ? 'var(--sidebar-active)' : 'transparent',
                  transition: 'all var(--transition-fast)'
                }}
                className={({ isActive }) => (isActive ? 'active-sidebar-link' : 'sidebar-link')}
              >
                <Icon size={18} color={isActive ? '#ffffff' : '#94a3b8'} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        {/* User Footer Profile & Logout */}
        <div
          style={{
            padding: '16px',
            borderTop: '1px solid var(--sidebar-border)',
            backgroundColor: '#090d16'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            {currentUser?.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser?.name || 'User'}
                title="Click to change profile picture"
                onClick={openProfilePicModal}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid #334155',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'transform 0.15s, border-color 0.15s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--primary)';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#334155';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              />
            ) : (
              /* Completely blank profile picture area - no initials, no icons */
              <div
                role="button"
                onClick={openProfilePicModal}
                title="Click to set profile picture"
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  backgroundColor: '#1e293b',
                  border: '2px dashed #475569',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--primary)';
                  e.currentTarget.style.backgroundColor = '#334155';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#475569';
                  e.currentTarget.style.backgroundColor = '#1e293b';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              />
            )}
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <div
                style={{
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  color: '#ffffff',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden'
                }}
              >
                {currentUser?.name || (currentUser?.role === 'admin' ? 'Admin' : 'Student')}
              </div>
              <div
                style={{
                  fontSize: '0.72rem',
                  color: '#94a3b8',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden'
                }}
              >
                {currentUser?.role === 'admin' ? 'Administrator' : currentUser?.department || 'Student'}
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '8px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid #334155',
              backgroundColor: 'transparent',
              color: '#f87171',
              fontSize: '0.8125rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'background-color 0.15s'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <LogOut size={15} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
