import React from 'react';
import Modal from './Modal';
import { LogOut, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LogoutConfirmModal: React.FC = () => {
  const { isConfirmingLogout, cancelLogout, confirmLogout, user } = useAuth();

  return (
    <Modal
      isOpen={isConfirmingLogout}
      onClose={cancelLogout}
      title="Sign Out Confirmation"
      maxWidth="440px"
    >
      <div style={{ textAlign: 'center', padding: '0.75rem 0.5rem' }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'var(--pastel-pink)',
          color: 'var(--pastel-pink-text)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.25rem auto',
          border: '1.5px solid var(--pastel-pink-border)'
        }}>
          <ShieldAlert size={28} />
        </div>

        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.5rem 0' }}>
          Are you sure you want to log out?
        </h3>

        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: '0 0 1.5rem 0' }}>
          You are currently signed in as <strong>{user?.name || 'User'}</strong> ({user?.role || 'student'}). 
          Logging out will clear your active JWT authentication token.
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={cancelLogout}
            style={{ flex: 1, borderRadius: '999px', padding: '0.7rem 1.2rem' }}
          >
            Stay Signed In
          </button>
          <button
            type="button"
            onClick={confirmLogout}
            style={{
              flex: 1,
              borderRadius: '999px',
              padding: '0.7rem 1.2rem',
              background: 'var(--pastel-pink)',
              color: 'var(--pastel-pink-text)',
              border: '1.5px solid var(--pastel-pink-border)',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              transition: 'background 0.2s'
            }}
          >
            <LogOut size={16} />
            <span>Yes, Log Out</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default LogoutConfirmModal;
