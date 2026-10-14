import React from 'react';
import { Bell, Check, Info, Briefcase, GraduationCap, X } from 'lucide-react';
import { usePlacement } from '../../context/PlacementContext';

export const NotificationPanel = ({ isOpen, onClose }) => {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead } = usePlacement();

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type) => {
    switch (type) {
      case 'drive':
        return <Briefcase size={16} color="var(--primary)" />;
      case 'training':
        return <GraduationCap size={16} color="#059669" />;
      case 'attendance':
        return <Info size={16} color="#d97706" />;
      default:
        return <Bell size={16} color="var(--text-muted)" />;
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: '65px',
        right: '20px',
        width: '360px',
        maxWidth: 'calc(100vw - 32px)',
        backgroundColor: '#ffffff',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-xl)',
        border: '1px solid var(--border-color)',
        zIndex: 1100,
        overflow: 'hidden',
        animation: 'slideUp 0.18s ease-out'
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '14px 18px',
          borderBottom: '1px solid var(--border-color)',
          backgroundColor: '#f8fafc'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>Notifications</h4>
          {unreadCount > 0 && (
            <span
              style={{
                fontSize: '0.75rem',
                backgroundColor: 'var(--primary)',
                color: '#ffffff',
                padding: '2px 7px',
                borderRadius: '999px',
                fontWeight: 600
              }}
            >
              {unreadCount} new
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {unreadCount > 0 && (
            <button
              onClick={markAllNotificationsAsRead}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary)',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Mark all read
            </button>
          )}
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex'
            }}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
        {notifications.length === 0 ? (
          <div style={{ padding: '28px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            No notifications.
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => markNotificationAsRead(notif.id)}
              style={{
                padding: '12px 18px',
                borderBottom: '1px solid #f1f5f9',
                display: 'flex',
                gap: 12,
                cursor: 'pointer',
                backgroundColor: notif.read ? '#ffffff' : '#f8fafc',
                transition: 'background-color 0.15s'
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  backgroundColor: '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: 2
                }}
              >
                {getIcon(notif.type)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h5 style={{ fontSize: '0.8125rem', fontWeight: notif.read ? 600 : 700, color: 'var(--text-main)', marginBottom: 2 }}>
                    {notif.title}
                  </h5>
                  {!notif.read && (
                    <span style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: 'var(--primary)', flexShrink: 0, marginTop: 4 }} />
                  )}
                </div>
                <p style={{ fontSize: '0.78125rem', color: 'var(--text-muted)', lineHeight: 1.4, marginBottom: 4 }}>
                  {notif.message}
                </p>
                <span style={{ fontSize: '0.71875rem', color: 'var(--text-light)' }}>{notif.time}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;
