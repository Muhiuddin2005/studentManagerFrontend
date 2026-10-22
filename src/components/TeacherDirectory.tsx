import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  UserCheck, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  GraduationCap,
  Mail,
  RefreshCw
} from 'lucide-react';
import { TeacherProfile, TutorStudentPair } from '../types';
import * as api from '../services/api';
import { confirmAction, showSuccessModal, showErrorModal } from '../utils/sweetalert';
import { useAuth } from '../context/AuthContext';

interface TeacherDirectoryProps {
  onSelectTuple?: (pair: TutorStudentPair) => void;
  activeTuple?: TutorStudentPair | null;
  onRefresh?: () => void;
}

export const TeacherDirectory: React.FC<TeacherDirectoryProps> = ({
  onSelectTuple,
  activeTuple,
  onRefresh
}) => {
  const { user } = useAuth();
  const [teachers, setTeachers] = useState<TeacherProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [requestingEmail, setRequestingEmail] = useState<string | null>(null);

  useEffect(() => {
    loadTeachers();
  }, [user]);

  async function loadTeachers() {
    try {
      setLoading(true);
      const res = await api.fetchTeachers(user?.email);
      if (res.success) {
        setTeachers(res.data);
      }
    } catch (err: any) {
      console.warn('Failed to load teachers:', err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRequestConnection(teacher: TeacherProfile) {
    if (!user) return;

    const isConfirmed = await confirmAction({
      title: `Connect with ${teacher.name}?`,
      text: `Send a pairing request to ${teacher.name} (${teacher.email})? Once accepted, your study dashboard and timetable will be shared and linked.`,
      confirmButtonText: 'Yes, Send Request',
      icon: 'question',
      isSuccess: true
    });

    if (!isConfirmed) return;

    try {
      setRequestingEmail(teacher.email);
      const res = await api.requestTeacherConnection({
        tutor_email: teacher.email,
        tutor_name: teacher.name,
        tutor_id: teacher.id,
        student_email: user.email,
        student_name: user.name,
        student_id: user.id
      });

      if (res.success) {
        await showSuccessModal(
          'Request Dispatched!',
          `Your connection request was sent to ${teacher.name}. An email notification has been dispatched to their inbox.`
        );
        loadTeachers();
        if (onRefresh) onRefresh();
      }
    } catch (err: any) {
      await showErrorModal('Request Failed', err.message);
    } finally {
      setRequestingEmail(null);
    }
  }

  const filteredTeachers = teachers.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '1rem 0' }}>
      {/* Top Banner Header */}
      <div style={{
        background: 'linear-gradient(135deg, #6F65F1 0%, #8F85FF 100%)',
        borderRadius: '24px',
        padding: '2rem 1.75rem',
        color: '#FFFFFF',
        marginBottom: '2rem',
        boxShadow: '0 12px 30px rgba(111, 101, 241, 0.18)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            background: 'rgba(255, 255, 255, 0.18)',
            padding: '0.35rem 0.85rem',
            borderRadius: '999px',
            fontSize: '0.78rem',
            fontWeight: 700,
            marginBottom: '0.85rem'
          }}>
            <Sparkles size={14} />
            <span>Teacher & Student Group Pairing</span>
          </div>

          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 0.5rem 0', letterSpacing: '-0.02em' }}>
            Find Your Teacher & Connect
          </h2>
          <p style={{ margin: 0, fontSize: '0.92rem', opacity: 0.9, maxWidth: '620px', lineHeight: 1.55 }}>
            To access your shared homework timeline, tasks, and weekly timetable, request your teacher to form a linked group. Once approved, both of your accounts will be bound.
          </p>
        </div>

        {/* Decorative background shape */}
        <div style={{
          position: 'absolute',
          right: '-20px',
          bottom: '-30px',
          opacity: 0.12,
          pointerEvents: 'none'
        }}>
          <GraduationCap size={180} />
        </div>
      </div>

      {/* Search and Action Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{
          position: 'relative',
          flex: '1 1 300px',
          maxWidth: '460px'
        }}>
          <Search size={16} style={{
            position: 'absolute',
            left: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)'
          }} />
          <input
            type="text"
            placeholder="Search teacher by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.65rem 1rem 0.65rem 2.4rem',
              borderRadius: '999px',
              border: '1.5px solid rgba(220, 224, 238, 0.85)',
              background: '#FFFFFF',
              fontSize: '0.88rem',
              outline: 'none',
              boxShadow: 'var(--shadow-sm)'
            }}
          />
        </div>

        <button
          onClick={loadTeachers}
          className="btn-secondary"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.55rem 1rem',
            borderRadius: '999px',
            fontSize: '0.82rem',
            fontWeight: 700
          }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Teachers</span>
        </button>
      </div>

      {/* Teachers Directory Grid */}
      {loading ? (
        <div style={{
          textAlign: 'center',
          padding: '4rem 1rem',
          background: '#FFFFFF',
          borderRadius: '20px',
          border: '1px solid rgba(220, 224, 238, 0.6)'
        }}>
          <Clock size={32} color="var(--primary)" className="animate-spin" style={{ margin: '0 auto 0.75rem auto' }} />
          <p style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.92rem' }}>
            Fetching verified teachers directory...
          </p>
        </div>
      ) : filteredTeachers.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          background: '#FFFFFF',
          borderRadius: '24px',
          border: '1.5px dashed rgba(220, 224, 238, 0.9)'
        }}>
          <Users size={48} color="var(--primary)" style={{ opacity: 0.4, margin: '0 auto 1rem auto' }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.4rem 0', color: 'var(--text-main)' }}>
            No Teachers Found
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: '420px', margin: '0 auto' }}>
            {searchQuery 
              ? `No teachers match "${searchQuery}". Try a different keyword.` 
              : 'No teachers are registered yet. Once a tutor signs up with the Tutor role, they will appear here.'}
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
          gap: '1.25rem'
        }}>
          {filteredTeachers.map((teacher) => {
            const normTeacherEmail = teacher.email.trim().toLowerCase();
            const isCurrentActive = Boolean(
              activeTuple &&
              activeTuple.status === 'accepted' &&
              (activeTuple.tutor_email.trim().toLowerCase() === normTeacherEmail ||
               (activeTuple.tutor_id && activeTuple.tutor_id === teacher.id))
            );
            const isAccepted = teacher.connectionStatus === 'accepted' || isCurrentActive;
            const isPending = !isAccepted && (
              teacher.connectionStatus === 'pending' ||
              Boolean(activeTuple && activeTuple.status === 'pending' && activeTuple.tutor_email.trim().toLowerCase() === normTeacherEmail)
            );
            const isRequestingThis = requestingEmail === teacher.email;

            return (
              <div
                key={teacher.id || teacher.email}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '22px',
                  border: isCurrentActive 
                    ? '2px solid var(--primary)' 
                    : isAccepted 
                    ? '1.5px solid #A7F3D0' 
                    : '1px solid rgba(220, 224, 238, 0.75)',
                  padding: '1.35rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: isCurrentActive ? '0 8px 24px rgba(111, 101, 241, 0.12)' : 'var(--shadow-sm)',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  position: 'relative'
                }}
              >
                {/* Active Group Indicator */}
                {isCurrentActive && (
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: 'var(--pastel-lilac)',
                    color: 'var(--primary)',
                    border: '1px solid var(--pastel-lilac-border)',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    padding: '0.2rem 0.55rem',
                    borderRadius: '999px'
                  }}>
                    Active Tuple
                  </div>
                )}

                <div>
                  {/* Avatar & Info Header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1rem' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '16px',
                      background: 'linear-gradient(135deg, #6F65F1 0%, #8F85FF 100%)',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '1.25rem',
                      boxShadow: '0 4px 12px rgba(111, 101, 241, 0.22)'
                    }}>
                      {teacher.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 0.2rem 0', fontSize: '1.02rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        {teacher.name}
                      </h4>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        fontSize: '0.78rem',
                        color: 'var(--text-muted)'
                      }}>
                        <Mail size={12} />
                        <span>{teacher.email}</span>
                      </div>
                    </div>
                  </div>

                  {/* Specialty / Role badge */}
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.6rem',
                      borderRadius: '999px',
                      background: 'var(--pastel-mint)',
                      color: 'var(--pastel-mint-text)',
                      border: '1px solid var(--pastel-mint-border)'
                    }}>
                      Verified Tutor
                    </span>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.6rem',
                      borderRadius: '999px',
                      background: 'var(--bg-canvas)',
                      color: 'var(--text-muted)',
                      border: '1px solid #E2E6F0'
                    }}>
                      Personalized 1-on-1
                    </span>
                  </div>
                </div>

                {/* Status and Action Buttons */}
                <div style={{ paddingTop: '0.75rem', borderTop: '1px solid rgba(220, 224, 238, 0.5)' }}>
                  {isAccepted ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        color: '#059669',
                        fontSize: '0.78rem',
                        fontWeight: 700
                      }}>
                        <CheckCircle2 size={14} />
                        <span>Connected & Bound</span>
                      </div>

                      <button
                        onClick={() => {
                          const chosenPair = teacher.pair || (isCurrentActive ? activeTuple : null);
                          if (chosenPair && onSelectTuple) {
                            onSelectTuple(chosenPair);
                          }
                        }}
                        className="btn btn-primary"
                        style={{
                          width: '100%',
                          padding: '0.5rem 0.85rem',
                          fontSize: '0.82rem',
                          justifyContent: 'center'
                        }}
                      >
                        <span>Open Shared Dashboard</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  ) : isPending ? (
                    <div style={{
                      background: 'var(--pastel-peach)',
                      border: '1px solid var(--pastel-peach-border)',
                      borderRadius: '12px',
                      padding: '0.65rem',
                      textAlign: 'center'
                    }}>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        color: 'var(--pastel-peach-text)',
                        fontWeight: 700,
                        fontSize: '0.8rem'
                      }}>
                        <Clock size={13} />
                        <span>Request Pending Acceptance</span>
                      </div>
                      <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.72rem', color: '#92400E' }}>
                        Waiting for teacher to accept your connection
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleRequestConnection(teacher)}
                      disabled={isRequestingThis}
                      className="btn btn-primary"
                      style={{
                        width: '100%',
                        padding: '0.55rem 0.85rem',
                        fontSize: '0.82rem',
                        justifyContent: 'center'
                      }}
                    >
                      {isRequestingThis ? (
                        <>
                          <Clock size={14} className="animate-spin" />
                          <span>Sending Request...</span>
                        </>
                      ) : (
                        <>
                          <UserCheck size={14} />
                          <span>Request Teacher & Bind Group</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TeacherDirectory;
