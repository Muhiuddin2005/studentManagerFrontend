import React from 'react';
import { 
  GraduationCap, 
  LogOut,
  Plus,
  Search,
  Bell,
  Users,
  ChevronDown
} from 'lucide-react';
import { ServerStatus, TutorStudentPair } from '../types';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onOpenNewTaskModal: () => void;
  serverStatus?: ServerStatus | null;
  onSearchClick?: () => void;
  pendingRequestsCount?: number;
  onOpenRequestsModal?: () => void;
  onOpenTeacherDirectory?: () => void;
  activeTuple?: TutorStudentPair | null;
  acceptedTuples?: TutorStudentPair[];
  onSelectTuple?: (pair: TutorStudentPair) => void;
  currentView?: 'dashboard' | 'teachers' | 'routine';
  onSwitchView?: (view: 'dashboard' | 'teachers' | 'routine') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onOpenNewTaskModal, 
  onSearchClick,
  pendingRequestsCount = 0,
  onOpenRequestsModal,
  onOpenTeacherDirectory,
  activeTuple,
  acceptedTuples = [],
  onSelectTuple,
  currentView = 'dashboard',
  onSwitchView
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
          <div 
            onClick={() => onSwitchView && onSwitchView('dashboard')}
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '14px',
              background: 'var(--pastel-lilac)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--pastel-lilac-border)',
              cursor: 'pointer'
            }}
          >
            <GraduationCap size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <h1 
                onClick={() => onSwitchView && onSwitchView('dashboard')}
                style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--text-main)', letterSpacing: '-0.02em', cursor: 'pointer' }}
              >
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

              {/* Active Pair Badge */}
              {isAuthenticated && activeTuple && (
                <span 
                  className="hide-on-mobile"
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '0.15rem 0.55rem',
                    borderRadius: '999px',
                    background: '#ECFDF5',
                    color: '#059669',
                    border: '1px solid #A7F3D0'
                  }}
                  title={`Bound Tuple: ${activeTuple.student_name} ↔ ${activeTuple.tutor_name}`}
                >
                  🔗 {isStudent ? `Tutor: ${activeTuple.tutor_name}` : `Student: ${activeTuple.student_name}`}
                </span>
              )}
            </div>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }} className="hide-on-mobile">
              {isAuthenticated ? 'Bound student & tutor 1-on-1 timeline hub' : 'Sign in to access your daily timetable & tasks'}
            </p>
          </div>
        </div>

        {/* Center/Right: Actions, Tuple Switcher, Requests & Log Out */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          flexWrap: 'wrap'
        }}>
          {isAuthenticated && (
            <>
              {/* Student View: Teachers Directory Toggle */}
              {isStudent && onOpenTeacherDirectory && (
                <button
                  onClick={onOpenTeacherDirectory}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.38rem 0.85rem',
                    borderRadius: '999px',
                    border: currentView === 'teachers' ? '1.5px solid var(--primary)' : '1px solid rgba(220, 224, 238, 0.85)',
                    background: currentView === 'teachers' ? 'var(--pastel-lilac)' : '#FFFFFF',
                    color: currentView === 'teachers' ? 'var(--primary)' : 'var(--text-main)',
                    fontWeight: 700,
                    fontSize: '0.785rem',
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <Users size={14} />
                  <span>Teacher Directory</span>
                </button>
              )}

              {/* Tutor View: Student Requests Button with Notification Badge */}
              {!isStudent && onOpenRequestsModal && (
                <button
                  onClick={onOpenRequestsModal}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.38rem 0.85rem',
                    borderRadius: '999px',
                    border: pendingRequestsCount > 0 ? '1.5px solid #F59E0B' : '1px solid rgba(220, 224, 238, 0.85)',
                    background: pendingRequestsCount > 0 ? '#FEF3C7' : '#FFFFFF',
                    color: pendingRequestsCount > 0 ? '#92400E' : 'var(--text-main)',
                    fontWeight: 700,
                    fontSize: '0.785rem',
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-sm)',
                    position: 'relative'
                  }}
                >
                  <Bell size={14} />
                  <span>Student Requests</span>
                  {pendingRequestsCount > 0 && (
                    <span style={{
                      background: '#EF4444',
                      color: '#FFFFFF',
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      padding: '0.1rem 0.45rem',
                      borderRadius: '999px'
                    }}>
                      {pendingRequestsCount}
                    </span>
                  )}
                </button>
              )}

              {/* Tutor View: Multiple Students Selector */}
              {!isStudent && acceptedTuples.length > 1 && onSelectTuple && (
                <div style={{ position: 'relative' }}>
                  <select
                    value={activeTuple?.id || ''}
                    onChange={(e) => {
                      const selected = acceptedTuples.find(t => t.id === e.target.value);
                      if (selected) onSelectTuple(selected);
                    }}
                    style={{
                      padding: '0.38rem 1.6rem 0.38rem 0.8rem',
                      borderRadius: '999px',
                      border: '1.5px solid rgba(220, 224, 238, 0.85)',
                      background: '#FFFFFF',
                      fontSize: '0.785rem',
                      fontWeight: 700,
                      color: 'var(--text-main)',
                      outline: 'none',
                      cursor: 'pointer',
                      appearance: 'none',
                      WebkitAppearance: 'none'
                    }}
                  >
                    {acceptedTuples.map(tuple => (
                      <option key={tuple.id} value={tuple.id}>
                        Student: {tuple.student_name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={12} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }} />
                </div>
              )}
            </>
          )}

          {/* Authenticated State: User Avatar & Log Out Toggle */}
          {isAuthenticated && user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
