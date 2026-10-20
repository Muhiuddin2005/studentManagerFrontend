import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  Camera, 
  RefreshCw 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';

export const LoginPage: React.FC = () => {
  const { 
    loginWithPassword, 
    verifyLoginOtp, 
    register, 
    verifyRegisterOtp, 
    resendOtp 
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Form fields
  const [password, setPassword] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [targetEmail, setTargetEmail] = useState<string>('');
  const [maskedEmail, setMaskedEmail] = useState<string>('');
  const [devCode, setDevCode] = useState<string | null>(null);

  // OTP view state
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verifyType, setVerifyType] = useState<'login' | 'register'>('login');
  const [resendCooldown, setResendCooldown] = useState<number>(0);

  // UI status
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Countdown timer for OTP
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(prev => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Handle password login
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!password.trim()) {
      setError('Please enter your account password.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await loginWithPassword(password.trim(), email.trim() || undefined);
      if (res.success && res.step === 'verify_otp') {
        setTargetEmail(res.email);
        setMaskedEmail(res.maskedEmail || res.email);
        setDevCode(res.devCode || null);
        setVerifyType('login');
        setIsVerifying(true);
        setSuccessMsg(`Verification code sent to ${res.maskedEmail || res.email}`);
        setResendCooldown(60);
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify your password or email.');
    } finally {
      setLoading(false);
    }
  }

  // Handle registration using predefined role detection logic
  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Please enter your name, email, and password.');
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
        setDevCode(res.devCode || null);
        setVerifyType('register');
        setIsVerifying(true);
        setSuccessMsg(`Verification code sent to ${cleanEmail}`);
        setResendCooldown(60);
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  }

  // Handle OTP submission
  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!verificationCode.trim() || verificationCode.trim().length !== 6) {
      setError('Please enter the full 6-digit code received in your email.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      if (verifyType === 'login') {
        await verifyLoginOtp(targetEmail, verificationCode.trim());
      } else {
        await verifyRegisterOtp(targetEmail, verificationCode.trim());
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please check the code.');
    } finally {
      setLoading(false);
    }
  }

  // Resend code
  async function handleResend() {
    if (resendCooldown > 0 || !targetEmail) return;
    try {
      setLoading(true);
      setError(null);
      const res = await resendOtp(targetEmail, verifyType);
      if (res.devCode) {
        setDevCode(res.devCode);
      }
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
      minHeight: 'calc(100vh - 72px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2.5rem 1.25rem 4rem 1.25rem',
      position: 'relative'
    }}>
      {/* Background Ambient Glow Accents */}
      <div style={{
        position: 'absolute',
        width: '450px',
        height: '450px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(111, 101, 241, 0.12) 0%, transparent 70%)',
        top: '5%',
        left: '10%',
        pointerEvents: 'none',
        zIndex: 0
      }} />
      <div style={{
        position: 'absolute',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(244, 63, 94, 0.08) 0%, transparent 70%)',
        bottom: '10%',
        right: '10%',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      <div style={{
        width: '100%',
        maxWidth: '1040px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '2.5rem',
        alignItems: 'center',
        position: 'relative',
        zIndex: 1
      }}>
        
        {/* Left Column: Context Vibe, Hero Pitch & Feature Badges */}
        <div style={{ padding: '0.5rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 0.85rem',
            borderRadius: '999px',
            background: 'var(--pastel-lilac)',
            color: 'var(--pastel-lilac-text)',
            fontSize: '0.8rem',
            fontWeight: 700,
            marginBottom: '1.25rem',
            border: '1px solid var(--pastel-lilac-border)'
          }}>
            <Sparkles size={14} />
            <span>Dedicated Home Tutor & Student Portal</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(2rem, 4vw, 2.75rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            color: 'var(--text-main)',
            letterSpacing: '-0.03em',
            marginBottom: '1rem'
          }}>
            Focus your learning.{' '}
            <span style={{
              background: 'linear-gradient(135deg, #6F65F1 0%, #A855F7 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Achieve mastery.
            </span>
          </h1>

          <p style={{
            color: 'var(--text-muted)',
            fontSize: '1rem',
            lineHeight: 1.6,
            marginBottom: '2rem',
            maxWidth: '460px'
          }}>
            Sign in to access your 7-day study routine, track homework timeline states, and upload problem screenshots for instant tutor review.
          </p>

          {/* Context Feature Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.9rem',
              padding: '0.85rem 1.1rem',
              borderRadius: '18px',
              background: 'rgba(255, 255, 255, 0.75)',
              border: '1px solid rgba(220, 224, 238, 0.8)',
              backdropFilter: 'blur(10px)',
              boxShadow: 'var(--shadow-sm)'
            }}>
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
                <Calendar size={18} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  7-Day Study Timetable
                </h4>
                <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Manage daily subjects and weekly lesson goals
                </p>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.9rem',
              padding: '0.85rem 1.1rem',
              borderRadius: '18px',
              background: 'rgba(255, 255, 255, 0.75)',
              border: '1px solid rgba(220, 224, 238, 0.8)',
              backdropFilter: 'blur(10px)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                background: 'var(--pastel-pink)',
                color: 'var(--pastel-pink-text)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Camera size={18} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Problem Screenshot Proofs
                </h4>
                <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Direct attachment upload for exercises and question proofs
                </p>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.9rem',
              padding: '0.85rem 1.1rem',
              borderRadius: '18px',
              background: 'rgba(255, 255, 255, 0.75)',
              border: '1px solid rgba(220, 224, 238, 0.8)',
              backdropFilter: 'blur(10px)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                background: 'var(--pastel-mint)',
                color: 'var(--pastel-mint-text)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <CheckCircle2 size={18} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  4-Stage Progress Stepper
                </h4>
                <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Start → Ongoing → Update Raised → Done
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Beautiful Login / Register Card */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '28px',
          padding: '2.25rem',
          boxShadow: '0 20px 48px rgba(111, 101, 241, 0.1), 0 4px 12px rgba(0, 0, 0, 0.04)',
          border: '1.5px solid rgba(220, 224, 238, 0.9)',
          position: 'relative'
        }}>

          {/* Verification Code View */}
          {isVerifying ? (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '18px',
                  background: 'var(--pastel-lilac)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem auto'
                }}>
                  <Mail size={26} />
                </div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.4rem 0' }}>
                  Verify Your Email
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                  Enter the 6-digit code sent to <strong>{maskedEmail || targetEmail}</strong>
                </p>
              </div>

              {/* Dev Code Helper */}
              {devCode && (
                <div style={{
                  background: 'var(--pastel-amber)',
                  border: '1px solid var(--pastel-amber-border)',
                  color: 'var(--pastel-amber-text)',
                  padding: '0.75rem 1rem',
                  borderRadius: '14px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  textAlign: 'center',
                  marginBottom: '1.25rem'
                }}>
                  Dev Test Code: <span style={{ letterSpacing: '0.2em', fontSize: '1.05rem' }}>{devCode}</span>
                </div>
              )}

              {error && (
                <div style={{
                  background: 'var(--pastel-pink)',
                  border: '1px solid var(--pastel-pink-border)',
                  color: 'var(--pastel-pink-text)',
                  padding: '0.7rem 1rem',
                  borderRadius: '12px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleVerifyOtp}>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                    6-Digit Verification Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                    style={{
                      width: '100%',
                      padding: '0.85rem 1rem',
                      borderRadius: '14px',
                      border: '1.5px solid var(--primary-border)',
                      fontSize: '1.4rem',
                      fontWeight: 800,
                      letterSpacing: '0.35em',
                      textAlign: 'center',
                      background: 'var(--bg-canvas)',
                      outline: 'none'
                    }}
                    autoFocus
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || verificationCode.length !== 6}
                  style={{
                    width: '100%',
                    padding: '0.85rem',
                    borderRadius: '16px',
                    border: 'none',
                    background: 'var(--primary-gradient)',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    cursor: loading || verificationCode.length !== 6 ? 'not-allowed' : 'pointer',
                    opacity: loading || verificationCode.length !== 6 ? 0.7 : 1,
                    boxShadow: 'var(--shadow-glow)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    transition: 'transform 0.15s ease'
                  }}
                >
                  {loading ? 'Verifying Code...' : 'Complete Sign In'}
                  <ArrowRight size={16} />
                </button>
              </form>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '1.25rem',
                fontSize: '0.82rem'
              }}>
                <button
                  type="button"
                  onClick={() => setIsVerifying(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  ← Back to Sign In
                </button>

                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendCooldown > 0 || loading}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: resendCooldown > 0 ? 'var(--text-dim)' : 'var(--primary)',
                    cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
                  <span>{resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}</span>
                </button>
              </div>
            </div>
          ) : (
            /* Main Login / Register View */
            <div>
              {/* Top Mode Tabs */}
              <div style={{
                display: 'flex',
                background: 'var(--bg-canvas)',
                borderRadius: '999px',
                padding: '0.3rem',
                border: '1px solid #E2E6F0',
                marginBottom: '1.5rem'
              }}>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('login');
                    setError(null);
                    setSuccessMsg(null);
                  }}
                  style={{
                    flex: 1,
                    padding: '0.65rem',
                    borderRadius: '999px',
                    border: 'none',
                    background: activeTab === 'login' ? '#FFFFFF' : 'transparent',
                    color: activeTab === 'login' ? 'var(--primary)' : 'var(--text-muted)',
                    fontWeight: 800,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    boxShadow: activeTab === 'login' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                >
                  Sign In
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('register');
                    setError(null);
                    setSuccessMsg(null);
                  }}
                  style={{
                    flex: 1,
                    padding: '0.65rem',
                    borderRadius: '999px',
                    border: 'none',
                    background: activeTab === 'register' ? '#FFFFFF' : 'transparent',
                    color: activeTab === 'register' ? 'var(--primary)' : 'var(--text-muted)',
                    fontWeight: 800,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    boxShadow: activeTab === 'register' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                >
                  Create Account
                </button>
              </div>

              {/* Alert Feedback Messages */}
              {error && (
                <div style={{
                  background: 'var(--pastel-pink)',
                  border: '1px solid var(--pastel-pink-border)',
                  color: 'var(--pastel-pink-text)',
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  marginBottom: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              {successMsg && (
                <div style={{
                  background: 'var(--pastel-mint)',
                  border: '1px solid var(--pastel-mint-border)',
                  color: 'var(--pastel-mint-text)',
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  marginBottom: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <CheckCircle2 size={16} />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* SIGN IN FORM */}
              {activeTab === 'login' && (
                <form onSubmit={handleLogin}>
                  <div style={{ marginBottom: '1.1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                      Account Password *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.75rem 2.8rem 0.75rem 1rem',
                          borderRadius: '14px',
                          border: '1.5px solid #E2E6F0',
                          fontSize: '0.9rem',
                          outline: 'none',
                          background: 'var(--bg-canvas)',
                          transition: 'border-color 0.2s'
                        }}
                        onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
                        onBlur={(e) => (e.target.style.borderColor = '#E2E6F0')}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: 'absolute',
                          right: '0.85rem',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        Email Address <span style={{ fontWeight: 400, color: 'var(--text-dim)' }}>(Optional if unique)</span>
                      </label>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="email"
                        placeholder="e.g. mohona@student.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.75rem 1rem',
                          borderRadius: '14px',
                          border: '1.5px solid #E2E6F0',
                          fontSize: '0.9rem',
                          outline: 'none',
                          background: 'var(--bg-canvas)',
                          transition: 'border-color 0.2s'
                        }}
                        onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
                        onBlur={(e) => (e.target.style.borderColor = '#E2E6F0')}
                      />
                    </div>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)', marginTop: '0.3rem', display: 'block' }}>
                      A secure 6-digit confirmation code will be dispatched to your email.
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !password.trim()}
                    style={{
                      width: '100%',
                      padding: '0.85rem',
                      borderRadius: '16px',
                      border: 'none',
                      background: 'var(--primary-gradient)',
                      color: '#FFFFFF',
                      fontWeight: 800,
                      fontSize: '0.95rem',
                      cursor: loading || !password.trim() ? 'not-allowed' : 'pointer',
                      opacity: loading || !password.trim() ? 0.7 : 1,
                      boxShadow: 'var(--shadow-glow)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {loading ? 'Sending Code...' : 'Sign In with Password'}
                    <ArrowRight size={16} />
                  </button>
                </form>
              )}

              {/* CREATE ACCOUNT FORM */}
              {activeTab === 'register' && (
                <form onSubmit={handleRegister}>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Mohona"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        borderRadius: '14px',
                        border: '1.5px solid #E2E6F0',
                        fontSize: '0.9rem',
                        outline: 'none',
                        background: 'var(--bg-canvas)'
                      }}
                      required
                    />
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                      Email Address *
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. yourname@domain.com (or append -tutor for tutor account)"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        borderRadius: '14px',
                        border: '1.5px solid #E2E6F0',
                        fontSize: '0.9rem',
                        outline: 'none',
                        background: 'var(--bg-canvas)'
                      }}
                      required
                    />
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)', marginTop: '0.3rem', display: 'block' }}>
                      Auto-detects role: default is Student. Append <strong>-tutor</strong> (e.g. <code>axis-tutor@domain.com</code>) to register as Home Tutor.
                    </span>
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                      Set Password *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a secure password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.75rem 2.8rem 0.75rem 1rem',
                          borderRadius: '14px',
                          border: '1.5px solid #E2E6F0',
                          fontSize: '0.9rem',
                          outline: 'none',
                          background: 'var(--bg-canvas)'
                        }}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: 'absolute',
                          right: '0.85rem',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer'
                        }}
                      >
                        {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '0.85rem',
                      borderRadius: '16px',
                      border: 'none',
                      background: 'var(--primary-gradient)',
                      color: '#FFFFFF',
                      fontWeight: 800,
                      fontSize: '0.95rem',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      opacity: loading ? 0.7 : 1,
                      boxShadow: 'var(--shadow-glow)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    {loading ? 'Creating Account...' : 'Continue to Verification'}
                    <ArrowRight size={16} />
                  </button>
                </form>
              )}

            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default LoginPage;
