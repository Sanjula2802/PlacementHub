import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  GraduationCap,
  ShieldCheck,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Check,
  X,
  KeyRound,
  Send,
  RefreshCw,
  Shield,
  Key,
  AlertTriangle
} from 'lucide-react';
import { usePlacement } from '../../context/PlacementContext';
import { api } from '../../services/api';
import {
  isValidStudentId,
  isValidMlritEmail,
  doStudentIdAndEmailMatch,
  checkPasswordCriteria
} from '../../utils/authStorage';
import Modal from '../../components/common/Modal';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, showToast } = usePlacement();

  // Role: 'student' (default) | 'admin'
  const [role, setRole] = useState('student');

  // Mode: 'login' | 'signup'
  const [mode, setMode] = useState('login');

  // Loading indicator for API actions
  const [isLoading, setIsLoading] = useState(false);

  // Show/Hide password toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form states
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Student Sign Up state
  const [studentSignup, setStudentSignup] = useState({
    fullName: '',
    studentId: '',
    email: '',
    department: '',
    section: '',
    year: '',
    password: '',
    confirmPassword: ''
  });

  // Admin Access Code Verification state
  const [adminAccessCodeInput, setAdminAccessCodeInput] = useState('');
  const [isAdminAccessCodeVerified, setIsAdminAccessCodeVerified] = useState(false);
  const [adminAccessSessionToken, setAdminAccessSessionToken] = useState('');
  const [isVerifyingAccessCode, setIsVerifyingAccessCode] = useState(false);

  // Admin Sign Up state
  const [adminSignup, setAdminSignup] = useState({
    fullName: '',
    adminId: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Email Verification Modal state (for Students & Admins)
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [verifyEmailAddress, setVerifyEmailAddress] = useState('');
  const [verificationCodeInput, setVerificationCodeInput] = useState('');
  const [devPreviewCode, setDevPreviewCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState('');
  const [verifySuccess, setVerifySuccess] = useState('');
  const [verifyingUserRole, setVerifyingUserRole] = useState('admin');

  // Error & Success message states
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [policyNoticeMessage, setPolicyNoticeMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Forgot password modal state
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  // Real-time validations for student signup
  const passwordCriteria = checkPasswordCriteria(studentSignup.password);
  const trimmedStudentId = studentSignup.studentId.trim();
  const trimmedStudentEmail = studentSignup.email.trim();
  const isStudentIdValidFormat = isValidStudentId(trimmedStudentId);
  const isMlritEmailValidFormat = isValidMlritEmail(trimmedStudentEmail);
  const isIdEmailMatched = doStudentIdAndEmailMatch(trimmedStudentId, trimmedStudentEmail);
  const isConfirmPasswordMatched =
    Boolean(studentSignup.confirmPassword) && studentSignup.password === studentSignup.confirmPassword;

  // Real-time validations for admin signup
  const adminPasswordCriteria = checkPasswordCriteria(adminSignup.password);
  const isAdminConfirmPasswordMatched =
    Boolean(adminSignup.confirmPassword) && adminSignup.password === adminSignup.confirmPassword;

  // Switch role handler
  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setErrorMessage('');
    setSuccessMessage('');
    setPolicyNoticeMessage('');
    setFieldErrors({});
    setLoginIdentifier('');
    setLoginPassword('');
  };

  // Switch mode handler
  const handleModeChange = (newMode) => {
    setMode(newMode);
    setErrorMessage('');
    setSuccessMessage('');
    setPolicyNoticeMessage('');
    setFieldErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  // ================= 1. LOGIN SUBMIT (STUDENT & ADMIN) =================
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setPolicyNoticeMessage('');
    const errors = {};

    if (!loginIdentifier.trim()) {
      errors.identifier =
        role === 'student'
          ? 'Please enter your Student ID or College Email.'
          : 'Please enter your Admin ID or Email.';
    }

    if (!loginPassword) {
      errors.password = 'Please enter your password.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    // Student Login Email format check
    if (role === 'student' && loginIdentifier.includes('@')) {
      if (!isValidMlritEmail(loginIdentifier)) {
        setErrorMessage('Please use your official MLRIT college email.');
        setFieldErrors({ identifier: 'Please use your official MLRIT college email.' });
        return;
      }
    }

    setFieldErrors({});
    setIsLoading(true);

    try {
      const result = await api.login(loginIdentifier, loginPassword, role);

      if (!result.success) {
        setErrorMessage(result.error || 'Login failed.');
        setIsLoading(false);
        return;
      }

      login(result.user, result.token);

      if (result.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setIsLoading(false);

      // Check if admin user needs email verification first (admins only)
      if (err.data?.requiresVerification && role === 'admin') {
        setVerifyEmailAddress(err.data.email || loginIdentifier);
        setVerifyingUserRole('admin');
        setVerifyError('Email verification is required before login. Please enter the verification code sent to your email.');
        setIsVerifyModalOpen(true);
        return;
      }

      // Check if admin account is pending authorization policy configuration
      if (err.data?.code === 'ADMIN_POLICY_NOT_CONFIGURED') {
        setPolicyNoticeMessage(
          'Administrator authorization has not been configured. Your account is pending confirmation of the official college admin email policy.'
        );
        return;
      }

      // Check if admin email is not authorized
      if (err.data?.code === 'ADMIN_EMAIL_NOT_AUTHORIZED') {
        setErrorMessage(
          'Access denied: Your email address is not in the college-authorized administrator allowlist.'
        );
        return;
      }

      setErrorMessage(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // ================= 2. VALIDATE SHARED ADMIN ACCESS CODE =================
  const handleValidateAccessCode = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setPolicyNoticeMessage('');

    if (!adminAccessCodeInput.trim()) {
      setErrorMessage('Please enter the administrator access code.');
      return;
    }

    setIsVerifyingAccessCode(true);

    try {
      const res = await api.validateAdminAccessCode(adminAccessCodeInput.trim());
      if (res.success && res.accessSessionToken) {
        setIsAdminAccessCodeVerified(true);
        setAdminAccessSessionToken(res.accessSessionToken);
        setSuccessMessage('Administrator access code verified! Please complete your admin registration details.');
        showToast('Access code verified successfully!', 'success');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Invalid administrator access code. Please verify with placement cell.');
    } finally {
      setIsVerifyingAccessCode(false);
    }
  };

  // ================= 3. ADMIN SIGN UP SUBMIT =================
  const handleAdminSignupSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setPolicyNoticeMessage('');
    const errors = {};

    if (!adminSignup.fullName.trim()) errors.fullName = 'Full Name is required.';
    if (!adminSignup.adminId.trim()) errors.adminId = 'Admin ID is required.';
    if (!adminSignup.email.trim()) {
      errors.email = 'Admin Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminSignup.email)) {
      errors.email = 'Please enter a valid admin email address.';
    }

    if (!adminSignup.password) {
      errors.password =
        'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.';
    } else if (!adminPasswordCriteria.isComplete) {
      errors.password =
        'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.';
    }

    if (!adminSignup.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    } else if (adminSignup.password !== adminSignup.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      if (errors.password) {
        setErrorMessage(errors.password);
      } else if (errors.confirmPassword) {
        setErrorMessage(errors.confirmPassword);
      } else if (errors.email) {
        setErrorMessage(errors.email);
      } else {
        setErrorMessage('Please fill in all required fields.');
      }
      return;
    }

    setFieldErrors({});
    setIsLoading(true);

    try {
      const result = await api.adminSignup({
        accessSessionToken: adminAccessSessionToken,
        fullName: adminSignup.fullName,
        adminId: adminSignup.adminId,
        email: adminSignup.email,
        password: adminSignup.password
      });

      if (!result.success) {
        setErrorMessage(result.error || 'Admin registration failed.');
        setIsLoading(false);
        return;
      }

      // Open verification modal
      setVerifyEmailAddress(result.email || adminSignup.email);
      setDevPreviewCode(result.verificationCode || '');
      setVerifyingUserRole('admin');
      setVerificationCodeInput('');
      setVerifyError('');
      setVerifySuccess('');
      setIsVerifyModalOpen(true);

      showToast('Admin account created! Please verify your official email.', 'info');
    } catch (err) {
      setErrorMessage(err.message || 'Admin registration failed.');
      // If access session expired, reset code gate
      if (err.message && err.message.includes('access code session')) {
        setIsAdminAccessCodeVerified(false);
        setAdminAccessSessionToken('');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ================= 4. STUDENT SIGN UP SUBMIT =================
  const handleStudentSignupSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setPolicyNoticeMessage('');
    const errors = {};

    if (!studentSignup.fullName.trim()) {
      errors.fullName = 'Full Name is required.';
    }

    if (!studentSignup.studentId.trim() || !isValidStudentId(studentSignup.studentId)) {
      errors.studentId = 'Please enter a valid Student ID (10 characters, starts with 2 digits).';
    }

    if (!studentSignup.email.trim() || !isValidMlritEmail(studentSignup.email)) {
      errors.email = 'Please use your official MLRIT college email ([id]@mlrit.ac.in).';
    }

    if (
      studentSignup.studentId.trim() &&
      studentSignup.email.trim() &&
      !errors.studentId &&
      !errors.email
    ) {
      if (!doStudentIdAndEmailMatch(studentSignup.studentId, studentSignup.email)) {
        errors.email = 'Student ID and college email do not match.';
      }
    }

    if (!studentSignup.department) {
      errors.department = 'Please select a valid branch.';
    }

    if (!studentSignup.section) {
      errors.section = 'Please select your section.';
    }

    if (!studentSignup.year) {
      errors.year = 'Please select your year.';
    }

    if (!studentSignup.password || !passwordCriteria.isComplete) {
      errors.password =
        'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.';
    }

    if (!studentSignup.confirmPassword || studentSignup.password !== studentSignup.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      if (errors.email) {
        setErrorMessage(errors.email);
      } else if (errors.studentId) {
        setErrorMessage(errors.studentId);
      } else if (errors.password) {
        setErrorMessage(errors.password);
      } else {
        setErrorMessage('Please correct the highlighted fields.');
      }
      return;
    }

    setFieldErrors({});
    setIsLoading(true);

    try {
      const result = await api.studentSignup({
        fullName: studentSignup.fullName,
        studentId: studentSignup.studentId,
        email: studentSignup.email,
        department: studentSignup.department,
        section: studentSignup.section,
        year: studentSignup.year,
        password: studentSignup.password
      });

      if (!result.success) {
        setErrorMessage(result.error || 'Registration failed.');
        setIsLoading(false);
        return;
      }

      // Student email verification is not required; proceed to login flow
      setMode('login');
      setLoginIdentifier(studentSignup.email || studentSignup.studentId);
      setLoginPassword('');
      setSuccessMessage('Student account created successfully! Please log in to continue.');
      showToast('Student account created successfully! Please log in.', 'success');

      // Reset student signup fields
      setStudentSignup({
        fullName: '',
        studentId: '',
        email: '',
        department: '',
        section: '',
        year: '',
        password: '',
        confirmPassword: ''
      });
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed. Please check inputs.');
    } finally {
      setIsLoading(false);
    }
  };

  // ================= 5. VERIFY EMAIL CODE SUBMIT =================
  const handleVerifyEmailSubmit = async (e) => {
    e.preventDefault();
    if (!verificationCodeInput.trim()) {
      setVerifyError('Please enter the 6-digit verification code.');
      return;
    }

    setIsVerifying(true);
    setVerifyError('');
    setVerifySuccess('');

    try {
      const res = await api.verifyEmail(verifyEmailAddress, verificationCodeInput.trim());
      if (res.success) {
        setVerifySuccess(res.message || 'Email verified successfully! You may now log in.');
        showToast('Email verified successfully!', 'success');

        setTimeout(() => {
          setIsVerifyModalOpen(false);
          setMode('login');
          setRole('admin');
          setLoginIdentifier(verifyEmailAddress);
          setLoginPassword('');

          if (res.adminStatus === 'PENDING_POLICY') {
            setPolicyNoticeMessage(
              'Email verified! Administrator authorization has not been configured yet. Your account is pending confirmation of the official college admin email policy.'
            );
          } else {
            setSuccessMessage('Email verified successfully! Please log in.');
          }
        }, 1200);
      }
    } catch (err) {
      setVerifyError(err.message || 'Invalid or expired verification code.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Resend verification code
  const handleResendCode = async () => {
    try {
      setVerifyError('');
      const res = await api.resendVerification(verifyEmailAddress);
      if (res.success) {
        if (res.verificationCode) setDevPreviewCode(res.verificationCode);
        showToast('A new verification code has been dispatched.', 'info');
      }
    } catch (err) {
      setVerifyError(err.message || 'Failed to resend code.');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        backgroundColor: '#F8FAFC',
        backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(37, 99, 235, 0.08) 0%, transparent 75%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px',
        boxSizing: 'border-box'
      }}
    >
      {/* Brand Header */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 48,
            height: 48,
            borderRadius: 12,
            backgroundColor: '#2563EB',
            color: '#FFFFFF',
            boxShadow: '0 8px 16px -4px rgba(37, 99, 235, 0.4)',
            marginBottom: 10
          }}
        >
          <GraduationCap size={28} />
        </div>
        <h1
          style={{
            fontSize: '1.75rem',
            fontWeight: 800,
            color: '#0F172A',
            letterSpacing: '-0.025em',
            margin: 0
          }}
        >
          Placement<span style={{ color: '#2563EB' }}>Hub</span>
        </h1>
        <p
          style={{
            fontSize: '0.875rem',
            color: '#64748B',
            marginTop: 4,
            fontWeight: 500
          }}
        >
          Student & Career Management Portal
        </p>
      </div>

      {/* Main Centered Authentication Card */}
      <div
        className="auth-main-card"
        style={{
          width: '100%',
          maxWidth: '520px',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)',
          border: '1px solid #E2E8F0',
          padding: '36px 32px',
          boxSizing: 'border-box'
        }}
      >
        {/* Card Heading */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h2
            style={{
              fontSize: '1.45rem',
              fontWeight: 700,
              color: '#0F172A',
              margin: '0 0 6px 0',
              letterSpacing: '-0.02em'
            }}
          >
            {mode === 'login'
              ? 'Welcome Back'
              : role === 'admin'
              ? 'Admin Registration'
              : 'Create Student Account'}
          </h2>
          <p
            style={{
              fontSize: '0.84rem',
              color: '#64748B',
              margin: 0
            }}
          >
            {mode === 'login'
              ? role === 'admin'
                ? 'Sign in to the Placement Administration Console'
                : 'Login to access your MLRIT Student Portal'
              : role === 'admin'
              ? 'Verify access code and register administrator account'
              : 'Register your official MLRIT student account'}
          </p>
        </div>

        {/* Role Selector Tabs: [ Student ] [ Admin ] */}
        <div
          style={{
            display: 'flex',
            backgroundColor: '#F1F5F9',
            padding: '4px',
            borderRadius: '10px',
            marginBottom: 24,
            border: '1px solid #E2E8F0'
          }}
        >
          <button
            type="button"
            onClick={() => handleRoleChange('student')}
            style={{
              flex: 1,
              padding: '9px 12px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: role === 'student' ? '#2563EB' : 'transparent',
              color: role === 'student' ? '#FFFFFF' : '#64748B',
              fontWeight: 600,
              fontSize: '0.84rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'all 0.2s',
              boxShadow: role === 'student' ? '0 2px 6px rgba(37, 99, 235, 0.25)' : 'none'
            }}
          >
            <User size={15} /> Student
          </button>

          <button
            type="button"
            onClick={() => handleRoleChange('admin')}
            style={{
              flex: 1,
              padding: '9px 12px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: role === 'admin' ? '#0F172A' : 'transparent',
              color: role === 'admin' ? '#FFFFFF' : '#64748B',
              fontWeight: 600,
              fontSize: '0.84rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'all 0.2s',
              boxShadow: role === 'admin' ? '0 2px 6px rgba(15, 23, 42, 0.25)' : 'none'
            }}
          >
            <ShieldCheck size={15} /> Admin
          </button>
        </div>

        {/* Policy Notice Banner (When admin email authorization policy is not configured) */}
        {policyNoticeMessage && (
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
              padding: '12px 14px',
              backgroundColor: '#FFFBEB',
              border: '1px solid #FDE68A',
              borderRadius: '8px',
              color: '#92400E',
              fontSize: '0.8125rem',
              marginBottom: 20,
              lineHeight: 1.45
            }}
          >
            <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: 1, color: '#D97706' }} />
            <div>
              <strong style={{ display: 'block', marginBottom: 2 }}>Authorization Pending Configuration</strong>
              {policyNoticeMessage}
            </div>
          </div>
        )}

        {/* Global Error Banner */}
        {errorMessage && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 14px',
              backgroundColor: '#FEF2F2',
              border: '1px solid #FECACA',
              borderRadius: '8px',
              color: '#991B1B',
              fontSize: '0.8125rem',
              marginBottom: 20
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 14px',
              backgroundColor: '#ECFDF5',
              border: '1px solid #A7F3D0',
              borderRadius: '8px',
              color: '#065F46',
              fontSize: '0.8125rem',
              marginBottom: 20
            }}
          >
            <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* ================= 1. LOGIN FORM ================= */}
        {mode === 'login' ? (
          <form onSubmit={handleLoginSubmit}>
            <div className="form-group" style={{ marginBottom: 18 }}>
              <label
                className="form-label"
                style={{ fontSize: '0.84rem', fontWeight: 600, color: '#0F172A', marginBottom: 6, display: 'block' }}
              >
                {role === 'student' ? 'Student ID / MLRIT Email' : 'Admin ID / Official Email'}
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={16}
                  style={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#64748B',
                    pointerEvents: 'none'
                  }}
                />
                <input
                  type="text"
                  className="form-input"
                  style={{
                    paddingLeft: 38,
                    height: 42,
                    fontSize: '0.875rem',
                    borderColor: fieldErrors.identifier ? '#EF4444' : undefined
                  }}
                  value={loginIdentifier}
                  onChange={(e) => {
                    setLoginIdentifier(e.target.value);
                    if (fieldErrors.identifier) setFieldErrors({ ...fieldErrors, identifier: null });
                  }}
                  placeholder={
                    role === 'student'
                      ? 'Enter 22R11A0501 or 22r11a0501@mlrit.ac.in'
                      : 'Enter Admin ID or official email'
                  }
                />
              </div>
              {fieldErrors.identifier ? (
                <span style={{ fontSize: '0.75rem', color: '#EF4444', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <AlertCircle size={12} /> {fieldErrors.identifier}
                </span>
              ) : role === 'student' && loginIdentifier.includes('@') && !isValidMlritEmail(loginIdentifier) ? (
                <span style={{ fontSize: '0.75rem', color: '#EF4444', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <AlertCircle size={12} /> Please use your official MLRIT college email.
                </span>
              ) : role === 'student' && loginIdentifier.includes('@') && isValidMlritEmail(loginIdentifier) ? (
                <span style={{ fontSize: '0.75rem', color: '#059669', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Check size={12} strokeWidth={2.5} /> Official MLRIT college email
                </span>
              ) : null}
            </div>

            <div className="form-group" style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label className="form-label" style={{ fontSize: '0.84rem', fontWeight: 600, color: '#0F172A', margin: 0 }}>
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotModalOpen(true);
                    setForgotSubmitted(false);
                    setForgotEmail('');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#2563EB',
                    fontSize: '0.78125rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  Forgot Password?
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={16}
                  style={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#64748B',
                    pointerEvents: 'none'
                  }}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  style={{
                    paddingLeft: 38,
                    paddingRight: 40,
                    height: 42,
                    fontSize: '0.875rem',
                    borderColor: fieldErrors.password ? '#EF4444' : undefined
                  }}
                  value={loginPassword}
                  onChange={(e) => {
                    setLoginPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: null });
                  }}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#64748B',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 4
                  }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {fieldErrors.password && (
                <span style={{ fontSize: '0.75rem', color: '#EF4444', marginTop: 4, display: 'block' }}>
                  {fieldErrors.password}
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary"
              style={{
                width: '100%',
                height: 42,
                fontSize: '0.92rem',
                fontWeight: 600,
                marginTop: 8,
                backgroundColor: role === 'admin' ? '#0F172A' : '#2563EB',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.75 : 1
              }}
            >
              {isLoading ? (
                <>
                  <RefreshCw size={16} className="spin-animate" /> Logging in...
                </>
              ) : (
                <>Login as {role === 'admin' ? 'Administrator' : 'Student'}</>
              )}
            </button>

            {/* Role-Specific Card Footer */}
            <div style={{ textAlign: 'center', marginTop: 22, fontSize: '0.84rem', color: '#64748B' }}>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => handleModeChange('signup')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#2563EB',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                Sign Up
              </button>
            </div>
          </form>
        ) : role === 'admin' ? (
          /* ================= 2. ADMIN SIGN UP (PROTECTED BY ACCESS CODE) ================= */
          <div>
            {!isAdminAccessCodeVerified ? (
              /* Step 1: Institutional Access Code Verification */
              <form onSubmit={handleValidateAccessCode}>
                <div
                  style={{
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '10px',
                    padding: '16px',
                    marginBottom: 20,
                    textAlign: 'center'
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      backgroundColor: '#EFF6FF',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 8
                    }}
                  >
                    <Key size={22} color="#2563EB" />
                  </div>
                  <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#0F172A', margin: '0 0 4px 0' }}>
                    Institutional Access Verification
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: '#64748B', margin: 0, lineHeight: 1.45 }}>
                    Enter the shared institutional administrator code to unlock the admin registration form.
                  </p>
                </div>

                <div className="form-group" style={{ marginBottom: 18 }}>
                  <label
                    className="form-label"
                    style={{ fontSize: '0.84rem', fontWeight: 600, color: '#0F172A', marginBottom: 6, display: 'block' }}
                  >
                    Admin Access Code
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock
                      size={16}
                      style={{
                        position: 'absolute',
                        left: 12,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#64748B',
                        pointerEvents: 'none'
                      }}
                    />
                    <input
                      type="password"
                      className="form-input"
                      style={{ paddingLeft: 38, height: 42, fontSize: '0.875rem' }}
                      value={adminAccessCodeInput}
                      onChange={(e) => setAdminAccessCodeInput(e.target.value)}
                      placeholder="Enter administrator access code"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isVerifyingAccessCode}
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    height: 42,
                    fontSize: '0.92rem',
                    fontWeight: 600,
                    backgroundColor: '#0F172A',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8
                  }}
                >
                  {isVerifyingAccessCode ? (
                    <>
                      <RefreshCw size={16} className="spin-animate" /> Verifying Code...
                    </>
                  ) : (
                    <>Verify Access Code & Proceed</>
                  )}
                </button>

                <div style={{ textAlign: 'center', marginTop: 18, fontSize: '0.84rem', color: '#64748B' }}>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => handleModeChange('login')}
                    style={{ background: 'none', border: 'none', color: '#2563EB', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                  >
                    Login
                  </button>
                </div>
              </form>
            ) : (
              /* Step 2: Existing Admin Signup Form (Unlocked after valid code) */
              <form onSubmit={handleAdminSignupSubmit}>
                {/* Verified Code Status Pill */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    backgroundColor: '#ECFDF5',
                    border: '1px solid #A7F3D0',
                    borderRadius: '8px',
                    marginBottom: 16,
                    fontSize: '0.78125rem',
                    color: '#065F46'
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                    <ShieldCheck size={16} color="#059669" /> Access Code Validated
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAdminAccessCodeVerified(false);
                      setAdminAccessSessionToken('');
                    }}
                    style={{ background: 'none', border: 'none', color: '#059669', cursor: 'pointer', fontSize: '0.75rem', textDecoration: 'underline' }}
                  >
                    Change
                  </button>
                </div>

                {/* Full Name & Admin ID */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 14 }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0F172A', marginBottom: 4 }}>
                      Full Name
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      style={{ height: 40, fontSize: '0.84rem', borderColor: fieldErrors.fullName ? '#EF4444' : undefined }}
                      value={adminSignup.fullName}
                      onChange={(e) => {
                        setAdminSignup({ ...adminSignup, fullName: e.target.value });
                        if (fieldErrors.fullName) setFieldErrors({ ...fieldErrors, fullName: null });
                      }}
                      placeholder="Enter full name"
                    />
                    {fieldErrors.fullName && (
                      <span style={{ fontSize: '0.72rem', color: '#EF4444', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <AlertCircle size={12} /> {fieldErrors.fullName}
                      </span>
                    )}
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0F172A', marginBottom: 4 }}>
                      Admin ID
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      style={{ height: 40, fontSize: '0.84rem', borderColor: fieldErrors.adminId ? '#EF4444' : undefined }}
                      value={adminSignup.adminId}
                      onChange={(e) => {
                        setAdminSignup({ ...adminSignup, adminId: e.target.value.toUpperCase() });
                        if (fieldErrors.adminId) setFieldErrors({ ...fieldErrors, adminId: null });
                      }}
                      placeholder="e.g. ADM101"
                    />
                    {fieldErrors.adminId && (
                      <span style={{ fontSize: '0.72rem', color: '#EF4444', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <AlertCircle size={12} /> {fieldErrors.adminId}
                      </span>
                    )}
                  </div>
                </div>

                {/* Admin Email */}
                <div className="form-group" style={{ marginBottom: 14 }}>
                  <label className="form-label" style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0F172A', marginBottom: 4 }}>
                    Official Admin Email
                  </label>
                  <input
                    type="email"
                    className="form-input"
                    style={{ height: 40, fontSize: '0.84rem', borderColor: fieldErrors.email ? '#EF4444' : undefined }}
                    value={adminSignup.email}
                    onChange={(e) => {
                      setAdminSignup({ ...adminSignup, email: e.target.value });
                      if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: null });
                    }}
                    placeholder="e.g. tpo@mlrit.ac.in"
                  />
                  {fieldErrors.email && (
                    <span style={{ fontSize: '0.72rem', color: '#EF4444', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <AlertCircle size={12} /> {fieldErrors.email}
                    </span>
                  )}
                </div>

                {/* Password */}
                <div className="form-group" style={{ marginBottom: 10 }}>
                  <label className="form-label" style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0F172A', marginBottom: 4 }}>
                    Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-input"
                      style={{
                        height: 40,
                        fontSize: '0.84rem',
                        paddingRight: 36,
                        borderColor:
                          fieldErrors.password
                            ? '#EF4444'
                            : adminSignup.password && adminPasswordCriteria.isComplete
                            ? '#10B981'
                            : undefined
                      }}
                      value={adminSignup.password}
                      onChange={(e) => {
                        setAdminSignup({ ...adminSignup, password: e.target.value });
                        if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: null });
                      }}
                      placeholder="Create administrator password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: 10,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#64748B',
                        cursor: 'pointer',
                        padding: 2
                      }}
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* Password Checklist */}
                <div
                  style={{
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    padding: '8px 10px',
                    marginBottom: 12,
                    fontSize: '0.72rem'
                  }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 3 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: adminPasswordCriteria.minLength ? '#059669' : '#64748B' }}>
                      {adminPasswordCriteria.minLength ? <Check size={11} strokeWidth={3} /> : <span style={{ width: 10, height: 10, borderRadius: '50%', border: '1px solid #CBD5E1' }} />}
                      8+ characters
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: adminPasswordCriteria.hasUpper ? '#059669' : '#64748B' }}>
                      {adminPasswordCriteria.hasUpper ? <Check size={11} strokeWidth={3} /> : <span style={{ width: 10, height: 10, borderRadius: '50%', border: '1px solid #CBD5E1' }} />}
                      1 uppercase
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: adminPasswordCriteria.hasLower ? '#059669' : '#64748B' }}>
                      {adminPasswordCriteria.hasLower ? <Check size={11} strokeWidth={3} /> : <span style={{ width: 10, height: 10, borderRadius: '50%', border: '1px solid #CBD5E1' }} />}
                      1 lowercase
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: adminPasswordCriteria.hasNumber ? '#059669' : '#64748B' }}>
                      {adminPasswordCriteria.hasNumber ? <Check size={11} strokeWidth={3} /> : <span style={{ width: 10, height: 10, borderRadius: '50%', border: '1px solid #CBD5E1' }} />}
                      1 number
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: adminPasswordCriteria.hasSpecial ? '#059669' : '#64748B', gridColumn: 'span 2' }}>
                      {adminPasswordCriteria.hasSpecial ? <Check size={11} strokeWidth={3} /> : <span style={{ width: 10, height: 10, borderRadius: '50%', border: '1px solid #CBD5E1' }} />}
                      1 special symbol (!@#$%...)
                    </span>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="form-group" style={{ marginBottom: 18 }}>
                  <label className="form-label" style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0F172A', marginBottom: 4 }}>
                    Confirm Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="form-input"
                      style={{
                        height: 40,
                        fontSize: '0.84rem',
                        paddingRight: 36,
                        borderColor:
                          fieldErrors.confirmPassword
                            ? '#EF4444'
                            : adminSignup.confirmPassword && isAdminConfirmPasswordMatched
                            ? '#10B981'
                            : undefined
                      }}
                      value={adminSignup.confirmPassword}
                      onChange={(e) => {
                        setAdminSignup({ ...adminSignup, confirmPassword: e.target.value });
                        if (fieldErrors.confirmPassword) setFieldErrors({ ...fieldErrors, confirmPassword: null });
                      }}
                      placeholder="Confirm administrator password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={{
                        position: 'absolute',
                        right: 10,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#64748B',
                        cursor: 'pointer',
                        padding: 2
                      }}
                    >
                      {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    height: 42,
                    fontSize: '0.92rem',
                    fontWeight: 600,
                    backgroundColor: '#0F172A',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    cursor: isLoading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw size={16} className="spin-animate" /> Registering Admin Account...
                    </>
                  ) : (
                    <>Create Admin Account</>
                  )}
                </button>

                <div style={{ textAlign: 'center', marginTop: 18, fontSize: '0.84rem', color: '#64748B' }}>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => handleModeChange('login')}
                    style={{ background: 'none', border: 'none', color: '#2563EB', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                  >
                    Login
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          /* ================= 3. STUDENT SIGN UP FORM ================= */
          <div>
            <form onSubmit={handleStudentSignupSubmit}>
              {/* Full Name */}
              <div className="form-group" style={{ marginBottom: 14 }}>
                <label className="form-label" style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0F172A', marginBottom: 4 }}>
                  Full Name
                </label>
                <input
                  type="text"
                  className="form-input"
                  style={{ height: 40, fontSize: '0.84rem', borderColor: fieldErrors.fullName ? '#EF4444' : undefined }}
                  value={studentSignup.fullName}
                  onChange={(e) => setStudentSignup({ ...studentSignup, fullName: e.target.value })}
                  placeholder="Enter full name"
                />
                {fieldErrors.fullName && (
                  <span style={{ fontSize: '0.72rem', color: '#EF4444', marginTop: 2 }}>{fieldErrors.fullName}</span>
                )}
              </div>

              {/* Student ID */}
              <div className="form-group" style={{ marginBottom: 14 }}>
                <label className="form-label" style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0F172A', marginBottom: 4 }}>
                  Student ID (Roll Number)
                </label>
                <input
                  type="text"
                  className="form-input"
                  style={{
                    height: 40,
                    fontSize: '0.84rem',
                    borderColor:
                      fieldErrors.studentId
                        ? '#EF4444'
                        : trimmedStudentId && isStudentIdValidFormat
                        ? '#10B981'
                        : undefined
                  }}
                  value={studentSignup.studentId}
                  onChange={(e) => {
                    const val = e.target.value.toUpperCase();
                    setStudentSignup({
                      ...studentSignup,
                      studentId: val,
                      email: val ? `${val.toLowerCase()}@mlrit.ac.in` : studentSignup.email
                    });
                    if (fieldErrors.studentId) setFieldErrors({ ...fieldErrors, studentId: null });
                  }}
                  placeholder="e.g. 22R11A0501"
                  maxLength={10}
                />
                {fieldErrors.studentId ? (
                  <span style={{ fontSize: '0.72rem', color: '#EF4444', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <AlertCircle size={12} /> {fieldErrors.studentId}
                  </span>
                ) : trimmedStudentId && isStudentIdValidFormat ? (
                  <span style={{ fontSize: '0.72rem', color: '#059669', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Check size={12} strokeWidth={2.5} /> Valid Student ID format
                  </span>
                ) : null}
              </div>

              {/* College Email */}
              <div className="form-group" style={{ marginBottom: 14 }}>
                <label className="form-label" style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0F172A', marginBottom: 4 }}>
                  MLRIT College Email
                </label>
                <input
                  type="email"
                  className="form-input"
                  style={{
                    height: 40,
                    fontSize: '0.84rem',
                    borderColor:
                      fieldErrors.email
                        ? '#EF4444'
                        : trimmedStudentEmail && isMlritEmailValidFormat && isIdEmailMatched
                        ? '#10B981'
                        : undefined
                  }}
                  value={studentSignup.email}
                  onChange={(e) => {
                    setStudentSignup({ ...studentSignup, email: e.target.value });
                    if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: null });
                  }}
                  placeholder="22r11a0501@mlrit.ac.in"
                />
                {fieldErrors.email ? (
                  <span style={{ fontSize: '0.72rem', color: '#EF4444', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <AlertCircle size={12} /> {fieldErrors.email}
                  </span>
                ) : trimmedStudentEmail && isMlritEmailValidFormat && isIdEmailMatched ? (
                  <span style={{ fontSize: '0.72rem', color: '#059669', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Check size={12} strokeWidth={2.5} /> Matches Student ID & MLRIT domain
                  </span>
                ) : trimmedStudentEmail && !isMlritEmailValidFormat ? (
                  <span style={{ fontSize: '0.72rem', color: '#EF4444', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <AlertCircle size={12} /> Must end with @mlrit.ac.in
                  </span>
                ) : null}
              </div>

              {/* Branch / Section / Year */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: 8, marginBottom: 14 }}>
                <div>
                  <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0F172A', marginBottom: 4 }}>
                    Branch
                  </label>
                  <select
                    className="form-input"
                    style={{ height: 40, fontSize: '0.8125rem', padding: '0 8px' }}
                    value={studentSignup.department}
                    onChange={(e) => setStudentSignup({ ...studentSignup, department: e.target.value })}
                  >
                    <option value="">Select</option>
                    <option value="CSE">CSE</option>
                    <option value="CSE-AI/ML">CSE-AI/ML</option>
                    <option value="CSE-DS">CSE-DS</option>
                    <option value="ECE">ECE</option>
                    <option value="EEE">EEE</option>
                    <option value="MECH">MECH</option>
                    <option value="AERO">AERO</option>
                  </select>
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0F172A', marginBottom: 4 }}>
                    Section
                  </label>
                  <select
                    className="form-input"
                    style={{ height: 40, fontSize: '0.8125rem', padding: '0 8px' }}
                    value={studentSignup.section}
                    onChange={(e) => setStudentSignup({ ...studentSignup, section: e.target.value })}
                  >
                    <option value="">Sec</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                    <option value="E">E</option>
                    <option value="F">F</option>
                    <option value="G">G</option>
                  </select>
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0F172A', marginBottom: 4 }}>
                    Year
                  </label>
                  <select
                    className="form-input"
                    style={{ height: 40, fontSize: '0.8125rem', padding: '0 8px' }}
                    value={studentSignup.year}
                    onChange={(e) => setStudentSignup({ ...studentSignup, year: e.target.value })}
                  >
                    <option value="">Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                </div>
              </div>

              {/* Password */}
              <div className="form-group" style={{ marginBottom: 10 }}>
                <label className="form-label" style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0F172A', marginBottom: 4 }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    style={{
                      height: 40,
                      fontSize: '0.84rem',
                      paddingRight: 36,
                      borderColor:
                        fieldErrors.password
                          ? '#EF4444'
                          : studentSignup.password && passwordCriteria.isComplete
                          ? '#10B981'
                          : undefined
                    }}
                    value={studentSignup.password}
                    onChange={(e) => {
                      setStudentSignup({ ...studentSignup, password: e.target.value });
                      if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: null });
                    }}
                    placeholder="Create a strong password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: 10,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#64748B',
                      cursor: 'pointer',
                      padding: 2
                    }}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Password Requirements Checklist */}
              <div
                style={{
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  padding: '8px 10px',
                  marginBottom: 12,
                  fontSize: '0.72rem'
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 3 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: passwordCriteria.minLength ? '#059669' : '#64748B' }}>
                    {passwordCriteria.minLength ? <Check size={11} strokeWidth={3} /> : <span style={{ width: 10, height: 10, borderRadius: '50%', border: '1px solid #CBD5E1' }} />}
                    8+ characters
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: passwordCriteria.hasUpper ? '#059669' : '#64748B' }}>
                    {passwordCriteria.hasUpper ? <Check size={11} strokeWidth={3} /> : <span style={{ width: 10, height: 10, borderRadius: '50%', border: '1px solid #CBD5E1' }} />}
                    1 uppercase
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: passwordCriteria.hasLower ? '#059669' : '#64748B' }}>
                    {passwordCriteria.hasLower ? <Check size={11} strokeWidth={3} /> : <span style={{ width: 10, height: 10, borderRadius: '50%', border: '1px solid #CBD5E1' }} />}
                    1 lowercase
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: passwordCriteria.hasNumber ? '#059669' : '#64748B' }}>
                    {passwordCriteria.hasNumber ? <Check size={11} strokeWidth={3} /> : <span style={{ width: 10, height: 10, borderRadius: '50%', border: '1px solid #CBD5E1' }} />}
                    1 number
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: passwordCriteria.hasSpecial ? '#059669' : '#64748B', gridColumn: 'span 2' }}>
                    {passwordCriteria.hasSpecial ? <Check size={11} strokeWidth={3} /> : <span style={{ width: 10, height: 10, borderRadius: '50%', border: '1px solid #CBD5E1' }} />}
                    1 special symbol (!@#$%...)
                  </span>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="form-group" style={{ marginBottom: 18 }}>
                <label className="form-label" style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0F172A', marginBottom: 4 }}>
                  Confirm Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="form-input"
                    style={{
                      height: 40,
                      fontSize: '0.84rem',
                      paddingRight: 36,
                      borderColor:
                        fieldErrors.confirmPassword
                          ? '#EF4444'
                          : studentSignup.confirmPassword && isConfirmPasswordMatched
                          ? '#10B981'
                          : undefined
                    }}
                    value={studentSignup.confirmPassword}
                    onChange={(e) => {
                      setStudentSignup({ ...studentSignup, confirmPassword: e.target.value });
                      if (fieldErrors.confirmPassword) setFieldErrors({ ...fieldErrors, confirmPassword: null });
                    }}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: 'absolute',
                      right: 10,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#64748B',
                      cursor: 'pointer',
                      padding: 2
                    }}
                  >
                    {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  height: 42,
                  fontSize: '0.92rem',
                  fontWeight: 600,
                  backgroundColor: '#2563EB',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  cursor: isLoading ? 'not-allowed' : 'pointer'
                }}
              >
                {isLoading ? (
                  <>
                    <RefreshCw size={16} className="spin-animate" /> Registering...
                  </>
                ) : (
                  <>Create Student Account</>
                )}
              </button>

              <div style={{ textAlign: 'center', marginTop: 18, fontSize: '0.84rem', color: '#64748B' }}>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => handleModeChange('login')}
                  style={{ background: 'none', border: 'none', color: '#2563EB', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                >
                  Login
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* ================= ADMIN EMAIL VERIFICATION MODAL ================= */}
      <Modal
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
        title="Verify Admin Email"
      >
        <div style={{ padding: '8px 0' }}>
          <div style={{ textAlign: 'center', marginBottom: 18 }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                backgroundColor: '#F1F5F9',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 10
              }}
            >
              <Mail size={26} color="#0F172A" />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', margin: '0 0 6px 0' }}>
              Administrator Email Verification Required
            </h3>
            <p style={{ fontSize: '0.84rem', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
              A 6-digit verification code has been dispatched to{' '}
              <strong style={{ color: '#0F172A' }}>{verifyEmailAddress}</strong>.
            </p>
          </div>

          {devPreviewCode && (
            <div
              style={{
                backgroundColor: '#F0FDF4',
                border: '1px solid #BBF7D0',
                borderRadius: '8px',
                padding: '8px 12px',
                marginBottom: 16,
                fontSize: '0.8rem',
                color: '#166534',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <span>Preview verification code:</span>
              <strong style={{ letterSpacing: '0.15em', fontSize: '0.95rem' }}>{devPreviewCode}</strong>
            </div>
          )}

          {verifyError && (
            <div
              style={{
                backgroundColor: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: '8px',
                padding: '8px 12px',
                marginBottom: 14,
                fontSize: '0.8rem',
                color: '#991B1B'
              }}
            >
              {verifyError}
            </div>
          )}

          {verifySuccess && (
            <div
              style={{
                backgroundColor: '#ECFDF5',
                border: '1px solid #A7F3D0',
                borderRadius: '8px',
                padding: '8px 12px',
                marginBottom: 14,
                fontSize: '0.8rem',
                color: '#065F46'
              }}
            >
              {verifySuccess}
            </div>
          )}

          <form onSubmit={handleVerifyEmailSubmit}>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label" style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0F172A', marginBottom: 6, display: 'block' }}>
                Enter 6-Digit Verification Code
              </label>
              <input
                type="text"
                className="form-input"
                style={{
                  height: 44,
                  fontSize: '1.25rem',
                  letterSpacing: '0.3em',
                  textAlign: 'center',
                  fontWeight: 700
                }}
                maxLength={6}
                value={verificationCodeInput}
                onChange={(e) => setVerificationCodeInput(e.target.value.replace(/\D/g, ''))}
                placeholder="••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isVerifying}
              className="btn btn-primary"
              style={{
                width: '100%',
                height: 42,
                fontSize: '0.92rem',
                fontWeight: 600,
                backgroundColor: '#0F172A',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8
              }}
            >
              {isVerifying ? 'Verifying...' : 'Verify & Continue'}
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, fontSize: '0.8125rem' }}>
              <button
                type="button"
                onClick={handleResendCode}
                style={{ background: 'none', border: 'none', color: '#2563EB', fontWeight: 500, cursor: 'pointer', padding: 0 }}
              >
                Resend Code
              </button>
              <button
                type="button"
                onClick={() => setIsVerifyModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: 0 }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* ================= FORGOT PASSWORD MODAL ================= */}
      <Modal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        title="Reset Password"
      >
        {forgotSubmitted ? (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <CheckCircle2 size={44} color="#10B981" style={{ margin: '0 auto 12px auto' }} />
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>
              Reset Link Dispatched
            </h4>
            <p style={{ fontSize: '0.875rem', color: '#64748B' }}>
              Password recovery instructions have been sent to <strong>{forgotEmail}</strong>. Please check your inbox.
            </p>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ marginTop: 16 }}
              onClick={() => setIsForgotModalOpen(false)}
            >
              Done
            </button>
          </div>
        ) : (
          <div>
            <p style={{ fontSize: '0.875rem', color: '#64748B', marginBottom: 16 }}>
              Enter your registered college or official email address to receive password reset instructions.
            </p>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label" style={{ fontSize: '0.84rem', fontWeight: 600, color: '#0F172A', marginBottom: 6 }}>
                Email Address
              </label>
              <input
                type="email"
                className="form-input"
                style={{ height: 42 }}
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder={role === 'student' ? 'Enter your college email' : 'Enter your admin email'}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsForgotModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  if (forgotEmail.trim()) {
                    setForgotSubmitted(true);
                  }
                }}
              >
                Send Instructions
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default LoginPage;
