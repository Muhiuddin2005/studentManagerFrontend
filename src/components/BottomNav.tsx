import React from 'react';
import { Home, Calendar, PlusCircle, User, Sparkles } from 'lucide-react';
import { Role } from '../types';

interface BottomNavProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  currentRole: Role;
  onToggleRole: (role: Role) => void;
  onOpenNewTask: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  currentRole,
  onToggleRole,
  onOpenNewTask
}) => {
  return (
    <nav className="floating-bottom-nav">
      {/* Home / All Tab */}
      <button
        className={`nav-pill-btn ${currentTab === 'home' ? 'active' : ''}`}
        onClick={() => onSelectTab('home')}
        title="Dashboard"
        aria-label="Dashboard"
      >
        <Home size={19} />
      </button>

      {/* Calendar / Timeline Tab */}
      <button
        className={`nav-pill-btn ${currentTab === 'timeline' ? 'active' : ''}`}
        onClick={() => onSelectTab('timeline')}
        title="Timeline Schedule"
        aria-label="Timeline Schedule"
      >
        <Calendar size={19} />
      </button>

      {/* Quick Add Task (Tutor Only) */}
      {currentRole === 'tutor' && (
        <button
          className="nav-pill-btn"
          onClick={onOpenNewTask}
          title="Create Task"
          aria-label="Create Task"
          style={{
            background: 'rgba(255, 255, 255, 0.12)',
            color: '#FFFFFF'
          }}
        >
          <PlusCircle size={20} />
        </button>
      )}

      {/* Role Switcher Pill in Bottom Nav */}
      <button
        className={`nav-pill-btn ${currentRole === 'tutor' ? 'active' : ''}`}
        onClick={() => onToggleRole(currentRole === 'student' ? 'tutor' : 'student')}
        title={`Current: ${currentRole === 'student' ? 'Mohona (Student)' : 'Tutor Axis'}. Tap to switch`}
        aria-label="Switch Role"
      >
        {currentRole === 'student' ? <Sparkles size={18} /> : <User size={18} />}
      </button>
    </nav>
  );
};

export default BottomNav;
