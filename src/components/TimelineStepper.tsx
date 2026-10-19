import React from 'react';
import { CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { TaskStatus, Role } from '../types';

interface TimelineStepperProps {
  currentStatus: TaskStatus;
  onStatusChange?: (status: TaskStatus) => void;
  userRole?: Role;
}

const STEPS: Array<{ key: TaskStatus; label: string }> = [
  { key: 'start', label: 'Start' },
  { key: 'ongoing', label: 'Ongoing' },
  { key: 'update raised', label: 'Update Raised' },
  { key: 'done', label: 'Done' }
];

export const TimelineStepper: React.FC<TimelineStepperProps> = ({ 
  currentStatus, 
  onStatusChange,
  userRole = 'student'
}) => {
  const currentIndex = STEPS.findIndex(s => s.key === currentStatus);

  return (
    <div style={{ margin: '0.75rem 0' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative'
      }}>
        {/* Connector Line */}
        <div className="stepper-line" style={{
          position: 'absolute',
          top: '16px',
          left: '20px',
          right: '20px',
          height: '3px',
          background: '#E2E6F2',
          zIndex: 1,
          borderRadius: '999px'
        }}>
          <div style={{
            height: '100%',
            background: currentStatus === 'update raised' 
              ? 'var(--pastel-pink-text)' 
              : (currentStatus === 'done' ? 'var(--pastel-mint-text)' : 'var(--primary)'),
            width: `${(Math.max(0, currentIndex) / (STEPS.length - 1)) * 100}%`,
            transition: 'width 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
            borderRadius: '999px'
          }} />
        </div>

        {/* Step Nodes */}
        {STEPS.map((step, idx) => {
          const isPassed = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const isAlert = step.key === 'update raised';

          let nodeBg = '#FFFFFF';
          let nodeBorder = '#E2E6F2';
          let textColor = 'var(--text-muted)';
          let iconColor = 'var(--text-dim)';

          if (isCurrent) {
            if (isAlert) {
              nodeBg = 'var(--pastel-pink)';
              nodeBorder = 'var(--pastel-pink-text)';
              textColor = 'var(--pastel-pink-text)';
              iconColor = 'var(--pastel-pink-text)';
            } else if (step.key === 'done') {
              nodeBg = 'var(--pastel-mint)';
              nodeBorder = 'var(--pastel-mint-text)';
              textColor = 'var(--pastel-mint-text)';
              iconColor = 'var(--pastel-mint-text)';
            } else {
              nodeBg = 'var(--primary)';
              nodeBorder = 'var(--primary)';
              textColor = 'var(--primary)';
              iconColor = '#FFFFFF';
            }
          } else if (isPassed) {
            nodeBg = 'var(--pastel-lilac)';
            nodeBorder = 'var(--primary)';
            textColor = 'var(--text-main)';
            iconColor = 'var(--primary)';
          }

          const isDoneRestricted = userRole === 'student' && step.key === 'done';

          return (
            <div 
              key={step.key} 
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                zIndex: 2,
                cursor: isDoneRestricted ? 'not-allowed' : 'pointer',
                opacity: isDoneRestricted && !isCurrent ? 0.65 : 1
              }}
              onClick={() => {
                if (isDoneRestricted) return;
                onStatusChange && onStatusChange(step.key);
              }}
              title={isDoneRestricted ? 'Tutor verification required to mark as Done' : `Switch to ${step.label}`}
            >
              <div className="stepper-circle" style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: nodeBg,
                border: `2px solid ${nodeBorder}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: iconColor,
                boxShadow: isCurrent 
                  ? (isAlert ? '0 2px 10px rgba(244, 63, 94, 0.3)' : '0 2px 10px rgba(111, 101, 241, 0.3)') 
                  : '0 1px 4px rgba(0,0,0,0.04)',
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
              }}>
                {isPassed ? (
                  <CheckCircle2 size={16} />
                ) : isCurrent ? (
                  isAlert ? <AlertCircle size={16} /> : <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: isCurrent && step.key === 'start' ? '#fff' : 'currentColor' }} />
                ) : (
                  <Circle size={12} />
                )}
              </div>
              <span className="stepper-label" style={{
                fontSize: '0.725rem',
                fontWeight: isCurrent ? 800 : 600,
                color: textColor,
                marginTop: '0.35rem',
                textAlign: 'center',
                whiteSpace: 'normal',
                maxWidth: '75px',
                lineHeight: 1.2
              }}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TimelineStepper;
