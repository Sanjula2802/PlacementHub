import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  User,
  Shield,
  HelpCircle,
  LogOut,
  ChevronDown,
  Camera
} from 'lucide-react';
import { usePlacement } from '../../context/PlacementContext';
import NotificationPanel from '../common/NotificationPanel';

export const Navbar = ({ onMenuClick }) => {
  const { currentUser, logout, notifications, openProfilePicModal } = usePlacement();
  const navigate = useNavigate();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [navSearch, setNavSearch] = useState('');

  const profileRef = useRef(null);
  const unreadCount = notifications.filter((n) => !n.read).length;
  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (navSearch.trim()) {
      if (isAdmin) {
        navigate(`/admin/drives`);
      } else {
        navigate(`/drives`);
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header
      style={{
        height: 'var(--navbar-height)',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid var(--border-color)',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 800,
        boxShadow: 'var(--shadow-sm)'
      }}
    >
      {/* Left: Mobile hamburger & Global Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1, maxWidth: 500 }}>
        <button
          onClick={onMenuClick}
          className="mobile-hamburger-btn"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-main)',
            cursor: 'pointer',
            padding: 8,
            borderRadius: 'var(--radius-sm)',
            display: 'none',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          aria-label="Toggle Navigation Menu"
        >
          <Menu size={22} />
        </button>

        <form onSubmit={handleSearchSubmit} style={{ width: '100%', position: 'relative' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)'
            }}
          />
          <input
            type="text"
            value={navSearch}
            onChange={(e) => setNavSearch(e.target.value)}
            placeholder="Search drives, jobs, companies, skills..."
            style={{
              width: '100%',
              padding: '8px 14px 8px 36px',
              backgroundColor: '#f8fafc',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.84rem',
              outline: 'none',
              color: 'var(--text-main)',
              transition: 'all 0.2s'
            }}
            onFocus={(e) => {
              e.target.style.backgroundColor = '#ffffff';
              e.target.style.borderColor = 'var(--primary)';
              e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.backgroundColor = '#f8fafc';
              e.target.style.borderColor = 'var(--border-color)';
              e.target.style.boxShadow = 'none';
            }}
          />
        </form>
      </div>

      {/* Right: Notifications, Role indicator & Profile dropdown */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {/* Role badge */}
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: isAdmin ? '#fef3c7' : '#eff6ff',
            color: isAdmin ? '#b45309' : '#1d4ed8',
            border: `1px solid ${isAdmin ? '#fde68a' : '#bfdbfe'}`,
            letterSpacing: '0.04em'
          }}
          className="navbar-role-badge"
        >
          {isAdmin ? 'Admin View' : 'Student'}
        </span>

        {/* Notifications Icon Button */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              border: '1px solid var(--border-color)',
              backgroundColor: isNotifOpen ? '#f1f5f9' : '#ffffff',
              color: 'var(--text-main)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              transition: 'all 0.15s'
            }}
            aria-label="View notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  width: 9,
                  height: 9,
                  backgroundColor: 'var(--danger)',
                  borderRadius: '50%',
                  border: '2px solid #ffffff'
                }}
              />
            )}
          </button>

          <NotificationPanel isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
        </div>

        {/* User Profile Menu */}
        <div style={{ position: 'relative' }} ref={profileRef}>
          <div
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '4px 8px 4px 4px',
              borderRadius: 'var(--radius-full)',
              cursor: 'pointer',
              border: '1px solid transparent',
              transition: 'background-color 0.15s'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            {currentUser?.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser?.name || 'User'}
                title="Click to change profile picture"
                onClick={(e) => {
                  e.stopPropagation();
                  openProfilePicModal();
                }}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '1.5px solid var(--primary-border)',
                  cursor: 'pointer',
                  transition: 'transform 0.15s'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              />
            ) : (
              /* Blank profile picture area - no initials, no icons */
              <div
                role="button"
                title="Click to set profile picture"
                onClick={(e) => {
                  e.stopPropagation();
                  openProfilePicModal();
                }}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  backgroundColor: '#f1f5f9',
                  border: '1.5px dashed #cbd5e1',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--primary)';
                  e.currentTarget.style.backgroundColor = '#e2e8f0';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#cbd5e1';
                  e.currentTarget.style.backgroundColor = '#f1f5f9';
                }}
              />
            )}
            <div style={{ display: 'none' }} className="navbar-username-block">
              <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.2, display: 'block' }}>
                {currentUser?.name || 'User'}
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {isAdmin ? 'Administrator' : 'Student'}
              </span>
            </div>
            <ChevronDown size={14} color="var(--text-muted)" />
          </div>

          {/* Profile Dropdown Content */}
          {isProfileMenuOpen && (
            <div
              style={{
                position: 'absolute',
                top: '50px',
                right: 0,
                width: 220,
                backgroundColor: '#ffffff',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-xl)',
                border: '1px solid var(--border-color)',
                zIndex: 1100,
                padding: '6px',
                animation: 'slideUp 0.15s ease-out'
              }}
            >
              <div style={{ padding: '8px 12px 10px 12px', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {currentUser?.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{currentUser?.email}</div>
              </div>

              <div style={{ padding: '6px 0' }}>
                <button
                  onClick={() => {
                    openProfilePicModal();
                    setIsProfileMenuOpen(false);
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: 'var(--text-main)',
                    fontSize: '0.84rem',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <Camera size={15} color="var(--primary)" />
                  Change Profile Picture
                </button>

                <button
                  onClick={() => {
                    navigate('/profile');
                    setIsProfileMenuOpen(false);
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: 'var(--text-main)',
                    fontSize: '0.84rem',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <User size={15} color="var(--primary)" />
                  View Profile
                </button>

                <button
                  onClick={() => {
                    navigate('/queries');
                    setIsProfileMenuOpen(false);
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: 'var(--text-main)',
                    fontSize: '0.84rem',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <HelpCircle size={15} color="#059669" />
                  Career Help Desk
                </button>
              </div>

              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 6 }}>
                <button
                  onClick={handleLogout}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: 'var(--danger)',
                    fontSize: '0.84rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fef2f2')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <LogOut size={15} />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
