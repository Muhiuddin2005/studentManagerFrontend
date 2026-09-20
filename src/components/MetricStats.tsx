import React from 'react';
import { PlayCircle, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Task, TaskStatus } from '../types';

interface MetricStatsProps {
  tasks: Task[];
  activeFilter: string;
  onSelectFilter: (filter: string) => void;
}

export const MetricStats: React.FC<MetricStatsProps> = ({ 
  tasks, 
  activeFilter, 
  onSelectFilter 
}) => {
  const counts = {
    start: tasks.filter(t => t.status === 'start').length,
    ongoing: tasks.filter(t => t.status === 'ongoing').length,
    updateRaised: tasks.filter(t => t.status === 'update raised').length,
    done: tasks.filter(t => t.status === 'done').length,
    total: tasks.length
  };

  const statCards: Array<{
    id: TaskStatus;
    title: string;
    count: number;
    icon: React.ComponentType<{ size?: number }>;
    description: string;
    color: string;
    bg: string;
    border: string;
    isAlert?: boolean;
  }> = [
    {
      id: 'start',
      title: 'Start',
      count: counts.start,
      icon: PlayCircle,
      description: 'Ready to learn',
      color: 'var(--pastel-lilac-text)',
      bg: 'var(--pastel-lilac)',
      border: 'var(--pastel-lilac-border)'
    },
    {
      id: 'ongoing',
      title: 'Ongoing',
      count: counts.ongoing,
      icon: Clock,
      description: 'In progress',
      color: 'var(--pastel-amber-text)',
      bg: 'var(--pastel-amber)',
      border: 'var(--pastel-amber-border)'
    },
    {
      id: 'update raised',
      title: 'Update Raised',
      count: counts.updateRaised,
      icon: AlertTriangle,
      description: 'Questions asked',
      color: 'var(--pastel-pink-text)',
      bg: 'var(--pastel-pink)',
      border: 'var(--pastel-pink-border)',
      isAlert: true
    },
    {
      id: 'done',
      title: 'Done',
      count: counts.done,
      icon: CheckCircle2,
      description: 'Completed tasks',
      color: 'var(--pastel-mint-text)',
      bg: 'var(--pastel-mint)',
      border: 'var(--pastel-mint-border)'
    }
  ];

  return (
    <div className="horizontal-scroll-container" style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
      gap: '1rem',
      marginBottom: '1.75rem'
    }}>
      {statCards.map((card) => {
        const IconComponent = card.icon;
        const isSelected = activeFilter === card.id;
        const percent = counts.total > 0 ? Math.round((card.count / counts.total) * 100) : 0;

        return (
          <div
            key={card.id}
            onClick={() => onSelectFilter(isSelected ? 'all' : card.id)}
            style={{
              background: card.bg,
              border: `1.5px solid ${isSelected ? card.color : card.border}`,
              borderRadius: 'var(--radius-card)',
              padding: '1.2rem 1.35rem',
              cursor: 'pointer',
              transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: isSelected ? '0 8px 20px rgba(111, 101, 241, 0.15)' : 'var(--shadow-sm)',
              transform: isSelected ? 'translateY(-2px)' : 'none',
              position: 'relative',
              overflow: 'hidden',
              minWidth: '180px' // Ensures horizontal scroll readability on small mobile
            }}
          >
            {/* Top row with Title and Circular Icon */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: '#FFFFFF',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: card.color
              }}>
                <IconComponent size={20} />
              </div>

              {/* Mini Percentage Pill resembling reference chart widget */}
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: card.color,
                background: 'rgba(255, 255, 255, 0.85)',
                padding: '0.18rem 0.55rem',
                borderRadius: '999px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.02)'
              }}>
                {percent}%
              </span>
            </div>

            {/* Middle Count & Label */}
            <div>
              <div style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1 }}>
                {card.count}
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.35rem' }}>
                {card.title}
              </div>
            </div>

            {/* Description */}
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem', marginBottom: 0 }}>
              {card.description}
            </p>

            {/* Alert badge if any */}
            {card.isAlert && card.count > 0 && (
              <div style={{
                marginTop: '0.6rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontSize: '0.68rem',
                fontWeight: 800,
                color: '#FFFFFF',
                background: '#F43F5E',
                padding: '0.15rem 0.55rem',
                borderRadius: '999px'
              }}>
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#fff' }} />
                <span>Needs Tutor</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MetricStats;
