import React from 'react';
import { TaskStatus, Priority } from '../types';

export const StatusBadge: React.FC<{ status: TaskStatus }> = ({ status }) => {
  const getStatusConfig = (s: TaskStatus) => {
    switch (s) {
      case 'start':
        return { label: 'Start', className: 'start' };
      case 'ongoing':
        return { label: 'Ongoing', className: 'ongoing' };
      case 'update raised':
        return { label: 'Update Raised', className: 'update-raised' };
      case 'done':
        return { label: 'Done', className: 'done' };
      default:
        return { label: s, className: 'start' };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span className={`status-badge ${config.className}`}>
      <span className="status-dot"></span>
      {config.label}
    </span>
  );
};

export const SubjectBadge: React.FC<{ subject: string }> = ({ subject }) => {
  // Soft pastel colors based on subject name
  const subjectThemes: Record<string, { bg: string; text: string; border: string }> = {
    Mathematics: { bg: 'var(--pastel-lilac)', text: 'var(--pastel-lilac-text)', border: 'var(--pastel-lilac-border)' },
    Physics: { bg: 'var(--pastel-amber)', text: 'var(--pastel-amber-text)', border: 'var(--pastel-amber-border)' },
    Chemistry: { bg: 'var(--pastel-mint)', text: 'var(--pastel-mint-text)', border: 'var(--pastel-mint-border)' },
    'English Literature': { bg: 'var(--pastel-pink)', text: 'var(--pastel-pink-text)', border: 'var(--pastel-pink-border)' },
    Biology: { bg: '#EBF7EE', text: '#2E7D32', border: '#D0EED5' },
    General: { bg: '#F1F3F8', text: '#5C6478', border: '#E2E6F0' },
  };

  const style = subjectThemes[subject] || subjectThemes.General;

  return (
    <span style={{
      fontSize: '0.725rem',
      fontWeight: 700,
      padding: '0.22rem 0.65rem',
      borderRadius: '999px',
      background: style.bg,
      color: style.text,
      border: `1px solid ${style.border}`
    }}>
      {subject}
    </span>
  );
};

export const PriorityBadge: React.FC<{ priority: Priority }> = ({ priority }) => {
  const colors: Record<Priority, { bg: string; text: string; border: string }> = {
    urgent: { bg: '#FEE2E2', text: '#DC2626', border: '#FCA5A5' },
    high: { bg: 'var(--pastel-pink)', text: 'var(--pastel-pink-text)', border: 'var(--pastel-pink-border)' },
    medium: { bg: 'var(--pastel-lilac)', text: 'var(--pastel-lilac-text)', border: 'var(--pastel-lilac-border)' },
    low: { bg: '#F1F3F8', text: '#64748B', border: '#E2E6F0' },
  };

  const style = colors[priority] || colors.medium;

  return (
    <span style={{
      fontSize: '0.68rem',
      fontWeight: 800,
      textTransform: 'uppercase',
      letterSpacing: '0.03em',
      padding: '0.15rem 0.5rem',
      borderRadius: '999px',
      background: style.bg,
      color: style.text,
      border: `1px solid ${style.border}`
    }}>
      {priority}
    </span>
  );
};
