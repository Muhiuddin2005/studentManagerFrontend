import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { Image as ImageIcon, Send, Upload, Trash2, Clipboard } from 'lucide-react';
import { Task, Role, AttachmentSubmitData } from '../types';

interface AttachmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onSubmit: (data: AttachmentSubmitData) => Promise<void>;
  uploaderRole?: Role;
}

export const AttachmentModal: React.FC<AttachmentModalProps> = ({ 
  isOpen, 
  onClose, 
  task, 
  onSubmit, 
  uploaderRole = 'student' 
}) => {
  const [questionText, setQuestionText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [questionCategory, setQuestionCategory] = useState('Stuck on step');
  const [autoRaiseUpdate, setAutoRaiseUpdate] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Support pasting image directly from clipboard (e.g. Win + Shift + S snippet)
  useEffect(() => {
    if (!isOpen) return;

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            setFile(blob);
            setPreviewUrl(URL.createObjectURL(blob));
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen]);

  if (!task) return null;

  function handleFileSelect(selectedFile?: File) {
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }

  function handleClearFile() {
    setFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!task) return;
    if (!questionText.trim() && !file) {
      alert('Please provide a question explanation or attach a problem screenshot.');
      return;
    }

    try {
      setSubmitting(true);
      const combinedText = `[${questionCategory}] ${questionText.trim()}`;
      await onSubmit({
        taskId: task.id,
        questionText: combinedText,
        file,
        autoRaiseUpdate,
        uploaderRole
      });
      // reset
      setQuestionText('');
      handleClearFile();
      onClose();
    } catch (err: any) {
      alert(`Submission error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Attach Question & Problem Screenshot"
      maxWidth="620px"
    >
      <form onSubmit={handleSubmit}>
        {/* Task banner in soft lilac */}
        <div style={{
          background: 'var(--pastel-lilac)',
          border: '1px solid var(--pastel-lilac-border)',
          borderRadius: '16px',
          padding: '0.85rem 1rem',
          marginBottom: '1.25rem'
        }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.2rem' }}>
            Attaching question to task:
          </div>
          <div style={{ color: 'var(--text-main)', fontWeight: 800, fontSize: '0.95rem' }}>
            {task.title}
          </div>
        </div>

        {/* Question Category */}
        <div className="form-group">
          <label className="form-label">Question Category</label>
          <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
            {['Stuck on step', 'Formula derivation', 'Homework check', 'Concept clarification'].map((cat) => (
              <button
                type="button"
                key={cat}
                onClick={() => setQuestionCategory(cat)}
                style={{
                  background: questionCategory === cat ? 'var(--primary)' : '#F1F3F8',
                  color: questionCategory === cat ? '#FFFFFF' : 'var(--text-muted)',
                  border: `1px solid ${questionCategory === cat ? 'var(--primary)' : '#E2E6F0'}`,
                  borderRadius: '999px',
                  padding: '0.35rem 0.85rem',
                  fontSize: '0.785rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Question Text */}
        <div className="form-group">
          <label className="form-label">Question Details (Input Text)</label>
          <textarea
            className="form-textarea"
            rows={3}
            placeholder="Type your question or explain where you are stuck in your problem..."
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
          />
        </div>

        {/* Screenshot Upload / Drag & Drop / Clipboard Paste */}
        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Problem Screenshot</span>
            <span style={{ color: 'var(--primary)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
              <Clipboard size={12} /> Press Ctrl+V to paste screenshot
            </span>
          </label>

          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            style={{
              border: `2px dashed ${isDragging ? 'var(--primary)' : 'var(--pastel-lilac-border)'}`,
              borderRadius: '16px',
              padding: '1.5rem',
              textAlign: 'center',
              background: isDragging ? '#E4E7FC' : 'var(--pastel-lilac)',
              transition: 'all 0.2s',
              cursor: 'pointer'
            }}
          >
            <input
              type="file"
              id="filePicker"
              accept="image/*,application/pdf"
              onChange={(e) => handleFileSelect(e.target.files?.[0])}
              style={{ display: 'none' }}
            />

            {previewUrl ? (
              <div>
                <img
                  src={previewUrl}
                  alt="Screenshot preview"
                  style={{
                    maxHeight: '180px',
                    maxWidth: '100%',
                    borderRadius: '12px',
                    objectFit: 'contain',
                    border: '1px solid rgba(0,0,0,0.08)',
                    marginBottom: '0.75rem'
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
                  <label htmlFor="filePicker" className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                    <Upload size={13} />
                    <span>Change Image</span>
                  </label>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={handleClearFile}
                    style={{ color: 'var(--pastel-pink-text)' }}
                  >
                    <Trash2 size={13} />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            ) : (
              <label htmlFor="filePicker" style={{ cursor: 'pointer', display: 'block' }}>
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  background: '#FFFFFF',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 0.75rem',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
                }}>
                  <ImageIcon size={22} />
                </div>
                <p style={{ color: 'var(--text-main)', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.2rem' }}>
                  Drop problem screenshot here, browse, or press Ctrl+V
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: 0 }}>
                  Supports PNG, JPG, WebP, PDF (Max 10MB)
                </p>
              </label>
            )}
          </div>
        </div>

        {/* Status transition to "update raised" */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          background: 'var(--pastel-pink)',
          border: '1px solid var(--pastel-pink-border)',
          padding: '0.75rem 1rem',
          borderRadius: '14px',
          marginBottom: '1.5rem'
        }}>
          <input
            type="checkbox"
            id="autoRaise"
            checked={autoRaiseUpdate}
            onChange={(e) => setAutoRaiseUpdate(e.target.checked)}
            style={{ width: '18px', height: '18px', accentColor: 'var(--pastel-pink-text)', cursor: 'pointer' }}
          />
          <label htmlFor="autoRaise" style={{ fontSize: '0.825rem', color: 'var(--pastel-pink-text)', fontWeight: 700, cursor: 'pointer' }}>
            Set status to "Update Raised" (Sends high-priority alert to Tutor Axis)
          </label>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
          >
            <Send size={14} />
            <span>{submitting ? 'Submitting...' : 'Submit Question & Screenshot'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AttachmentModal;
