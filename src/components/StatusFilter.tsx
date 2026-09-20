import React from 'react';
import { Search } from 'lucide-react';
import { StatusCounts } from '../types';

interface StatusFilterProps {
  currentFilter: string;
  onFilterChange: (filter: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  counts: StatusCounts;
}

export const StatusFilter: React.FC<StatusFilterProps> = ({ 
  currentFilter, 
  onFilterChange, 
  searchQuery, 
  onSearchChange,
  counts 
}) => {
  const filters: Array<{ id: string; label: string; count: number; isAlert?: boolean }> = [
    { id: 'all', label: 'All Tasks', count: counts.all },
    { id: 'start', label: 'Start', count: counts.start },
    { id: 'ongoing', label: 'Ongoing', count: counts.ongoing },
    { id: 'update raised', label: 'Update Raised', count: counts.updateRaised, isAlert: true },
    { id: 'done', label: 'Done', count: counts.done },
  ];

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '0.85rem',
      marginBottom: '1.5rem',
      padding: '0.65rem 0.85rem',
      background: '#FFFFFF',
      borderRadius: '20px',
      border: '1px solid rgba(220, 224, 238, 0.7)',
      boxShadow: 'var(--shadow-sm)'
    }}>
      {/* Tab Pills (Matching "Today | Learning plan | Weekly plan" in reference) */}
      <div 
        className="horizontal-scroll-container"
        style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'nowrap' }}
      >
        {filters.map((f) => {
          const isActive = currentFilter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => onFilterChange(f.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.45rem 1rem',
                borderRadius: '999px',
                border: 'none',
                background: isActive 
                  ? (f.isAlert ? '#F43F5E' : 'var(--primary)') 
                  : '#F3F4F9',
                color: isActive ? '#FFFFFF' : 'var(--text-muted)',
                fontWeight: 700,
                fontSize: '0.825rem',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                whiteSpace: 'nowrap',
                boxShadow: isActive ? '0 2px 8px rgba(111, 101, 241, 0.3)' : 'none'
              }}
            >
              <span>{f.label}</span>
              <span style={{
                fontSize: '0.7rem',
                padding: '0.1rem 0.45rem',
                borderRadius: '999px',
                background: isActive ? 'rgba(255, 255, 255, 0.25)' : '#E2E6F2',
                color: isActive ? '#FFFFFF' : 'var(--text-muted)',
                fontWeight: 700
              }}>
                {f.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search Input */}
      <div style={{ position: 'relative', flex: '1 1 200px', maxWidth: '300px' }}>
        <Search 
          size={16} 
          style={{ 
            position: 'absolute', 
            left: '14px', 
            top: '50%', 
            transform: 'translateY(-50%)', 
            color: 'var(--text-dim)' 
          }} 
        />
        <input
          type="text"
          placeholder="Search topic or subject..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{
            background: '#F8F9FD',
            border: '1px solid #E2E6F0',
            borderRadius: '999px',
            padding: '0.48rem 1rem 0.48rem 2.4rem',
            color: 'var(--text-main)',
            fontSize: '0.85rem',
            width: '100%',
            outline: 'none',
            fontFamily: 'var(--font-body)',
            transition: 'all 0.2s'
          }}
          onFocus={(e) => {
            e.currentTarget.style.background = '#FFFFFF';
            e.currentTarget.style.borderColor = 'var(--primary)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.background = '#F8F9FD';
            e.currentTarget.style.borderColor = '#E2E6F0';
          }}
        />
      </div>
    </div>
  );
};

export default StatusFilter;
