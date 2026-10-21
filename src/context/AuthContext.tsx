import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Role, RegisterInput, LoginStepResult, AuthSuccessResult, ToastMessage } from '../types';
import * as api from '../services/api';

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  role: Role;
  isInitializing: boolean;
  loginWithPassword: (email: string, password: string) => Promise<LoginStepResult>;
  verifyLoginOtp: (email: string, code: string) => Promise<AuthSuccessResult>;
  register: (input: RegisterInput) => Promise<api.RegisterResponse>;
  verifyRegisterOtp: (email: string, code: string) => Promise<AuthSuccessResult>;
  resendOtp: (email: string, type?: 'login' | 'register') => Promise<api.ResendCodeResponse>;
  demoLogin: (role: Role) => Promise<void>;
  requestLogout: () => void;
  confirmLogout: () => void;
  cancelLogout: () => void;
  isConfirmingLogout: boolean;
  toast: ToastMessage | null;
  showToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  hideToast: () => void;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register';
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  switchRoleDirectly: (role: Role) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'tutorflow_token';
const USER_KEY = 'tutorflow_user';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Read token from localStorage initially
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  });

  // Read user from localStorage initially (do not force-seed defaultUser)
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(USER_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [isConfirmingLogout, setIsConfirmingLogout] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  // Authenticated ONLY when valid token AND verified user are present
  const isAuthenticated = Boolean(token && user && user.is_verified);
  const role: Role = user?.role || 'student';

  // Verify and hydrate session on reload / initial mount
  useEffect(() => {
    let isMounted = true;

    async function hydrateSession() {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      const storedUser = localStorage.getItem(USER_KEY);

      if (!storedToken) {
        if (isMounted) {
          setToken(null);
          setUser(null);
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          setIsInitializing(false);
        }
        return;
      }

      // Token exists: verify with backend /api/auth/me
      try {
        const res = await api.getMe();
        if (isMounted) {
          if (res.success && res.user) {
            setToken(storedToken);
            setUser(res.user);
            localStorage.setItem(USER_KEY, JSON.stringify(res.user));
          } else {
            throw new Error('Verification failed');
          }
        }
      } catch (err: any) {
        console.warn('Session verification notice on reload:', err?.message || err);
        if (isMounted) {
          // If unauthorized or expired token, clear storage
          if (err?.message && (err.message.includes('401') || err.message.includes('expired') || err.message.includes('invalid'))) {
            setToken(null);
            setUser(null);
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
          } else if (storedUser) {
            // Offline fallback: restore cached user if network glitch
            try {
              setUser(JSON.parse(storedUser));
              setToken(storedToken);
            } catch {
              setToken(null);
              setUser(null);
            }
          }
        }
      } finally {
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    }

    hydrateSession();

    return () => {
      isMounted = false;
    };
  }, []);

  // Toast timer management
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, 3800);
    return () => clearTimeout(timer);
  }, [toast]);

  function showToast(message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') {
    setToast({
      id: String(Date.now()),
      type,
      message
    });
  }

  function hideToast() {
    setToast(null);
  }

  function openAuthModal(mode: 'login' | 'register' = 'login') {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  }

  function closeAuthModal() {
    setIsAuthModalOpen(false);
  }

  // Step 1: Login with Email and Password
  async function loginWithPassword(email: string, password: string): Promise<LoginStepResult> {
    const res = await api.loginWithPassword(email, password);
    return res;
  }

  // Step 2: Verify Login OTP and store JWT
  async function verifyLoginOtp(email: string, code: string): Promise<AuthSuccessResult> {
    const res = await api.verifyLoginOtp(email, code);
    if (res.success && res.token && res.user) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem(TOKEN_KEY, res.token);
      localStorage.setItem(USER_KEY, JSON.stringify(res.user));
      setIsAuthModalOpen(false);
      showToast(`Welcome back, ${res.user.name}! You are logged in as ${res.user.role}.`, 'success');
    }
    return res;
  }

  // Step 1: Register with email and password
  async function register(input: RegisterInput): Promise<api.RegisterResponse> {
    return api.register(input);
  }

  // Step 2: Verify Registration OTP and store JWT
  async function verifyRegisterOtp(email: string, code: string): Promise<AuthSuccessResult> {
    const res = await api.verifyEmail({ email, code });
    if (res.success && res.token && res.user) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem(TOKEN_KEY, res.token);
      localStorage.setItem(USER_KEY, JSON.stringify(res.user));
      setIsAuthModalOpen(false);
      showToast(`Registration complete! Welcome to TutorFlow, ${res.user.name}!`, 'success');
    }
    return res;
  }

  async function resendOtp(email: string, type: 'login' | 'register' = 'login') {
    const res = await api.resendCode(email, type);
    showToast(`Fresh verification code sent to ${email}`, 'info');
    return res;
  }

  // Fast 1-click Demo Login for testing
  async function demoLogin(demoRole: Role) {
    try {
      const res = await api.demoLogin(demoRole);
      if (res.success && res.token && res.user) {
        setToken(res.token);
        setUser(res.user);
        localStorage.setItem(TOKEN_KEY, res.token);
        localStorage.setItem(USER_KEY, JSON.stringify(res.user));
        setIsAuthModalOpen(false);
        showToast(`Logged in as ${res.user.name} (${res.user.role === 'student' ? 'Student' : 'Home Tutor'})!`, 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Demo login failed', 'error');
    }
  }

  function requestLogout() {
    setIsConfirmingLogout(true);
  }

  function cancelLogout() {
    setIsConfirmingLogout(false);
  }

  function confirmLogout() {
    setIsConfirmingLogout(false);
    const userName = user?.name || 'User';
    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    showToast(`Goodbye, ${userName}! You have been logged out.`, 'info');
  }

  async function switchRoleDirectly(newRole: Role) {
    try {
      const res = await api.switchRole(newRole);
      if (res.success && res.token && res.user) {
        setToken(res.token);
        setUser(res.user);
        localStorage.setItem(TOKEN_KEY, res.token);
        localStorage.setItem(USER_KEY, JSON.stringify(res.user));
        showToast(`Switched active view to ${res.user.name} (${res.user.role === 'student' ? 'Student' : 'Home Tutor'})`, 'info');
        return;
      }
    } catch {
      // Fallback in-memory update if network is unavailable
      if (!user) return;
      const updated: User = {
        ...user,
        role: newRole,
        name: newRole === 'student' ? 'Mohona' : 'Tutor Axis',
        email: newRole === 'student' ? 'mohona@student.com' : 'axis@tutor.com'
      };
      setUser(updated);
      localStorage.setItem(USER_KEY, JSON.stringify(updated));
      showToast(`Switched active view to ${newRole === 'student' ? 'Mohona (Student)' : 'Tutor Axis'}`, 'info');
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        role,
        isInitializing,
        loginWithPassword,
        verifyLoginOtp,
        register,
        verifyRegisterOtp,
        resendOtp,
        demoLogin,
        requestLogout,
        confirmLogout,
        cancelLogout,
        isConfirmingLogout,
        toast,
        showToast,
        hideToast,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        switchRoleDirectly
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
