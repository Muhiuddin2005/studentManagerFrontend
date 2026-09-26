import React, { useState, useEffect } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  User as UserIcon, 
  Sparkles, 
  GraduationCap, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  KeyRound
} from 'lucide-react';
import * as api from '../services/api';
import { User, Role } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialMode = 'login'
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'verify'>(initialMode);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Form states
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [role, setRole] = useState<Role>('student');
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [devCode, setDevCode] = useState<string | null>(null);

  // UI state
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState<number>(0);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError(null);
      setSuccessMsg(null);
      setDevCode(null);
    }
  }, [isOpen, initialMode]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(prev => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  if (!isOpen) return null;

  // Handle Demo Fill
  const handleQuickFill = (demoRole: Role) => {
    if (demoRole === 'student') {
      setEmail('mohona@student.com');
      setPassword('password123');
    } else {
      setEmail('axis@tutor.com');
      setPassword('password123');
    }
    setError(null);
  };

  // Submit Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!email.trim() || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.login({ email: email.trim(), password });
      if (res.success && res.user) {
        setSuccessMsg(`Welcome back, ${res.user.name}!`);
        setTimeout(() => {
          onLoginSuccess(res.user);
          onClose();
        }, 600);
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Submit Register
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!name.trim() || !email.trim() || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.register({
        name: name.trim(),
        email: email.trim(),
        password,
        role
      });

      if (res.success) {
        setSuccessMsg(res.message);
        if (res.devCode) {
          setDevCode(res.devCode);
        }
        setResendCooldown(60);
        setMode('verify');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Submit Verification Code
  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const cleanCode = verificationCode.trim();
    if (!cleanCode) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.verifyEmail({
        email: email.trim(),
        code: cleanCode
      });

      if (res.success && res.user) {
        setSuccessMsg('Email verified successfully! Welcome to TutorFlow.');
        setTimeout(() => {
          onLoginSuccess(res.user);
          onClose();
        }, 700);
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please check the code.');
    } finally {
      setLoading(false);
    }
  };

  // Resend Verification Code
  const handleResendCode = async () => {
    if (resendCooldown > 0 || !email.trim()) return;
    setError(null);
    try {
      setLoading(true);
      const res = await api.resendCode(email.trim());
      if (res.success) {
        setSuccessMsg('A new verification code has been dispatched.');
        if (res.devCode) {
          setDevCode(res.devCode);
        }
        setResendCooldown(60);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '480px', padding: '1.75rem' }}
      >
        {/* Modal Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.25rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '12px',
              background: 'var(--pastel-lilac)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {mode === 'verify' ? <KeyRound size={20} /> : <GraduationCap size={20} />}
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                {mode === 'login' ? 'Welcome Back' : mode === 'register' ? 'Create Account' : 'Verify Email'}
              </h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                {mode === 'login' 
                  ? 'Access your lessons, tasks & homework' 
                  : mode === 'register' 
                  ? 'Join as Mohona student or home tutor' 
                  : `Enter 6-digit code sent to ${email}`}
              </p>
            </div>
          </div>

          <button 
            className="btn-circle btn-secondary"
            onClick={onClose}
            style={{ width: '32px', height: '32px', cursor: 'pointer' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab Switcher (Login vs Sign Up) - Only visible when not in verify step */}
        {mode !== 'verify' && (
          <div style={{
            display: 'flex',
            background: '#EDEFF6',
            borderRadius: '999px',
            padding: '0.25rem',
            marginBottom: '1.25rem'
          }}>
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); }}
              style={{
                flex: 1,
                padding: '0.45rem',
                borderRadius: '999px',
                border: 'none',
                background: mode === 'login' ? '#FFFFFF' : 'transparent',
                color: mode === 'login' ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: 700,
                fontSize: '0.825rem',
                cursor: 'pointer',
                boxShadow: mode === 'login' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(null); }}
              style={{
                flex: 1,
                padding: '0.45rem',
                borderRadius: '999px',
                border: 'none',
                background: mode === 'register' ? '#FFFFFF' : 'transparent',
                color: mode === 'register' ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: 700,
                fontSize: '0.825rem',
                cursor: 'pointer',
                boxShadow: mode === 'register' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Alert Messages */}
        {error && (
          <div style={{
            background: 'var(--pastel-pink)',
            border: '1px solid var(--pastel-pink-border)',
            borderRadius: '12px',
            padding: '0.65rem 0.9rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'var(--pastel-pink-text)',
            fontSize: '0.8rem',
            fontWeight: 600
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div style={{
            background: 'var(--pastel-mint)',
            border: '1px solid var(--pastel-mint-border)',
            borderRadius: '12px',
            padding: '0.65rem 0.9rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'var(--pastel-mint-text)',
            fontSize: '0.8rem',
            fontWeight: 600
          }}>
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ----------------- 1. LOGIN MODE ----------------- */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit}>
            {/* Quick Demo Logins */}
            <div style={{
              background: '#F8F9FD',
              borderRadius: '14px',
              padding: '0.75rem',
              marginBottom: '1.1rem',
              border: '1px solid #ECEFF6'
            }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.45rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Sparkles size={12} color="var(--primary)" />
                <span>Instant Quick-Fill Demo Accounts:</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => handleQuickFill('student')}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid var(--pastel-lilac-border)',
                    color: 'var(--primary)',
                    borderRadius: '999px',
                    padding: '0.3rem 0.65rem',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}
                >
                  <Sparkles size={11} />
                  Mohona (Student)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('tutor')}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid var(--pastel-mint-border)',
                    color: 'var(--pastel-mint-text)',
                    borderRadius: '999px',
                    padding: '0.3rem 0.65rem',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}
                >
                  <GraduationCap size={12} />
                  Tutor Axis (Tutor)
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.78rem' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '14px', top: '12px' }} />
                <input
                  type="email"
                  className="form-input"
                  placeholder="e.g. mohona@student.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.78rem' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '14px', top: '12px' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '10px',
                    background: 'transparent',
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
              disabled={loading}
              style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem' }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <RefreshCw size={15} className="animate-spin" />
                  Authenticating...
                </span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span>Sign In</span>
                  <ArrowRight size={15} />
                </span>
              )}
            </button>
          </form>
        )}

        {/* ----------------- 2. REGISTER MODE ----------------- */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit}>
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.78rem' }}>Full Name *</label>
              <div style={{ position: 'relative' }}>
                <UserIcon size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '14px', top: '12px' }} />
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Mohona or Axis"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.78rem' }}>Email Address *</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '14px', top: '12px' }} />
                <input
                  type="email"
                  className="form-input"
                  placeholder="name@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.78rem' }}>Password *</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '14px', top: '12px' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Create a password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '10px',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-dim)',
                    cursor: 'pointer'
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Select Role */}
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.78rem' }}>Select Role *</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div
                  onClick={() => setRole('student')}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '16px',
                    border: `1.5px solid ${role === 'student' ? 'var(--primary)' : 'rgba(220, 224, 238, 0.8)'}`,
                    background: role === 'student' ? 'var(--pastel-lilac)' : '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'center'
                  }}
                >
                  <Sparkles size={20} color={role === 'student' ? 'var(--primary)' : 'var(--text-muted)'} style={{ marginBottom: '0.25rem' }} />
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: role === 'student' ? 'var(--primary)' : 'var(--text-main)' }}>
                    Student
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    Track tasks & homework
                  </div>
                </div>

                <div
                  onClick={() => setRole('tutor')}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '16px',
                    border: `1.5px solid ${role === 'tutor' ? 'var(--pastel-mint-text)' : 'rgba(220, 224, 238, 0.8)'}`,
                    background: role === 'tutor' ? 'var(--pastel-mint)' : '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'center'
                  }}
                >
                  <GraduationCap size={20} color={role === 'tutor' ? 'var(--pastel-mint-text)' : 'var(--text-muted)'} style={{ marginBottom: '0.25rem' }} />
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: role === 'tutor' ? 'var(--pastel-mint-text)' : 'var(--text-main)' }}>
                    Tutor Hub
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    Review & guide questions
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem' }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <RefreshCw size={15} className="animate-spin" />
                  Sending Verification Code...
                </span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span>Register & Send Code</span>
                  <ArrowRight size={15} />
                </span>
              )}
            </button>
          </form>
        )}

        {/* ----------------- 3. VERIFY EMAIL OTP MODE ----------------- */}
        {mode === 'verify' && (
          <form onSubmit={handleVerifySubmit}>
            <div style={{
              background: '#F8F9FD',
              borderRadius: '16px',
              padding: '1rem',
              marginBottom: '1.25rem',
              textAlign: 'center',
              border: '1px solid #ECEFF6'
            }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: 'var(--pastel-lilac)',
                color: 'var(--primary)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '0.5rem'
              }}>
                <Mail size={22} />
              </div>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-main)', margin: '0 0 0.35rem', fontWeight: 600 }}>
                Verification code dispatched via Nodemailer
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                Please check your inbox at <strong>{email}</strong>
              </p>

              {/* Dev helper code preview banner */}
              {devCode && (
                <div style={{
                  marginTop: '0.85rem',
                  padding: '0.5rem 0.75rem',
                  background: 'var(--pastel-amber)',
                  border: '1px solid var(--pastel-amber-border)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.5rem'
                }}>
                  <div style={{ fontSize: '0.74rem', color: 'var(--pastel-amber-text)', textAlign: 'left' }}>
                    <span style={{ fontWeight: 700 }}>Dev Code: </span>
                    <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '0.9rem', letterSpacing: '2px' }}>{devCode}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setVerificationCode(devCode)}
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid var(--pastel-amber-border)',
                      color: 'var(--pastel-amber-text)',
                      borderRadius: '999px',
                      padding: '0.2rem 0.55rem',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Auto-Fill
                  </button>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.78rem', textAlign: 'center', display: 'block' }}>
                Enter 6-Digit Verification Code
              </label>
              <input
                type="text"
                maxLength={6}
                className="form-input"
                placeholder="• • • • • •"
                value={verificationCode}
                onChange={e => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                style={{
                  textAlign: 'center',
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  letterSpacing: '8px',
                  fontFamily: 'monospace',
                  padding: '0.65rem'
                }}
                autoFocus
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem' }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <RefreshCw size={15} className="animate-spin" />
                  Verifying...
                </span>
              ) : (
                <span>Activate Account</span>
              )}
            </button>

            {/* Resend and Back Buttons */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '1.25rem',
              fontSize: '0.78rem'
            }}>
              <button
                type="button"
                onClick={() => setMode('register')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                ← Back to edit
              </button>

              <button
                type="button"
                onClick={handleResendCode}
                disabled={resendCooldown > 0 || loading}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: resendCooldown > 0 ? 'var(--text-dim)' : 'var(--primary)',
                  cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
                  fontWeight: 700
                }}
              >
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
