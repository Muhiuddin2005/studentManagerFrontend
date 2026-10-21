import React, { useState, useEffect } from 'react';
import { 
  X, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  KeyRound,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';

export const AuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    authModalMode, 
    closeAuthModal, 
    loginWithPassword, 
    verifyLoginOtp, 
    register, 
    verifyRegisterOtp, 
    resendOtp
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'verify_login' | 'verify_register'>(authModalMode);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Form states
  const [password, setPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [maskedEmail, setMaskedEmail] = useState<string>('');
  const [targetEmail, setTargetEmail] = useState<string>('');

  // UI state
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState<number>(0);

  useEffect(() => {
    if (isAuthModalOpen) {
      setMode(authModalMode);
      setError(null);
      setSuccessMsg(null);
      setVerificationCode('');
      setPassword('');
      setEmail('');
    }
  }, [isAuthModalOpen, authModalMode]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(prev => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);


  if (!isAuthModalOpen) return null;

  // Step 1: Login with email and password
  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please enter both your email address and password.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await loginWithPassword(email.trim(), password.trim());
      if (res.success && res.step === 'verify_otp') {
        setTargetEmail(res.email);
        setMaskedEmail(res.maskedEmail || res.email);
        setMode('verify_login');
        setSuccessMsg(`Verification code sent to ${res.maskedEmail || res.email}`);
        setResendCooldown(60);
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify your email and password.');
    } finally {
      setLoading(false);
    }
  }

  // Step 2: Verify Login OTP
  async function handleVerifyLoginOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!verificationCode.trim() || verificationCode.trim().length !== 6) {
      setError('Please enter the full 6-digit code received in your email.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await verifyLoginOtp(targetEmail, verificationCode.trim());
    } catch (err: any) {
      setError(err.message || 'Verification code failed. Please check and try again.');
    } finally {
      setLoading(false);
    }
  }

  // Step 1: Registration with email & password (auto role detection)
  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Name, email, and password are all required.');
      return;
    }

    const rawEmail = email.trim();
    const isTutor = rawEmail.toLowerCase().endsWith('-tutor');
    const cleanEmail = isTutor ? rawEmail.replace(/-tutor$/i, '').trim() : rawEmail;
    const assignedRole: Role = isTutor ? 'tutor' : 'student';

    try {
      setLoading(true);
      setError(null);
      const res = await register({
        name: name.trim(),
        email: cleanEmail,
        password: password.trim(),
        role: assignedRole
      });

      if (res.success) {
        setTargetEmail(cleanEmail.toLowerCase());
        setMaskedEmail(cleanEmail.toLowerCase());
        setMode('verify_register');
        setSuccessMsg(`Verification code sent to ${cleanEmail} (${assignedRole === 'tutor' ? 'Home Tutor' : 'Student'} account)`);
        setResendCooldown(60);
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  }

  // Step 2: Verify Registration OTP
  async function handleVerifyRegisterOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!verificationCode.trim() || verificationCode.trim().length !== 6) {
      setError('Please enter the full 6-digit code received in your email.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await verifyRegisterOtp(targetEmail, verificationCode.trim());
    } catch (err: any) {
      setError(err.message || 'Invalid or expired code.');
    } finally {
      setLoading(false);
    }
  }

  // Resend code trigger
  async function handleResendCode() {
    if (resendCooldown > 0 || !targetEmail) return;
    try {
      setLoading(true);
      setError(null);
      const type = mode === 'verify_login' ? 'login' : 'register';
      await resendOtp(targetEmail, type);
      setSuccessMsg(`Fresh verification code sent to ${targetEmail}`);
      setResendCooldown(60);
    } catch (err: any) {
      setError(err.message || 'Failed to resend code');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(31, 35, 50, 0.45)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '1rem',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: '28px',
        width: '100%',
        maxWidth: '480px',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.12)',
        border: '1px solid rgba(220, 224, 238, 0.8)',
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: '#F1F3F8',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            zIndex: 10,
            transition: 'background 0.2s'
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = '#E2E6F0')}
          onMouseOut={(e) => (e.currentTarget.style.background = '#F1F3F8')}
          aria-label="Close"
        >
          <X size={16} />
        </button>

        {/* Modal Top Header with Pastel Accent */}
        <div style={{
          background: 'linear-gradient(135deg, #EEF0FD 0%, #FAFBFD 100%)',
          padding: '2rem 2rem 1.5rem 2rem',
          borderBottom: '1px solid #ECEFF6'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.6rem' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '12px',
              background: 'var(--pastel-lilac)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--pastel-lilac-border)'
            }}>
              <KeyRound size={20} />
            </div>
            <div>
              <h2 style={{
                fontSize: '1.35rem',
                fontWeight: 800,
                color: 'var(--text-main)',
                margin: 0,
                letterSpacing: '-0.02em'
              }}>
                {mode === 'login' && 'Sign In to TutorFlow'}
                {mode === 'register' && 'Create Your Account'}
                {(mode === 'verify_login' || mode === 'verify_register') && 'Email Verification'}
              </h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {mode === 'login' && 'Log in with password & email OTP'}
                {mode === 'register' && 'Register with email & password'}
                {mode === 'verify_login' && 'Enter 6-digit code dispatched to your email'}
                {mode === 'verify_register' && 'Verify email to activate your learning timeline'}
              </span>
            </div>
          </div>

          {/* Tab Selector (only shown on login/register view) */}
          {(mode === 'login' || mode === 'register') && (
            <div style={{
              display: 'flex',
              background: '#FFFFFF',
              borderRadius: '999px',
              padding: '0.25rem',
              border: '1px solid #E2E6F0',
              marginTop: '1rem'
            }}>
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                }}
                style={{
                  flex: 1,
                  padding: '0.55rem',
                  borderRadius: '999px',
                  border: 'none',
                  background: mode === 'login' ? 'var(--primary)' : 'transparent',
                  color: mode === 'login' ? '#FFFFFF' : 'var(--text-muted)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError(null);
                }}
                style={{
                  flex: 1,
                  padding: '0.55rem',
                  borderRadius: '999px',
                  border: 'none',
                  background: mode === 'register' ? 'var(--primary)' : 'transparent',
                  color: mode === 'register' ? '#FFFFFF' : 'var(--text-muted)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Registration
              </button>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.75rem 2rem 2rem 2rem' }}>
          {/* Error Banner */}
          {error && (
            <div style={{
              background: 'var(--pastel-pink)',
              border: '1px solid var(--pastel-pink-border)',
              borderRadius: '12px',
              padding: '0.75rem 1rem',
              color: 'var(--pastel-pink-text)',
              fontSize: '0.85rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1.25rem'
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Success Banner */}
          {successMsg && (
            <div style={{
              background: 'var(--pastel-mint)',
              border: '1px solid var(--pastel-mint-border)',
              borderRadius: '12px',
              padding: '0.75rem 1rem',
              color: 'var(--pastel-mint-text)',
              fontSize: '0.85rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1.25rem'
            }}>
              <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* VIEW 1: Login with Email & Password */}
          {mode === 'login' && (
            <form onSubmit={handlePasswordLogin}>
              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="e.g. mohona@student.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Account Password *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Enter your password..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ paddingRight: '2.5rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-dim)',
                      cursor: 'pointer'
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.4rem' }}>
                  A secure 6-digit verification code will be dispatched to your email.
                </p>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', borderRadius: '999px', padding: '0.75rem', fontSize: '0.9rem' }}
                disabled={loading || !email.trim() || !password.trim()}
              >
                {loading ? 'Sending Code...' : (
                  <>
                    <span>Continue to Verification</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* VIEW 2: Registration with Email & Password */}
          {mode === 'register' && (
            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Mohona or Tutor Axis"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input
                  type="text"
                  inputMode="email"
                  className="form-input"
                  placeholder="e.g. name@example.com (or name@example.com-tutor)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <p style={{ fontSize: '0.74rem', color: 'var(--text-dim)', marginTop: '0.35rem' }}>
                  💡 Student account created by default. For a tutor account, append <strong>-tutor</strong> to your email (e.g. <em>abc@gmail.com-tutor</em>).
                </p>
              </div>

              <div className="form-group">
                <label className="form-label">Account Password *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Create a strong password..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ paddingRight: '2.5rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-dim)',
                      cursor: 'pointer'
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', borderRadius: '999px', padding: '0.75rem', fontSize: '0.9rem' }}
                disabled={loading}
              >
                {loading ? 'Creating Account...' : (
                  <>
                    <span>Create Account & Send Code</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* VIEW 3: OTP Verification Screen (For Login or Register) */}
          {(mode === 'verify_login' || mode === 'verify_register') && (
            <form onSubmit={mode === 'verify_login' ? handleVerifyLoginOtp : handleVerifyRegisterOtp}>
              <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  background: 'var(--pastel-lilac)',
                  color: 'var(--primary)',
                  padding: '0.35rem 0.85rem',
                  borderRadius: '999px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  marginBottom: '0.75rem'
                }}>
                  <Mail size={14} />
                  <span>Sent to {maskedEmail}</span>
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.2rem 0' }}>
                  Enter the 6-digit numeric verification code to authenticate your session:
                </p>
              </div>

              {/* 6-Digit Code Input */}
              <div className="form-group">
                <input
                  type="text"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="0 0 0 0 0 0"
                  autoFocus
                  style={{
                    width: '100%',
                    textAlign: 'center',
                    fontSize: '1.85rem',
                    fontWeight: 800,
                    letterSpacing: '12px',
                    fontFamily: 'monospace',
                    padding: '0.75rem',
                    borderRadius: '16px',
                    border: '2px solid var(--primary)',
                    background: '#FAFBFD',
                    color: 'var(--text-main)',
                    boxShadow: '0 4px 12px rgba(111, 101, 241, 0.08)'
                  }}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', borderRadius: '999px', padding: '0.75rem', fontSize: '0.9rem' }}
                disabled={loading || verificationCode.length !== 6}
              >
                {loading ? 'Authenticating with JWT...' : (
                  <>
                    <ShieldCheck size={18} />
                    <span>Verify & Access Dashboard</span>
                  </>
                )}
              </button>

              {/* Resend Code Section */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: '1.25rem',
                paddingTop: '1rem',
                borderTop: '1px solid #ECEFF6',
                fontSize: '0.8rem'
              }}>
                <button
                  type="button"
                  onClick={() => setMode(mode === 'verify_login' ? 'login' : 'register')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: '0.8rem'
                  }}
                >
                  ← Back
                </button>

                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resendCooldown > 0 || loading}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: resendCooldown > 0 ? 'var(--text-dim)' : 'var(--primary)',
                    fontWeight: 700,
                    cursor: resendCooldown > 0 ? 'default' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontSize: '0.8rem'
                  }}
                >
                  <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
                  <span>
                    {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend Code via Resend'}
                  </span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
