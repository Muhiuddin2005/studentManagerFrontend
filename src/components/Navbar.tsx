import React from 'react';
import { 
  GraduationCap, 
  LogOut,
  Plus,
  Search
} from 'lucide-react';
import { ServerStatus } from '../types';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onOpenNewTaskModal: () => void;
  serverStatus?: ServerStatus | null;
  onSearchClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onOpenNewTaskModal, 
  onSearchClick
}) => {
  const { 
    user, 
    role, 
    isAuthenticated, 
    requestLogout 
  } = useAuth();

  const isStudent = role === 'student';

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
                background: isAuthenticated ? (isStudent ? 'var(--pastel-lilac)' : 'var(--pastel-mint)') : 'var(--pastel-lilac)',
                color: isAuthenticated ? (isStudent ? 'var(--primary)' : 'var(--pastel-mint-text)') : 'var(--primary)',
                border: `1px solid ${isAuthenticated ? (isStudent ? 'var(--pastel-lilac-border)' : 'var(--pastel-mint-border)') : 'var(--pastel-lilac-border)'}`
              }}>
                {isAuthenticated ? (isStudent ? 'Student View' : 'Tutor Hub') : 'Student & Tutor Portal'}
              </span>
            </div>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }} className="hide-on-mobile">
              {isAuthenticated ? 'Student to-dos & homework timeline' : 'Sign in to access your daily timetable & tasks'}
            </p>
          </div>
        </div>

        {/* Center/Right: Log In / Log Out Toggle & User Account Area */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          flexWrap: 'wrap'
        }}>
          {/* Authenticated State: User Avatar & Log Out Toggle */}
          {isAuthenticated && user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {/* Prominent Log Out Toggle Button with confirmation toast trigger */}
              <button
                onClick={requestLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.38rem 0.85rem',
                  borderRadius: '999px',
                  border: '1.5px solid var(--pastel-pink-border)',
                  background: 'var(--pastel-pink)',
                  color: 'var(--pastel-pink-text)',
                  fontWeight: 700,
                  fontSize: '0.785rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: '0 2px 6px rgba(229, 59, 110, 0.08)'
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = '#FCE2EC')}
                onMouseOut={(e) => (e.currentTarget.style.background = 'var(--pastel-pink)')}
                title="Log Out of TutorFlow"
              >
                <LogOut size={13} />
                <span>Log Out</span>
              </button>
            </div>
          ) : (
            /* Unauthenticated State */
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: 'var(--text-muted)',
                background: 'var(--bg-canvas)',
                padding: '0.35rem 0.85rem',
                borderRadius: '999px',
                border: '1px solid #E2E6F0'
              }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
                <span>Authentication Required</span>
              </div>
            </div>
          )}

          {/* Circular Search Utility Action Button */}
          {onSearchClick && (
            <button 
              className="btn-secondary btn-circle hide-on-mobile"
              onClick={onSearchClick}
              title="Search topics"
              style={{ width: '38px', height: '38px' }}
            >
              <Search size={16} color="var(--text-muted)" />
            </button>
          )}

          {/* New Task Pill Button (Tutor Only) */}
          {isAuthenticated && role === 'tutor' && (
            <button 
              className="btn btn-primary btn-sm hide-on-mobile"
              onClick={onOpenNewTaskModal}
              style={{ padding: '0.45rem 1rem' }}
            >
              <Plus size={15} />
              <span>New Task</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
