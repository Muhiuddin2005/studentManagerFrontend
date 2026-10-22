import React, { useState, useEffect } from 'react';
import { RoutineItem, DayOfWeek, Role, User } from '../types';
import { SubjectBadge } from './Badge';
import Modal from './Modal';
import * as api from '../services/api';
import { 
  Calendar, 
  Plus, 
  Trash2, 
  Clock, 
  Info
} from 'lucide-react';
import { 
  confirmDelete, 
  confirmAction, 
  showSuccessModal, 
  showErrorModal 
} from '../utils/sweetalert';

interface WeeklyRoutineProps {
  currentRole: Role;
  currentUser: User | null;
}

const ALL_DAYS: DayOfWeek[] = [
  'Saturday',
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday'
];

export default function WeeklyRoutine({ currentRole, currentUser }: WeeklyRoutineProps) {
  const [routines, setRoutines] = useState<RoutineItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [filterDay, setFilterDay] = useState<string>('all');

  // Form states: only week day and subject!
  const dayNames: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayName = dayNames[new Date().getDay()];

  const [formDay, setFormDay] = useState<DayOfWeek>(todayName);
  const [formSubject, setFormSubject] = useState<string>('Mathematics');
  const [customSubject, setCustomSubject] = useState<string>('');

  useEffect(() => {
    loadRoutines();

    // Silent background polling every 8 seconds
    const timer = setInterval(() => {
      loadRoutines(true);
    }, 8000);

    const handleFocus = () => {
      loadRoutines(true);
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  async function loadRoutines(silent = false) {
    try {
      if (!silent) setLoading(true);
      const res = await api.fetchRoutines();
      if (res.success) {
        setRoutines(res.data);
      }
    } catch (err: any) {
      if (!silent) console.error('Failed to load routines:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  }

  async function handleAddRoutine(e: React.FormEvent) {
    e.preventDefault();
    const finalSubject = formSubject === 'Custom' ? customSubject.trim() : formSubject;
    if (!finalSubject) return;

    const isConfirmed = await confirmAction({
      title: 'Add to Timetable?',
      text: `Add "${finalSubject}" on ${formDay} to the weekly study routine?`,
      confirmButtonText: 'Yes, Add Subject',
      icon: 'question',
      isSuccess: true
    });
    if (!isConfirmed) return;

    try {
      setSubmitting(true);
      const creatorName = currentUser?.name || (currentRole === 'student' ? 'Mohona' : 'Tutor Axis');
      const res = await api.createRoutine({
        day: formDay,
        subject: finalSubject,
        topic: finalSubject,
        time_slot: '',
        creator_role: currentRole,
        creator_name: creatorName
      });

      if (res.success) {
        setRoutines(prev => [res.data, ...prev]);
        setIsAddOpen(false);
        setCustomSubject('');
        await showSuccessModal('Routine Added!', `"${finalSubject}" scheduled for ${formDay}.`);
      }
    } catch (err: any) {
      await showErrorModal('Creation Failed', err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(routine: RoutineItem) {
    if (currentRole !== 'tutor') {
      await showErrorModal('Permission Denied', 'Only your tutor (Tutor Axis) is authorized to delete routine entries. Students can add new routines anytime!');
      return;
    }

    const isConfirmed = await confirmDelete(
      `Delete Routine Entry?`,
      `Remove "${routine.subject}" (${routine.day}) from the 7-day study timetable?`
    );
    if (!isConfirmed) return;

    try {
      const res = await api.deleteRoutine(routine.id, 'tutor');
      if (res.success) {
        setRoutines(prev => prev.filter(r => r.id !== routine.id));
        await showSuccessModal('Deleted!', `Routine entry for ${routine.day} removed.`);
      }
    } catch (err: any) {
      await showErrorModal('Delete Failed', err.message);
    }
  }

  // Filter routines if filterDay is set
  const filteredRoutines = filterDay === 'all'
    ? routines
    : routines.filter(r => r.day === filterDay);

  return (
    <section 
      id="weekly-routine-section"
      className="routine-section"
      style={{
        background: '#FFFFFF',
        borderRadius: '20px',
        border: '1px solid rgba(220, 224, 238, 0.75)',
        boxShadow: 'var(--shadow-card)',
        padding: '1.25rem 1.25rem 1.5rem',
        marginBottom: '1.75rem',
        overflow: 'hidden'
      }}
    >
      {/* Header Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        marginBottom: '1rem',
        paddingBottom: '0.75rem',
        borderBottom: '1px solid #ECEFF6'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'var(--pastel-lilac)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid var(--pastel-lilac-border)',
            flexShrink: 0
          }}>
            <Calendar size={18} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                7-Day Weekly Routine
              </h3>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                padding: '0.12rem 0.5rem',
                borderRadius: '999px',
                background: currentRole === 'student' ? 'var(--pastel-lilac)' : 'var(--pastel-amber)',
                color: currentRole === 'student' ? 'var(--primary)' : '#B45309',
                border: `1px solid ${currentRole === 'student' ? 'var(--pastel-lilac-border)' : '#FDE8BD'}`
              }}>
                {currentRole === 'student' ? 'Student: Can Add' : 'Tutor: Full Access'}
              </span>
            </div>
            <p style={{ fontSize: '0.785rem', color: 'var(--text-muted)', margin: '0.15rem 0 0 0' }}>
              Minimal schedule timetable: Week day & Subject
            </p>
          </div>
        </div>

        {/* Action: Add Routine Entry */}
        <button
          onClick={() => setIsAddOpen(true)}
          className="btn btn-primary btn-sm"
          style={{
            borderRadius: '999px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.45rem 1rem'
          }}
        >
          <Plus size={15} />
          <span>Add Routine</span>
        </button>
      </div>

      {/* Quick Day Filter Chips (Horizontal scrollable on mobile) */}
      <div style={{
        display: 'flex',
        gap: '0.4rem',
        overflowX: 'auto',
        paddingBottom: '0.65rem',
        marginBottom: '0.75rem',
        scrollbarWidth: 'none',
        WebkitOverflowScrolling: 'touch'
      }}>
        <button
          onClick={() => setFilterDay('all')}
          style={{
            padding: '0.3rem 0.75rem',
            borderRadius: '999px',
            border: filterDay === 'all' ? '1.5px solid var(--primary)' : '1px solid #E2E6F0',
            background: filterDay === 'all' ? 'var(--primary)' : '#F8F9FD',
            color: filterDay === 'all' ? '#FFFFFF' : 'var(--text-main)',
            fontSize: '0.75rem',
            fontWeight: 700,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            flexShrink: 0
          }}
        >
          All Days ({routines.length})
        </button>
        {ALL_DAYS.map(day => {
          const isToday = day === todayName;
          const count = routines.filter(r => r.day === day).length;
          const isSelected = filterDay === day;
          return (
            <button
              key={day}
              onClick={() => setFilterDay(day)}
              style={{
                padding: '0.3rem 0.75rem',
                borderRadius: '999px',
                border: isSelected ? '1.5px solid var(--primary)' : '1px solid #E2E6F0',
                background: isSelected ? 'var(--primary)' : '#F8F9FD',
                color: isSelected ? '#FFFFFF' : 'var(--text-main)',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}
            >
              <span>{day.slice(0, 3)}</span>
              {isToday && (
                <span style={{
                  fontSize: '0.6rem',
                  padding: '0.05rem 0.35rem',
                  borderRadius: '999px',
                  background: isSelected ? '#FFFFFF' : 'var(--pastel-pink)',
                  color: isSelected ? 'var(--primary)' : 'var(--pastel-pink-text)',
                  fontWeight: 800
                }}>
                  Today
                </span>
              )}
              {count > 0 && <span style={{ opacity: 0.8 }}>({count})</span>}
            </button>
          );
        })}
      </div>

      {/* Minimal Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
          <Clock size={20} className="animate-spin" style={{ margin: '0 auto 0.4rem auto' }} />
          <p style={{ fontSize: '0.8rem' }}>Loading routine table...</p>
        </div>
      ) : filteredRoutines.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '1.75rem 1rem',
          background: '#F9FAFC',
          borderRadius: '14px',
          border: '1px dashed #D3D8E6',
          color: 'var(--text-muted)'
        }}>
          <p style={{ fontSize: '0.85rem', margin: 0, fontWeight: 600 }}>
            No routine entries for {filterDay === 'all' ? 'the week' : filterDay} yet.
          </p>
          <button
            onClick={() => {
              if (filterDay !== 'all') setFormDay(filterDay as DayOfWeek);
              setIsAddOpen(true);
            }}
            className="btn btn-secondary btn-sm"
            style={{ marginTop: '0.65rem' }}
          >
            <Plus size={14} /> Add Subject for {filterDay === 'all' ? todayName : filterDay}
          </button>
        </div>
      ) : (
        <div className="routine-table-wrapper" style={{
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          borderRadius: '12px',
          border: '1px solid #ECEFF6'
        }}>
          <table className="routine-table" style={{
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'left',
            fontSize: '0.875rem'
          }}>
            <thead>
              <tr style={{
                background: '#FAFBFD',
                borderBottom: '1.5px solid #ECEFF6',
                color: 'var(--text-dim)',
                fontSize: '0.72rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}>
                <th style={{ padding: '0.75rem 1rem', width: '38%' }}>Week Day</th>
                <th style={{ padding: '0.75rem 1rem', width: '48%' }}>Subject</th>
                {currentRole === 'tutor' && (
                  <th style={{ padding: '0.75rem 1rem', width: '14%', textAlign: 'right' }}>
                    Action
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredRoutines.map((routine, idx) => {
                const isToday = routine.day === todayName;

                return (
                  <tr 
                    key={routine.id}
                    style={{
                      borderBottom: idx === filteredRoutines.length - 1 ? 'none' : '1px solid #F0F2F7',
                      background: isToday ? 'rgba(111, 101, 241, 0.02)' : '#FFFFFF',
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#F8F9FD')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = isToday ? 'rgba(111, 101, 241, 0.02)' : '#FFFFFF')}
                  >
                    {/* Column 1: Week Day */}
                    <td style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <span style={{
                          fontWeight: 700,
                          color: isToday ? 'var(--primary)' : 'var(--text-main)',
                          fontSize: '0.875rem'
                        }}>
                          {routine.day}
                        </span>
                        {isToday && (
                          <span style={{
                            fontSize: '0.625rem',
                            fontWeight: 800,
                            padding: '0.1rem 0.4rem',
                            borderRadius: '999px',
                            background: 'var(--pastel-pink)',
                            color: 'var(--pastel-pink-text)',
                            border: '1px solid var(--pastel-pink-border)'
                          }}>
                            Today
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Column 2: Subject */}
                    <td style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>
                      <SubjectBadge subject={routine.subject} />
                    </td>

                    {/* Column 3: Action (Tutor Only) */}
                    {currentRole === 'tutor' && (
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <button
                          onClick={() => handleDelete(routine)}
                          title="Delete routine entry"
                          style={{
                            background: 'var(--pastel-pink)',
                            border: '1px solid var(--pastel-pink-border)',
                            color: 'var(--pastel-pink-text)',
                            padding: '0.35rem 0.65rem',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            transition: 'all 0.15s'
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = '#FCD6E3')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--pastel-pink)')}
                        >
                          <Trash2 size={13} />
                          <span className="hide-on-mobile">Delete</span>
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Minimal Add Routine Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add to Weekly Routine"
        maxWidth="440px"
      >
        <form onSubmit={handleAddRoutine}>
          {/* Week Day Field */}
          <div className="form-group">
            <label className="form-label">Week Day *</label>
            <select
              className="form-select"
              value={formDay}
              onChange={(e) => setFormDay(e.target.value as DayOfWeek)}
              required
            >
              {ALL_DAYS.map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          </div>

          {/* Subject Field */}
          <div className="form-group">
            <label className="form-label">Subject *</label>
            <select
              className="form-select"
              value={formSubject}
              onChange={(e) => setFormSubject(e.target.value)}
              required
            >
              <option value="Mathematics">Mathematics</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="English Literature">English Literature</option>
              <option value="Biology">Biology</option>
              <option value="General">General</option>
              <option value="Custom">+ Other Subject</option>
            </select>
          </div>

          {/* Custom Subject Input if Custom selected */}
          {formSubject === 'Custom' && (
            <div className="form-group">
              <label className="form-label">Enter Subject Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Computer Science, Higher Math..."
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                required
                autoFocus
              />
            </div>
          )}

          <div style={{
            background: 'var(--pastel-lilac)',
            border: '1px solid var(--pastel-lilac-border)',
            borderRadius: '12px',
            padding: '0.65rem 0.85rem',
            fontSize: '0.75rem',
            color: 'var(--pastel-lilac-text)',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem'
          }}>
            <Info size={15} style={{ flexShrink: 0 }} />
            <span>
              Student can add routine entries. Only your teacher/tutor can delete entries.
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsAddOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              <Plus size={15} />
              <span>{submitting ? 'Adding...' : 'Save to Routine'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </section>
  );
}
