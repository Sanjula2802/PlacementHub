import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, LogOut, Lock, RefreshCw, AlertTriangle, ShieldCheck } from 'lucide-react';
import { usePlacement } from '../../context/PlacementContext';
import { api } from '../../services/api';

export const AccessDeniedPage = ({ reason = 'ROLE_NOT_ADMIN' }) => {
  const navigate = useNavigate();
  const { currentUser, logout, login, showToast } = usePlacement();
  const [isChecking, setIsChecking] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleCheckPolicyStatus = async () => {
    setIsChecking(true);
    try {
      const res = await api.getMe();
      if (res?.success && res?.user) {
        if (res.user.adminStatus === 'ACTIVE') {
          login(res.user);
          showToast('Administrator authorization confirmed! Access granted.', 'success');
          navigate('/admin/dashboard');
          return;
        } else if (res.user.adminStatus === 'PENDING_POLICY') {
          showToast('Administrator authorization has not been configured yet.', 'info');
        } else if (res.user.adminStatus === 'DENIED_POLICY') {
          showToast('Your email is not in the college administrator allowlist.', 'error');
        }
      }
    } catch (err) {
      showToast(err.message || 'Could not verify status.', 'error');
    } finally {
      setIsChecking(false);
    }
  };

  const isPendingPolicy =
    reason === 'POLICY_NOT_CONFIGURED' || currentUser?.adminStatus === 'PENDING_POLICY';
  const isDeniedPolicy =
    reason === 'EMAIL_NOT_AUTHORIZED' || currentUser?.adminStatus === 'DENIED_POLICY';

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        backgroundColor: '#0F172A',
        backgroundImage: isPendingPolicy
          ? 'radial-gradient(circle at 50% 20%, rgba(245, 158, 11, 0.14) 0%, transparent 60%)'
          : 'radial-gradient(circle at 50% 20%, rgba(239, 68, 68, 0.12) 0%, transparent 60%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        boxSizing: 'border-box',
        color: '#F8FAFC'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          backgroundColor: '#1E293B',
          borderRadius: '16px',
          border: isPendingPolicy
            ? '1px solid rgba(245, 158, 11, 0.35)'
            : '1px solid rgba(239, 68, 68, 0.3)',
          boxShadow: isPendingPolicy
            ? '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 30px rgba(245, 158, 11, 0.12)'
            : '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 30px rgba(239, 68, 68, 0.15)',
          padding: '40px 32px',
          textAlign: 'center',
          boxSizing: 'border-box'
        }}
      >
        {/* Shield Icon Badge */}
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            backgroundColor: isPendingPolicy ? 'rgba(245, 158, 11, 0.12)' : 'rgba(239, 68, 68, 0.12)',
            border: isPendingPolicy
              ? '2px solid rgba(245, 158, 11, 0.4)'
              : '2px solid rgba(239, 68, 68, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px auto'
          }}
        >
          {isPendingPolicy ? (
            <AlertTriangle size={38} color="#F59E0B" />
          ) : (
            <ShieldAlert size={38} color="#EF4444" />
          )}
        </div>

        {/* Status Code Badge */}
        <div style={{ marginBottom: 12 }}>
          <span
            style={{
              display: 'inline-block',
              padding: '4px 12px',
              borderRadius: '9999px',
              backgroundColor: isPendingPolicy ? 'rgba(245, 158, 11, 0.18)' : 'rgba(239, 68, 68, 0.2)',
              color: isPendingPolicy ? '#FBBF24' : '#F87171',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              border: isPendingPolicy
                ? '1px solid rgba(245, 158, 11, 0.35)'
                : '1px solid rgba(239, 68, 68, 0.3)'
            }}
          >
            {isPendingPolicy ? 'Authorization Pending Policy Configuration' : 'HTTP 403 Forbidden'}
          </span>
        </div>

        {/* Heading */}
        <h1
          style={{
            fontSize: '1.6rem',
            fontWeight: 800,
            color: '#FFFFFF',
            margin: '0 0 10px 0',
            letterSpacing: '-0.02em'
          }}
        >
          {isPendingPolicy
            ? 'Administrator Authorization Pending'
            : isDeniedPolicy
            ? 'Administrator Access Denied'
            : 'Access Denied'}
        </h1>

        <p
          style={{
            fontSize: '0.92rem',
            color: '#94A3B8',
            lineHeight: 1.6,
            margin: '0 0 24px 0'
          }}
        >
          {isPendingPolicy ? (
            <>
              Your administrator account and email have been verified, but{' '}
              <strong style={{ color: '#FCD34D' }}>
                administrator authorization has not been configured
              </strong>{' '}
              on the backend yet. The college's official administrator email policy is currently pending confirmation.
            </>
          ) : isDeniedPolicy ? (
            <>
              Your email address is not in the college-authorized administrator allowlist.
              Only approved placement cell personnel may access the administrative console.
            </>
          ) : (
            <>
              You do not have permission to access the PlacementHub Administration Console.
              This portal is restricted to verified administrators via <strong>server-side role verification</strong>.
            </>
          )}
        </p>

        {/* Security Details Card */}
        <div
          style={{
            backgroundColor: '#0F172A',
            borderRadius: '10px',
            border: '1px solid #334155',
            padding: '16px',
            textAlign: 'left',
            marginBottom: 28,
            fontSize: '0.8125rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#CBD5E1', marginBottom: 8, fontWeight: 600 }}>
            <Lock size={15} color={isPendingPolicy ? '#F59E0B' : '#EF4444'} /> Policy Enforcement Notice
          </div>
          <div style={{ color: '#94A3B8', display: 'flex', flexDirection: 'column', gap: 6, lineHeight: 1.4 }}>
            <div>
              • Account Identifier:{' '}
              <span style={{ color: '#F1F5F9', fontWeight: 600 }}>
                {currentUser?.email || currentUser?.adminId || 'Current User'}
              </span>
            </div>
            <div>
              • Account Role:{' '}
              <span style={{ color: '#38BDF8', fontWeight: 700, textTransform: 'uppercase' }}>
                {currentUser?.role || 'student'}
              </span>
            </div>
            {isPendingPolicy && (
              <div>
                • Status:{' '}
                <span style={{ color: '#FBBF24', fontWeight: 700 }}>
                  PENDING_POLICY (Awaiting College Email Policy Configuration)
                </span>
              </div>
            )}
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: 4, fontStyle: 'italic' }}>
              {isPendingPolicy
                ? 'Once the institution configures the administrator email allowlist, eligible verified accounts will be authorized automatically without requiring individual manual approvals.'
                : 'Access to administrator dashboards and APIs is protected by cryptographically signed backend verification.'}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          {isPendingPolicy ? (
            <>
              <button
                type="button"
                onClick={handleCheckPolicyStatus}
                disabled={isChecking}
                style={{
                  flex: '1 1 200px',
                  padding: '12px 20px',
                  borderRadius: '8px',
                  backgroundColor: '#D97706',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  border: 'none',
                  cursor: isChecking ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  transition: 'background 0.2s',
                  boxShadow: '0 4px 12px rgba(217, 119, 6, 0.3)'
                }}
              >
                <RefreshCw size={16} className={isChecking ? 'spin-animate' : ''} />
                {isChecking ? 'Checking Policy...' : 'Re-check Authorization'}
              </button>

              <button
                type="button"
                onClick={handleLogout}
                style={{
                  flex: '1 1 140px',
                  padding: '12px 20px',
                  borderRadius: '8px',
                  backgroundColor: 'transparent',
                  color: '#CBD5E1',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  border: '1px solid #475569',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8
                }}
              >
                <LogOut size={16} /> Sign Out
              </button>
            </>
          ) : currentUser?.role === 'student' ? (
            <>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                style={{
                  flex: '1 1 200px',
                  padding: '12px 20px',
                  borderRadius: '8px',
                  backgroundColor: '#2563EB',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
                }}
              >
                <ArrowLeft size={16} /> Return to Student Portal
              </button>

              <button
                type="button"
                onClick={handleLogout}
                style={{
                  flex: '1 1 140px',
                  padding: '12px 20px',
                  borderRadius: '8px',
                  backgroundColor: 'transparent',
                  color: '#CBD5E1',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  border: '1px solid #475569',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8
                }}
              >
                <LogOut size={16} /> Switch Account
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleLogout}
              style={{
                flex: '1 1 180px',
                padding: '12px 20px',
                borderRadius: '8px',
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                fontWeight: 600,
                fontSize: '0.875rem',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8
              }}
            >
              <LogOut size={16} /> Return to Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccessDeniedPage;
