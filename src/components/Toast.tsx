import React from 'react';
import { ToastMessage } from '../types';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  if (!toast) return null;

  const getStyle = () => {
    switch (toast.type) {
      case 'success':
        return {
          bg: '#E5F6EE',
          border: '#C1ECD5',
          text: '#198754',
          icon: <CheckCircle2 size={18} color="#198754" />
        };
      case 'error':
        return {
          bg: 'var(--pastel-pink)',
          border: 'var(--pastel-pink-border)',
          text: 'var(--pastel-pink-text)',
          icon: <AlertCircle size={18} color="var(--pastel-pink-text)" />
        };
      case 'warning':
        return {
          bg: '#FEF4E3',
          border: '#FDE1B0',
          text: '#D97706',
          icon: <AlertTriangle size={18} color="#D97706" />
        };
      case 'info':
      default:
        return {
          bg: 'var(--pastel-lilac)',
          border: 'var(--pastel-lilac-border)',
          text: 'var(--pastel-lilac-text)',
          icon: <Info size={18} color="var(--primary)" />
        };
    }
  };

  const style = getStyle();

  return (
    <div className="toast-container" style={{
      position: 'fixed',
      bottom: '95px',
      right: '24px',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      background: style.bg,
      border: `1.5px solid ${style.border}`,
      color: style.text,
      padding: '0.85rem 1.25rem',
      borderRadius: '16px',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
      maxWidth: '380px',
      animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
    }}>
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
        {style.icon}
      </div>
      <div style={{ fontSize: '0.875rem', fontWeight: 600, flex: 1, lineHeight: 1.4 }}>
        {toast.message}
      </div>
      <button
        onClick={onClose}
        style={{
          background: 'transparent',
          border: 'none',
          color: style.text,
          cursor: 'pointer',
          padding: '0.2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 0.7,
          borderRadius: '50%'
        }}
        aria-label="Dismiss message"
      >
        <X size={15} />
      </button>
    </div>
  );
};

export default Toast;
