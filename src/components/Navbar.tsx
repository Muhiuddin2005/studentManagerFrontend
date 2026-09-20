import React, { useState } from 'react';
import { 
  GraduationCap, 
  Sparkles, 
  UserCheck, 
  Plus, 
  Bell, 
  Search, 
  Database,
  LogIn,
  LogOut,
  User as UserIcon,
  ChevronDown
} from 'lucide-react';
import { Role, ServerStatus, User } from '../types';

interface NavbarProps {
  currentRole: Role;
  onToggleRole: (role: Role) => void;
  onOpenNewTaskModal: () => void;
  serverStatus: ServerStatus | null;
  onSearchClick?: () => void;
  currentUser?: User | null;
  onOpenAuthModal?: (mode?: 'login' | 'register') => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  currentRole, 
  onToggleRole, 
  onOpenNewTaskModal, 
  serverStatus,
  onSearchClick,
  currentUser,
  onOpenAuthModal,
  onLogout
}) => {
  const isStudent = currentRole === 'student';
  const [showProfileMenu, setShowProfileMenu] = useState<boolean>(false);

  const initialLetter = currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : (isStudent ? 'M' : 'A');

  return (
    <header style={{
      background: 'rgba(255, 255, 255, 0.85)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(220, 224, 238, 0.7)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0.85rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        {/* Left: Brand Identity with soft periwinkle rounded icon */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '14px',
            background: 'var(--pastel-lilac)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid var(--pastel-lilac-border)'
          }}>
            <GraduationCap size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <h1 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                TutorFlow
              </h1>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                padding: '0.15rem 0.5rem',
                borderRadius: '999px',
                background: isStudent ? 'var(--pastel-lilac)' : 'var(--pastel-mint)',
                color: isStudent ? 'var(--primary)' : 'var(--pastel-mint-text)',
                border: `1px solid ${isStudent ? 'var(--pastel-lilac-border)' : 'var(--pastel-mint-border)'}`
              }}>
                {isStudent ? 'Student' : 'Tutor Hub'}
              </span>
            </div>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }} className="hide-on-mobile">
              Student to-dos & homework timeline
            </p>
          </div>
        </div>

        {/* Center/Right: Role Switcher & User Profile */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          flexWrap: 'wrap'
        }}>
          {/* Role Pill Switcher */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: '#EDEFF6',
            padding: '0.25rem',
            borderRadius: '999px',
            border: '1px solid rgba(220, 224, 238, 0.7)'
          }}>
            <button
              onClick={() => onToggleRole('student')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.38rem 0.85rem',
                borderRadius: '999px',
                border: 'none',
                background: isStudent ? 'var(--primary)' : 'transparent',
                color: isStudent ? '#FFFFFF' : 'var(--text-muted)',
                fontWeight: 700,
                fontSize: '0.785rem',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: isStudent ? '0 2px 8px rgba(111, 101, 241, 0.35)' : 'none'
              }}
            >
              <Sparkles size={13} />
              <span>Mohona</span>
            </button>
            <button
              onClick={() => onToggleRole('tutor')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.38rem 0.85rem',
                borderRadius: '999px',
                border: 'none',
                background: !isStudent ? 'var(--primary)' : 'transparent',
                color: !isStudent ? '#FFFFFF' : 'var(--text-muted)',
                fontWeight: 700,
                fontSize: '0.785rem',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: !isStudent ? '0 2px 8px rgba(111, 101, 241, 0.35)' : 'none'
              }}
            >
              <UserCheck size={13} />
              <span>Tutor Axis</span>
            </button>
          </div>

          {/* User Account / Profile Section */}
          {currentUser ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.3rem 0.65rem 0.3rem 0.35rem',
                  borderRadius: '999px',
                  background: '#FFFFFF',
                  border: '1px solid #E2E6F0',
                  cursor: 'pointer',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  background: isStudent ? 'var(--pastel-lilac)' : 'var(--pastel-mint)',
                  color: isStudent ? 'var(--primary)' : 'var(--pastel-mint-text)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 800
                }}>
                  {initialLetter}
                </div>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }} className="hide-on-mobile">
                  {currentUser.name}
                </span>
                <ChevronDown size={13} color="var(--text-dim)" />
              </button>

              {/* Profile Dropdown Menu */}
              {showProfileMenu && (
                <div style={{
                  position: 'absolute',
                  top: '110%',
                  right: 0,
                  width: '210px',
                  background: '#FFFFFF',
                  borderRadius: '16px',
                  boxShadow: 'var(--shadow-float)',
                  border: '1px solid rgba(220, 224, 238, 0.9)',
                  padding: '0.65rem',
                  zIndex: 200,
                  animation: 'slideUp 0.15s ease'
                }}>
                  <div style={{ padding: '0.4rem 0.5rem 0.6rem', borderBottom: '1px solid #F0F2F7' }}>
                    <div style={{ fontSize: '0.825rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      {currentUser.name}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', wordBreak: 'break-all' }}>
                      {currentUser.email}
                    </div>
                    <div style={{ marginTop: '0.35rem' }}>
                      <span style={{
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        padding: '0.1rem 0.45rem',
                        borderRadius: '999px',
                        background: currentUser.role === 'student' ? 'var(--pastel-lilac)' : 'var(--pastel-mint)',
                        color: currentUser.role === 'student' ? 'var(--primary)' : 'var(--pastel-mint-text)'
                      }}>
                        {currentUser.role === 'student' ? 'Student Account' : 'Home Tutor'}
                      </span>
                    </div>
                  </div>

                  <div style={{ padding: '0.35rem 0 0' }}>
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        onOpenAuthModal?.('login');
                      }}
                      style={{
                        width: '100%',
                        padding: '0.4rem 0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        border: 'none',
                        background: 'transparent',
                        borderRadius: '8px',
                        fontSize: '0.78rem',
                        color: 'var(--text-main)',
                        fontWeight: 600,
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#F8F9FD')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <UserIcon size={14} color="var(--primary)" />
                      <span>Switch Account</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        onLogout?.();
                      }}
                      style={{
                        width: '100%',
                        padding: '0.4rem 0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        border: 'none',
                        background: 'transparent',
                        borderRadius: '8px',
                        fontSize: '0.78rem',
                        color: 'var(--pastel-pink-text)',
                        fontWeight: 600,
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--pastel-pink)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <LogOut size={14} color="var(--pastel-pink-text)" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => onOpenAuthModal?.('login')}
              style={{ padding: '0.38rem 0.85rem' }}
            >
              <LogIn size={14} color="var(--primary)" />
              <span>Sign In</span>
            </button>
          )}

          {/* Database / Supabase indicator (desktop) */}
          <div 
            className="hide-on-mobile"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              padding: '0.35rem 0.7rem',
              borderRadius: '999px',
              background: '#FFFFFF',
              border: '1px solid #E2E6F0',
              color: 'var(--text-muted)'
            }}
            title={serverStatus?.supabaseConnected ? 'Supabase Live Connected' : 'Local Persistence Engine Active'}
          >
            <span style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: serverStatus?.status === 'ok' ? '#10B981' : '#F43F5E',
            }} />
            <Database size={12} />
            <span>{serverStatus?.supabaseConnected ? 'Supabase Live' : 'Backend Ready'}</span>
          </div>

          {/* Circular Utility Action Buttons */}
          {onSearchClick && (
            <button 
              className="btn-secondary btn-circle"
              onClick={onSearchClick}
              title="Search topics"
              style={{ width: '38px', height: '38px' }}
            >
              <Search size={16} color="var(--text-muted)" />
            </button>
          )}

          <div 
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: '#FFFFFF',
              border: '1px solid #E2E6F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              cursor: 'pointer'
            }}
            title="Notifications"
          >
            <Bell size={16} />
          </div>

          {/* New Task Pill Button */}
          <button 
            className="btn btn-primary btn-sm"
            onClick={onOpenNewTaskModal}
            style={{ padding: '0.45rem 1rem' }}
          >
            <Plus size={15} />
            <span className="hide-on-mobile">New Task</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
