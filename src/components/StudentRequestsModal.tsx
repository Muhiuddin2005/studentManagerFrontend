import React, { useState } from 'react';
import { 
  Users, 
  Check, 
  X, 
  Clock, 
  Mail, 
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { TutorStudentPair } from '../types';
import * as api from '../services/api';
import { confirmAction, showSuccessModal, showErrorModal } from '../utils/sweetalert';
import Modal from './Modal';

interface StudentRequestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  pendingRequests: TutorStudentPair[];
  onRefresh: () => void;
}

export const StudentRequestsModal: React.FC<StudentRequestsModalProps> = ({
  isOpen,
  onClose,
  pendingRequests,
  onRefresh
}) => {
  const [processingId, setProcessingId] = useState<string | null>(null);

  async function handleResponse(req: TutorStudentPair, status: 'accepted' | 'rejected') {
    const isAccept = status === 'accepted';

    const isConfirmed = await confirmAction({
      title: isAccept ? `Accept ${req.student_name}?` : `Decline request from ${req.student_name}?`,
      text: isAccept
        ? `Accepting will bind your email (${req.tutor_email}) with ${req.student_name}'s email (${req.student_email}) into a shared group. Both of you will share the same tasks and timetable dashboard.`
        : `Decline this student connection request? They will be informed by email.`,
      confirmButtonText: isAccept ? 'Yes, Accept & Bind Group' : 'Yes, Decline',
      icon: isAccept ? 'question' : 'warning',
      isSuccess: isAccept
    });

    if (!isConfirmed) return;

    try {
      setProcessingId(req.id);
      const res = await api.respondToTupleRequest({
        tuple_id: req.id,
        status
      });

      if (res.success) {
        await showSuccessModal(
          isAccept ? 'Student Accepted!' : 'Request Declined',
          isAccept
            ? `${req.student_name} is now bound into your learning group! Notification email has been sent.`
            : `Request from ${req.student_name} has been declined.`
        );
        onRefresh();
      }
    } catch (err: any) {
      await showErrorModal('Action Failed', err.message);
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Student Connection Requests"
      subtitle="Review and accept students requesting to join your 1-on-1 learning group"
    >
      <div style={{ padding: '0.5rem 0' }}>
        {pendingRequests.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '2.5rem 1rem',
            background: 'var(--bg-canvas)',
            borderRadius: '18px',
            border: '1.5px dashed rgba(220, 224, 238, 0.9)'
          }}>
            <Users size={38} color="var(--primary)" style={{ opacity: 0.45, margin: '0 auto 0.75rem auto' }} />
            <h4 style={{ margin: '0 0 0.35rem 0', fontWeight: 700, fontSize: '0.98rem', color: 'var(--text-main)' }}>
              No Pending Student Requests
            </h4>
            <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-muted)', maxWidth: '340px', marginInline: 'auto' }}>
              When registered students browse the teacher directory and request to connect with you, their requests will appear here.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{
              background: 'var(--pastel-lilac)',
              borderRadius: '14px',
              padding: '0.75rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              border: '1px solid var(--pastel-lilac-border)',
              fontSize: '0.82rem',
              color: 'var(--primary)',
              fontWeight: 600
            }}>
              <Sparkles size={16} />
              <span>You have {pendingRequests.length} pending student {pendingRequests.length === 1 ? 'request' : 'requests'} awaiting approval.</span>
            </div>

            {pendingRequests.map((req) => {
              const isProcessing = processingId === req.id;

              return (
                <div
                  key={req.id}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '18px',
                    border: '1.5px solid rgba(220, 224, 238, 0.85)',
                    padding: '1.1rem 1.25rem',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '14px',
                      background: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '1.1rem'
                    }}>
                      {req.student_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-main)' }}>
                          {req.student_name}
                        </h4>
                        <span style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          padding: '0.15rem 0.5rem',
                          borderRadius: '999px',
                          background: 'var(--pastel-peach)',
                          color: 'var(--pastel-peach-text)',
                          border: '1px solid var(--pastel-peach-border)'
                        }}>
                          Pending
                        </span>
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        fontSize: '0.78rem',
                        color: 'var(--text-muted)',
                        marginTop: '0.2rem'
                      }}>
                        <Mail size={12} />
                        <span>{req.student_email}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleResponse(req, 'accepted')}
                      disabled={isProcessing}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        padding: '0.45rem 0.95rem',
                        borderRadius: '999px',
                        background: '#10B981',
                        color: '#FFFFFF',
                        border: 'none',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        cursor: isProcessing ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                        boxShadow: '0 2px 6px rgba(16, 185, 129, 0.25)'
                      }}
                    >
                      <Check size={14} />
                      <span>Accept & Bind</span>
                    </button>

                    <button
                      onClick={() => handleResponse(req, 'rejected')}
                      disabled={isProcessing}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        padding: '0.45rem 0.85rem',
                        borderRadius: '999px',
                        background: 'var(--pastel-pink)',
                        color: 'var(--pastel-pink-text)',
                        border: '1.5px solid var(--pastel-pink-border)',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        cursor: isProcessing ? 'not-allowed' : 'pointer'
                      }}
                    >
                      <X size={14} />
                      <span>Decline</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default StudentRequestsModal;
