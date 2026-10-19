import React from 'react';
import { StatusBadge, SubjectBadge, PriorityBadge } from './Badge';
import TimelineStepper from './TimelineStepper';
import { Task, TaskStatus } from '../types';
import { resolveAttachmentUrl } from '../services/api';
import { 
  AlertTriangle, 
  MessageSquare, 
  CheckCircle2, 
  RotateCcw, 
  History,
  Sparkles
} from 'lucide-react';

interface TutorDashboardProps {
  tasks: Task[];
  onStatusChange: (task: Task, newStatus: TaskStatus, note?: string) => Promise<void>;
  onOpenDetailsModal: (task: Task) => void;
  onOpenPreviewImage: (url: string) => void;
  onOpenNewTaskModal: () => void;
}

export const TutorDashboard: React.FC<TutorDashboardProps> = ({
  tasks,
  onStatusChange,
  onOpenDetailsModal,
  onOpenPreviewImage,
  onOpenNewTaskModal
}) => {
  const updateRaisedTasks = tasks.filter(t => t.status === 'update raised');
  const otherTasks = tasks.filter(t => t.status !== 'update raised');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Priority 1: Student Questions & Screenshots Awaiting Tutor Triage */}
      {updateRaisedTasks.length > 0 && (
        <section style={{
          background: 'var(--pastel-pink)',
          border: '1.5px solid var(--pastel-pink-border)',
          borderRadius: 'var(--radius-card)',
          padding: '1.5rem',
          boxShadow: 'var(--shadow-card)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.15rem',
            flexWrap: 'wrap',
            gap: '0.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: '#FFFFFF',
                color: 'var(--pastel-pink-text)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
              }}>
                <AlertTriangle size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                  Questions Needing Your Guidance ({updateRaisedTasks.length})
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--pastel-pink-text)', margin: 0, fontWeight: 600 }}>
                  Student has attached homework problem images or questions requiring tutor review
                </p>
              </div>
            </div>

            <span style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              background: '#FFFFFF',
              color: 'var(--pastel-pink-text)',
              padding: '0.25rem 0.75rem',
              borderRadius: '999px',
              border: '1px solid var(--pastel-pink-border)',
              boxShadow: '0 1px 4px rgba(0,0,0,0.02)'
            }}>
              ACTION REQUIRED
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {updateRaisedTasks.map((task) => {
              const screenshots = (task.attachments || []).filter(a => a.type === 'screenshot' || a.file_url);
              const textQuestions = (task.attachments || []).filter(a => a.type === 'text_question' || (!a.file_url && a.content));

              return (
                <div
                  key={task.id}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '16px',
                    border: '1px solid rgba(220, 224, 238, 0.9)',
                    padding: '1.25rem',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.65rem', marginBottom: '0.65rem' }}>
                    <div>
                      <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'center', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                        <StatusBadge status={task.status} />
                        <SubjectBadge subject={task.subject} />
                        <PriorityBadge priority={task.priority || 'medium'} />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                          Student: {task.student_name}
                        </span>
                      </div>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                        {task.title}
                      </h4>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => onOpenDetailsModal(task)}
                      >
                        <MessageSquare size={14} />
                        <span>Answer & Guide</span>
                      </button>
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => onStatusChange(task, 'done', 'Verified and completed by Tutor Axis')}
                      >
                        <CheckCircle2 size={14} />
                        <span>Verify & Done</span>
                      </button>
                    </div>
                  </div>

                  {/* Student Question Callouts */}
                  {textQuestions.map(q => (
                    <div key={q.id} style={{
                      background: 'var(--pastel-pink)',
                      borderLeft: '3px solid var(--pastel-pink-text)',
                      padding: '0.65rem 0.9rem',
                      borderRadius: '0 8px 8px 0',
                      fontSize: '0.85rem',
                      color: 'var(--text-main)',
                      marginTop: '0.5rem'
                    }}>
                      <strong style={{ color: 'var(--pastel-pink-text)' }}>Student Question:</strong> "{q.content}"
                    </div>
                  ))}

                  {/* Screenshots gallery */}
                  {screenshots.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                      {screenshots.map(s => {
                        const imageSrc = resolveAttachmentUrl(s.file_url);

                        return (
                          <div
                            key={s.id}
                            onClick={() => onOpenPreviewImage(imageSrc)}
                            style={{
                              width: '110px',
                              height: '75px',
                              borderRadius: '10px',
                              overflow: 'hidden',
                              border: '1px solid rgba(0, 0, 0, 0.08)',
                              cursor: 'pointer',
                              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
                              background: '#F1F3F8'
                            }}
                            title="Click to view full screenshot"
                          >
                            <img 
                              src={imageSrc} 
                              alt="Problem screenshot" 
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                              onError={(e) => {
                                const target = e.currentTarget;
                                target.onerror = null;
                                target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='110' height='75' viewBox='0 0 110 75'%3E%3Crect width='100%25' height='100%25' fill='%23EEF0FD'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='10' font-weight='bold' fill='%236F65F1'%3E%F0%9F%93%B7 View Problem%3C/text%3E%3C/svg%3E";
                              }}
                            />
                          </div>
                        );
                      })}

                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Active & Completed Tasks */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
            Curriculum & Study Schedule ({tasks.length})
          </h3>
          <button className="btn btn-secondary btn-sm" onClick={onOpenNewTaskModal}>
            <Sparkles size={14} color="var(--primary)" />
            <span>Assign New Task</span>
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {(updateRaisedTasks.length === 0 ? tasks : otherTasks).map((task) => (
            <div
              key={task.id}
              className="pastel-card"
              style={{
                padding: '1.5rem',
                border: '1px solid rgba(220, 224, 238, 0.8)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.85rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.45rem' }}>
                    <StatusBadge status={task.status} />
                    <SubjectBadge subject={task.subject} />
                    <PriorityBadge priority={task.priority || 'medium'} />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Student: {task.student_name}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                    {task.title}
                  </h3>
                </div>

                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => onOpenDetailsModal(task)}
                >
                  <History size={14} />
                  <span>Audit ({task.comments?.length || 0})</span>
                </button>
              </div>

              {task.description && (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.885rem', marginBottom: '1.15rem' }}>
                  {task.description}
                </p>
              )}

              {/* Timeline Stepper */}
              <div style={{
                background: '#F8F9FD',
                borderRadius: '16px',
                padding: '0.75rem 1rem',
                marginBottom: '1.15rem',
                border: '1px solid #ECEFF6'
              }}>
                <TimelineStepper
                  currentStatus={task.status}
                  onStatusChange={(newStatus) => onStatusChange(task, newStatus)}
                  userRole="tutor"
                />
              </div>

              {/* Tutor Actions */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem',
                paddingTop: '0.85rem',
                borderTop: '1px solid #ECEFF6'
              }}>
                <div style={{ display: 'flex', gap: '0.55rem', flexWrap: 'wrap' }}>
                  {task.status !== 'done' ? (
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => onStatusChange(task, 'done', 'Verified and completed by Tutor Axis')}
                    >
                      <CheckCircle2 size={14} />
                      <span>Verify & Complete</span>
                    </button>
                  ) : (
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => onStatusChange(task, 'ongoing', 'Re-opened by tutor for further practice')}
                    >
                      <RotateCcw size={14} />
                      <span>Re-open Task</span>
                    </button>
                  )}

                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => onOpenDetailsModal(task)}
                  >
                    <MessageSquare size={14} />
                    <span>Provide Feedback</span>
                  </button>
                </div>

                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                  Assigned by: {task.tutor_name}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default TutorDashboard;
