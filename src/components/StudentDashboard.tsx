import React from 'react';
import { StatusBadge, SubjectBadge, PriorityBadge } from './Badge';
import TimelineStepper from './TimelineStepper';
import { Task, TaskStatus } from '../types';
import { resolveAttachmentUrl } from '../services/api';
import { 
  Paperclip, 
  Image as ImageIcon, 
  ArrowUpRight, 
  Check, 
  History,
  Calendar,
  AlertCircle,
  Sparkles,
  Pencil
} from 'lucide-react';

interface StudentDashboardProps {
  tasks: Task[];
  onStatusChange: (task: Task, newStatus: TaskStatus, note?: string) => Promise<void>;
  onOpenAttachModal: (task: Task) => void;
  onOpenDetailsModal: (task: Task) => void;
  onOpenPreviewImage: (url: string) => void;
  onOpenNewTaskModal?: () => void;
  onEditTask?: (task: Task) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  tasks,
  onStatusChange,
  onOpenAttachModal,
  onOpenDetailsModal,
  onOpenPreviewImage,
  onOpenNewTaskModal,
  onEditTask
}) => {
  if (tasks.length === 0) {
    return (
      <div className="pastel-card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
        <div style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'var(--pastel-lilac)',
          color: 'var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.25rem'
        }}>
          <AlertCircle size={28} />
        </div>
        <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
          No study tasks assigned
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '0 auto', maxWidth: '420px' }}>
          No homework or study tasks currently assigned. You can add your own study task or wait for your tutor to assign new lessons!
        </p>
        {onOpenNewTaskModal && (
          <button
            className="btn btn-primary"
            onClick={onOpenNewTaskModal}
            style={{ marginTop: '1.25rem', padding: '0.6rem 1.4rem' }}
          >
            <Sparkles size={16} />
            <span>Add Study Task</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
          Curriculum & Study Schedule ({tasks.length})
        </h3>
        {onOpenNewTaskModal && (
          <button className="btn btn-secondary btn-sm" onClick={onOpenNewTaskModal}>
            <Sparkles size={14} color="var(--primary)" />
            <span>Add Task</span>
          </button>
        )}
      </div>
      {tasks.map((task) => {
        const hasUpdateRaised = task.status === 'update raised';
        const isDone = task.status === 'done';
        const screenshots = (task.attachments || []).filter(a => a.type === 'screenshot' || a.file_url);
        const textQuestions = (task.attachments || []).filter(a => a.type === 'text_question' || (!a.file_url && a.content));

        // Soft pastel card background matching reference mockup
        const cardBg = hasUpdateRaised 
          ? 'var(--pastel-pink)' 
          : (isDone ? 'var(--pastel-mint)' : (task.status === 'ongoing' ? 'var(--pastel-amber)' : 'var(--pastel-lilac)'));

        return (
          <div
            key={task.id}
            className="pastel-card"
            style={{
              padding: '1.5rem',
              background: '#FFFFFF',
              border: hasUpdateRaised ? '1.5px solid var(--pastel-pink-border)' : '1px solid rgba(220, 224, 238, 0.8)',
              boxShadow: hasUpdateRaised ? '0 8px 24px rgba(244, 63, 94, 0.08)' : 'var(--shadow-card)'
            }}
          >
            {/* Top Meta Bar */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem',
              marginBottom: '0.85rem'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.45rem' }}>
                  <StatusBadge status={task.status} />
                  <SubjectBadge subject={task.subject} />
                  <PriorityBadge priority={task.priority || 'medium'} />
                  {task.deadline && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Calendar size={13} />
                      Due: {new Date(task.deadline).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, lineHeight: 1.3 }}>
                  {task.title}
                </h3>
              </div>

              {/* History pill button */}
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => onOpenDetailsModal(task)}
                title="View full audit trail & notes"
                style={{ padding: '0.35rem 0.85rem' }}
              >
                <History size={14} />
                <span>History ({task.timeline_events?.length || 1})</span>
              </button>
            </div>

            {/* Description */}
            {task.description && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.885rem', marginBottom: '1.15rem', lineHeight: 1.6 }}>
                {task.description}
              </p>
            )}

            {/* Timeline Stepper Container */}
            <div style={{
              background: '#F8F9FD',
              borderRadius: '16px',
              padding: '0.75rem 1rem',
              marginBottom: '1.15rem',
              border: '1px solid #ECEFF6'
            }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-dim)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Timeline Progress
              </div>
              <TimelineStepper
                currentStatus={task.status}
                onStatusChange={(newStatus) => onStatusChange(task, newStatus)}
                userRole="student"
              />
            </div>

            {/* Attached Questions & Problem Screenshots (Pastel tinted box) */}
            {(screenshots.length > 0 || textQuestions.length > 0) && (
              <div style={{
                background: cardBg,
                borderRadius: '16px',
                padding: '1.1rem',
                marginBottom: '1.15rem',
                border: '1px solid rgba(0, 0, 0, 0.04)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.65rem' }}>
                  <Paperclip size={14} color="var(--primary)" />
                  <span>Attached Homework Problems & Questions ({task.attachments?.length || 0})</span>
                </div>

                {textQuestions.map((q) => (
                  <div
                    key={q.id}
                    style={{
                      background: '#FFFFFF',
                      borderLeft: '3px solid var(--primary)',
                      padding: '0.7rem 0.95rem',
                      borderRadius: '0 10px 10px 0',
                      fontSize: '0.85rem',
                      color: 'var(--text-main)',
                      marginBottom: '0.5rem',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.02)'
                    }}
                  >
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '0.2rem', fontWeight: 600 }}>
                      Question asked by {q.uploader_role === 'student' ? 'Mohona' : 'Tutor'} • {new Date(q.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    "{q.content}"
                  </div>
                ))}

                {screenshots.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                    {screenshots.map((s) => {
                      const imageSrc = resolveAttachmentUrl(s.file_url);

                      return (
                        <div
                          key={s.id}
                          onClick={() => onOpenPreviewImage(imageSrc)}
                          style={{
                            position: 'relative',
                            width: '125px',
                            height: '85px',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            border: '1px solid rgba(0, 0, 0, 0.08)',
                            cursor: 'pointer',
                            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
                            transition: 'transform 0.2s',
                            background: '#F1F3F8'
                          }}
                          onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.03)')}
                          onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                          title="Click to view full screenshot"
                        >
                          <img
                            src={imageSrc}
                            alt={s.file_name || 'Problem screenshot'}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => {
                              const target = e.currentTarget;
                              target.onerror = null;
                              target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='125' height='85' viewBox='0 0 125 85'%3E%3Crect width='100%25' height='100%25' fill='%23EEF0FD'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='10' font-weight='bold' fill='%236F65F1'%3E%F0%9F%93%B7 View Problem%3C/text%3E%3C/svg%3E";
                            }}
                          />

                          <div style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 60%)',
                            display: 'flex',
                            alignItems: 'flex-end',
                            padding: '0.35rem 0.5rem',
                            fontSize: '0.65rem',
                            color: '#fff',
                            fontWeight: 600
                          }}>
                            <ImageIcon size={11} style={{ marginRight: '3px' }} />
                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {s.file_name || 'Screenshot'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Student Action Bar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem',
              paddingTop: '0.85rem',
              borderTop: '1px solid #ECEFF6'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                {task.status === 'start' && (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => onStatusChange(task, 'ongoing', 'Student started working on task')}
                  >
                    <span>Start Working</span>
                    <ArrowUpRight size={14} />
                  </button>
                )}

                {/* Question & Screenshot Attachment Action Button */}
                <button
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => onOpenAttachModal(task)}
                >
                  <ImageIcon size={14} />
                  <span>Attach Question / Screenshot</span>
                </button>

                {/* Edit Task Action Button (Available to both Student & Tutor) */}
                {onEditTask && (
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => onEditTask(task)}
                    title="Edit Task Details"
                  >
                    <Pencil size={13} />
                    <span>Edit</span>
                  </button>
                )}

                {task.status === 'done' ? (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'var(--pastel-mint-text)',
                    background: 'var(--pastel-mint)',
                    padding: '0.3rem 0.75rem',
                    borderRadius: '999px',
                    border: '1px solid var(--pastel-mint-border)'
                  }}>
                    <Check size={13} />
                    <span>Verified & Done by Tutor</span>
                  </span>
                ) : (
                  <span style={{ 
                    fontSize: '0.735rem', 
                    color: 'var(--text-muted)', 
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    background: '#F8F9FD',
                    padding: '0.3rem 0.65rem',
                    borderRadius: '8px',
                    border: '1px solid #ECEFF6'
                  }}>
                    <span>⏳ Awaiting tutor verification</span>
                  </span>
                )}
              </div>

              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                Updated: {new Date(task.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StudentDashboard;
