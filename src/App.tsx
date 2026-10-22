import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import StatusFilter from './components/StatusFilter';

import StudentDashboard from './components/StudentDashboard';
import TutorDashboard from './components/TutorDashboard';
import AttachmentModal from './components/AttachmentModal';
import BottomNav from './components/BottomNav';
import Modal from './components/Modal';
import AuthModal from './components/AuthModal';
import WeeklyRoutine from './components/WeeklyRoutine';
import Toast from './components/Toast';
import LogoutConfirmModal from './components/LogoutConfirmModal';
import LoginPage from './components/LoginPage';
import { useAuth } from './context/AuthContext';
import { StatusBadge, SubjectBadge } from './components/Badge';
import * as api from './services/api';
import { 
  Task, 
  TaskStatus, 
  Priority, 
  NewTaskInput, 
  AttachmentSubmitData, 
  ServerStatus 
} from './types';

import { 
  Plus, 
  Clock, 
  Send, 
  AlertCircle,
  Flag,
  ArrowRight,
  Trash2
} from 'lucide-react';
import { 
  confirmDelete, 
  confirmStatusTransition, 
  confirmAction, 
  showSuccessModal, 
  showErrorModal 
} from './utils/sweetalert';

export default function App() {
  const { 
    user: currentUser, 
    role, 
    isAuthenticated,
    isInitializing,
    toast, 
    hideToast, 
    switchRoleDirectly 
  } = useAuth();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [serverStatus, setServerStatus] = useState<ServerStatus | null>(null);
  const [mobileTab, setMobileTab] = useState<string>('home');

  // Modals state
  const [isNewTaskOpen, setIsNewTaskOpen] = useState<boolean>(false);
  const [isAttachOpen, setIsAttachOpen] = useState<boolean>(false);
  const [targetTaskForAttach, setTargetTaskForAttach] = useState<Task | null>(null);
  const [selectedTaskDetails, setSelectedTaskDetails] = useState<Task | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);


  // New task form state
  const [newTaskForm, setNewTaskForm] = useState<NewTaskInput>({
    title: '',
    subject: 'Mathematics',
    description: '',
    priority: 'medium',
    deadline: ''
  });

  // Comment input state
  const [commentInput, setCommentInput] = useState<string>('');

  useEffect(() => {
    if (isAuthenticated) {
      loadTasks();

      // Background silent polling every 6 seconds to keep student and tutor in sync
      const pollTimer = setInterval(() => {
        loadTasks(true);
      }, 6000);

      // Sync immediately when student or tutor switches back to window/tab
      const handleFocus = () => {
        loadTasks(true);
      };
      window.addEventListener('focus', handleFocus);

      return () => {
        clearInterval(pollTimer);
        window.removeEventListener('focus', handleFocus);
      };
    }
    checkHealth();
  }, [isAuthenticated]);

  async function checkHealth() {
    try {
      const status = await api.checkHealth();
      setServerStatus(status);
    } catch {
      setServerStatus({ status: 'error', supabaseConnected: false });
    }
  }

  async function loadTasks(silent = false) {
    try {
      if (!silent) setLoading(true);
      setError(null);
      const res = await api.fetchTasks();
      if (res.success) {
        setTasks(res.data);
        setSelectedTaskDetails(prev => {
          if (!prev) return null;
          const fresh = res.data.find(t => t.id === prev.id);
          return fresh || prev;
        });
      }
    } catch (err: any) {
      if (!silent) setError(err.message || 'Failed to connect to backend server');
    } finally {
      if (!silent) setLoading(false);
    }
  }

  // Handle status update
  async function handleStatusChange(task: Task, newStatus: TaskStatus, note?: string) {
    const isConfirmed = await confirmStatusTransition(task.title, newStatus, role);
    if (!isConfirmed) return;

    try {
      const actorName = currentUser?.name || (role === 'student' ? 'Mohona' : 'Tutor Axis');
      const res = await api.updateTaskStatus(task.id, {
        status: newStatus,
        actor_role: role,
        note: note || `Status updated to ${newStatus} by ${actorName}`
      });

      if (res.success) {
        setTasks(prev => prev.map(t => t.id === task.id ? res.data : t));
        if (selectedTaskDetails && selectedTaskDetails.id === task.id) {
          setSelectedTaskDetails(res.data);
        }
        await showSuccessModal('Status Updated!', `"${task.title}" is now ${newStatus.toUpperCase()}.`);
      }
    } catch (err: any) {
      await showErrorModal('Update Failed', err.message);
    }
  }

  // Handle create task
  async function handleCreateTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTaskForm.title.trim()) return;

    const isConfirmed = await confirmAction({
      title: 'Assign New Task?',
      text: `Assign "${newTaskForm.title}" (${newTaskForm.subject}) to the study timeline?`,
      confirmButtonText: 'Yes, Assign Task',
      icon: 'question',
      isSuccess: true
    });
    if (!isConfirmed) return;

    try {
      const creatorName = currentUser?.name || (role === 'student' ? 'Mohona' : 'Tutor Axis');
      const res = await api.createTask({
        ...newTaskForm,
        creator_role: role,
        student_id: role === 'student' ? (currentUser?.id || 'student-1') : 'student-1',
        student_name: role === 'student' ? (currentUser?.name || 'Mohona') : 'Mohona',
        tutor_id: role === 'tutor' ? (currentUser?.id || 'tutor-1') : 'tutor-1',
        tutor_name: role === 'tutor' ? (currentUser?.name || 'Tutor Axis') : 'Tutor Axis',
        initial_note: `Task initiated by ${creatorName}`
      });

      if (res.success) {
        setTasks(prev => [res.data, ...prev]);
        setIsNewTaskOpen(false);
        setNewTaskForm({
          title: '',
          subject: 'Mathematics',
          description: '',
          priority: 'medium',
          deadline: ''
        });
        await showSuccessModal('Task Assigned!', `"${res.data.title}" has been assigned successfully.`);
      }
    } catch (err: any) {
      await showErrorModal('Creation Failed', err.message);
    }
  }

  // Handle submit attachment
  async function handleAttachmentSubmit(data: AttachmentSubmitData) {
    try {
      const formData = new FormData();
      if (data.file) {
        formData.append('file', data.file);
      }
      formData.append('question_text', data.questionText);
      formData.append('uploader_role', data.uploaderRole);
      formData.append('auto_raise_update', String(data.autoRaiseUpdate));

      const res = await api.uploadAttachment(data.taskId, formData);
      if (res.success) {
        setTasks(prev => prev.map(t => t.id === data.taskId ? res.task : t));
        if (selectedTaskDetails && selectedTaskDetails.id === data.taskId) {
          setSelectedTaskDetails(res.task);
        }
        await showSuccessModal('Uploaded!', 'Homework question / screenshot attached successfully.');
      }
    } catch (err: any) {
      await showErrorModal('Upload Failed', err.message);
    }
  }

  // Handle add comment
  async function handleAddComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentInput.trim() || !selectedTaskDetails) return;

    try {
      const authorName = currentUser?.name || (role === 'student' ? 'Mohona' : 'Tutor Axis');
      const res = await api.addComment(selectedTaskDetails.id, {
        message: commentInput,
        author_role: role,
        author_name: authorName
      });

      if (res.success) {
        setSelectedTaskDetails(res.task);
        setTasks(prev => prev.map(t => t.id === res.task.id ? res.task : t));
        setCommentInput('');
        await showSuccessModal('Feedback Added', 'Guidance note saved to problem dialogue.');
      }
    } catch (err: any) {
      await showErrorModal('Comment Failed', err.message);
    }
  }

  // Handle delete task (Tutor authority only)
  async function handleDeleteTask(task: Task) {
    if (role !== 'tutor') {
      await showErrorModal('Permission Denied', 'Only tutors have the authority to delete tasks.');
      return;
    }

    const isConfirmed = await confirmDelete(
      `Delete "${task.title}"?`,
      'This will permanently delete this task and all attached problem screenshots. This action cannot be undone.'
    );
    if (!isConfirmed) return;

    try {
      const res = await api.deleteTask(task.id, role);
      if (res.success) {
        setTasks(prev => prev.filter(t => t.id !== task.id));
        if (selectedTaskDetails && selectedTaskDetails.id === task.id) {
          setSelectedTaskDetails(null);
        }
        await showSuccessModal('Deleted!', `Task "${task.title}" and related screenshot files were permanently removed.`);
      }
    } catch (err: any) {
      await showErrorModal('Delete Failed', err.message);
    }
  }


  // Calculations for filters and counts
  const filteredTasks = tasks.filter(task => {
    const matchesFilter = activeFilter === 'all' || task.status === activeFilter;
    const matchesSearch = !searchQuery || 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const counts = {
    all: tasks.length,
    start: tasks.filter(t => t.status === 'start').length,
    ongoing: tasks.filter(t => t.status === 'ongoing').length,
    updateRaised: tasks.filter(t => t.status === 'update raised').length,
    done: tasks.filter(t => t.status === 'done').length
  };

  if (isInitializing) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-canvas)',
        gap: '1rem'
      }}>
        <div className="animate-spin" style={{ display: 'inline-block' }}>
          <Clock size={36} color="var(--primary)" />
        </div>
        <p style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.95rem' }}>
          Loading TutorFlow...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar
          onOpenNewTaskModal={() => {}}
          serverStatus={serverStatus}
        />
        <main style={{ flex: 1 }}>
          <LoginPage />
        </main>
        {toast && <Toast toast={toast} onClose={hideToast} />}
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Top Navigation with Log In / Log Out Toggle */}
      <Navbar
        onOpenNewTaskModal={() => setIsNewTaskOpen(true)}
        serverStatus={serverStatus}
      />


      <main className="main-content">
        {/* Mockup-Style Goal Banner (Inspired by "🚩 Set your weekly goal! →" in reference) */}
        <div 
          className="goal-banner"
          style={{
            background: '#FFFFFF',
            borderRadius: '999px',
            border: '1px solid rgba(220, 224, 238, 0.8)',
            padding: '0.65rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.5rem',
            boxShadow: 'var(--shadow-sm)',
            cursor: 'pointer'
          }}
          onClick={() => {
            if (role === 'tutor') {
              setIsNewTaskOpen(true);
            } else {
              document.getElementById('weekly-routine-section')?.scrollIntoView({ behavior: 'smooth' });
            }
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: 'var(--pastel-lilac)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Flag size={14} />
            </div>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              {role === 'student' ? 'Weekly Target: Follow 7-day study timetable' : 'Tutor Goal: Review pending student questions & assign lessons'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 700 }}>
            <span className="hide-on-mobile">{role === 'tutor' ? 'Assign Task' : 'View Timetable'}</span>
            <ArrowRight size={15} />
          </div>
        </div>

        {/* Hero Title Section matching Mockup */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '1.25rem',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}>
          <div>
            <h2 className="hero-title" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.03em' }}>
              {role === 'student' ? 'Start Your Journey 📖' : 'Lesson Schedule & Courses 🎓'}
            </h2>
            <p className="hero-subtitle" style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.2rem' }}>
              {role === 'student' 
                ? 'Manage your daily learning timeline and attach problem screenshots'
                : 'Address student questions, review homework proofs, and verify progress'}
            </p>
          </div>
        </div>

        {/* 7-Day Study Routine Schedule (Student can create, only tutor can delete) */}
        <WeeklyRoutine
          currentRole={role}
          currentUser={currentUser}
        />


        {/* Status Filter Tabs (Horizontal scroll on mobile) */}

        <StatusFilter
          currentFilter={activeFilter}
          onFilterChange={setActiveFilter}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          counts={counts}
        />

        {/* Main Dashboard based on active role */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
            <div className="animate-spin" style={{ display: 'inline-block', marginBottom: '1rem' }}>
              <Clock size={32} color="var(--primary)" />
            </div>
            <p>Syncing lesson timeline...</p>
          </div>
        ) : error ? (
          <div style={{
            background: 'var(--pastel-pink)',
            border: '1px solid var(--pastel-pink-border)',
            borderRadius: 'var(--radius-card)',
            padding: '1.5rem',
            textAlign: 'center',
            color: 'var(--pastel-pink-text)'
          }}>
            <AlertCircle size={24} style={{ marginBottom: '0.5rem' }} />
            <p style={{ fontWeight: 700 }}>{error}</p>
            <button className="btn btn-secondary btn-sm" onClick={loadTasks} style={{ marginTop: '0.5rem' }}>
              Retry Connection
            </button>
          </div>
        ) : role === 'student' ? (
          <StudentDashboard
            tasks={filteredTasks}
            onStatusChange={handleStatusChange}
            onOpenAttachModal={(t) => {
              setTargetTaskForAttach(t);
              setIsAttachOpen(true);
            }}
            onOpenDetailsModal={(t) => setSelectedTaskDetails(t)}
            onOpenPreviewImage={(url) => setPreviewImage(url)}
          />
        ) : (
          <TutorDashboard
            tasks={filteredTasks}
            onStatusChange={handleStatusChange}
            onOpenDetailsModal={(t) => setSelectedTaskDetails(t)}
            onOpenPreviewImage={(url) => setPreviewImage(url)}
            onOpenNewTaskModal={() => setIsNewTaskOpen(true)}
            onDeleteTask={handleDeleteTask}
          />
        )}
      </main>

      {/* Floating Bottom Navigation Bar (Matching Reference Mockup) */}
      <BottomNav
        currentTab={mobileTab}
        onSelectTab={(tab) => {
          setMobileTab(tab);
          if (tab === 'home') {
            setActiveFilter('all');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
          if (tab === 'timeline') {
            document.getElementById('weekly-routine-section')?.scrollIntoView({ behavior: 'smooth' });
          }
        }}
        currentRole={role}
        onToggleRole={(newRole) => switchRoleDirectly(newRole)}
        onOpenNewTask={() => setIsNewTaskOpen(true)}
      />



      {/* MODAL 1: Create New Study Task */}
      <Modal
        isOpen={isNewTaskOpen}
        onClose={() => setIsNewTaskOpen(false)}
        title="Create Study Task"
      >
        <form onSubmit={handleCreateTask}>
          <div className="form-group">
            <label className="form-label">Task Title *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Organic Reaction Mechanisms - SN1 vs SN2"
              value={newTaskForm.title}
              onChange={(e) => setNewTaskForm({ ...newTaskForm, title: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Subject</label>
              <select
                className="form-select"
                value={newTaskForm.subject}
                onChange={(e) => setNewTaskForm({ ...newTaskForm, subject: e.target.value })}
              >
                <option value="Mathematics">Mathematics</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="English Literature">English Literature</option>
                <option value="Biology">Biology</option>
                <option value="General">General</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Priority</label>
              <select
                className="form-select"
                value={newTaskForm.priority}
                onChange={(e) => setNewTaskForm({ ...newTaskForm, priority: e.target.value as Priority })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Target Completion Date (Optional)</label>
            <input
              type="date"
              className="form-input"
              value={newTaskForm.deadline}
              onChange={(e) => setNewTaskForm({ ...newTaskForm, deadline: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Instructions / Description</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Specify problem set numbers, theorems, or steps..."
              value={newTaskForm.description}
              onChange={(e) => setNewTaskForm({ ...newTaskForm, description: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsNewTaskOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Plus size={16} />
              <span>Initialize Task</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: Attach Question / Problem Screenshot */}
      <AttachmentModal
        isOpen={isAttachOpen}
        onClose={() => {
          setIsAttachOpen(false);
          setTargetTaskForAttach(null);
        }}
        task={targetTaskForAttach}
        onSubmit={handleAttachmentSubmit}
        uploaderRole={role}
      />

      {/* MODAL 3: Timeline Audit History & Dialogue Comments */}
      <Modal
        isOpen={Boolean(selectedTaskDetails)}
        onClose={() => setSelectedTaskDetails(null)}
        title="Timeline Audit & Tutor Guidance"
        maxWidth="680px"
      >
        {selectedTaskDetails && (
          <div>
            <div style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                  <StatusBadge status={selectedTaskDetails.status} />
                  <SubjectBadge subject={selectedTaskDetails.subject} />
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                  {selectedTaskDetails.title}
                </h3>
                {selectedTaskDetails.description && (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.35rem' }}>
                    {selectedTaskDetails.description}
                  </p>
                )}
              </div>

              {role === 'tutor' && (
                <button
                  className="btn btn-sm"
                  style={{
                    background: '#FFF0F0',
                    color: '#D32F2F',
                    border: '1px solid #FFCDD2',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontWeight: 700,
                    borderRadius: '8px',
                    padding: '0.4rem 0.75rem',
                    cursor: 'pointer',
                    flexShrink: 0
                  }}
                  onClick={() => handleDeleteTask(selectedTaskDetails)}
                  title="Permanently Delete Task & Attachments"
                >
                  <Trash2 size={14} />
                  <span>Delete Task</span>
                </button>
              )}
            </div>

            {/* Timeline Audit History */}
            <div style={{
              background: '#F8F9FD',
              borderRadius: '16px',
              padding: '1.2rem',
              marginBottom: '1.25rem',
              border: '1px solid #ECEFF6'
            }}>
              <h4 style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.85rem', letterSpacing: '0.04em', fontWeight: 800 }}>
                Timeline Audit Trail
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {selectedTaskDetails.timeline_events?.map((ev, i) => (
                  <div key={ev.id || i} style={{ display: 'flex', gap: '0.65rem', alignItems: 'flex-start' }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: 'var(--pastel-lilac)',
                      color: 'var(--primary)',
                      border: '1px solid var(--pastel-lilac-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      flexShrink: 0
                    }}>
                      {i + 1}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>
                        <span style={{ fontWeight: 800, textTransform: 'capitalize', color: 'var(--primary)' }}>
                          {ev.actor_role}:
                        </span>{' '}
                        {ev.note || `Transitioned to ${ev.to_status}`}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                        {new Date(ev.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Comments Dialogue */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              padding: '1.2rem',
              border: '1px solid #ECEFF6'
            }}>
              <h4 style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.85rem', letterSpacing: '0.04em', fontWeight: 800 }}>
                Tutor Feedback & Problem Dialogue
              </h4>

              <div style={{
                maxHeight: '180px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.65rem',
                marginBottom: '1rem'
              }}>
                {(selectedTaskDetails.comments || []).length === 0 ? (
                  <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', fontStyle: 'italic', margin: 0 }}>
                    No feedback messages yet. Start the dialogue below!
                  </p>
                ) : (
                  selectedTaskDetails.comments?.map((c) => (
                    <div
                      key={c.id}
                      style={{
                        padding: '0.75rem 1rem',
                        borderRadius: '12px',
                        background: c.author_role === 'tutor' ? 'var(--pastel-lilac)' : '#F3F4F9',
                        border: `1px solid ${c.author_role === 'tutor' ? 'var(--pastel-lilac-border)' : '#E2E6F0'}`
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                        <strong style={{ fontSize: '0.785rem', color: c.author_role === 'tutor' ? 'var(--primary)' : 'var(--text-main)' }}>
                          {c.author_name} ({c.author_role})
                        </strong>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>
                          {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', margin: 0 }}>
                        {c.message}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* Add Comment Input */}
              <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder={role === 'tutor' ? 'Provide guidance or answer student question...' : 'Ask a follow-up question...'}
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                />
                <button type="submit" className="btn btn-primary" style={{ flexShrink: 0, padding: '0.6rem 1rem' }}>
                  <Send size={15} />
                </button>
              </form>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL 4: Fullscreen Screenshot Lightbox */}
      <Modal
        isOpen={Boolean(previewImage)}
        onClose={() => setPreviewImage(null)}
        title="Problem Screenshot Inspection"
        maxWidth="850px"
      >
        {previewImage && (
          <div style={{ textAlign: 'center' }}>
            <img
              src={previewImage}
              alt="High resolution preview"
              style={{
                maxWidth: '100%',
                maxHeight: '75vh',
                borderRadius: '16px',
                border: '1px solid #ECEFF6',
                boxShadow: 'var(--shadow-card)'
              }}
            />
          </div>
        )}
      </Modal>

      {/* Authentication Modal (Password-Only Login & Resend OTP Registration) */}
      <AuthModal />

      {/* Sign Out Confirmation Modal */}
      <LogoutConfirmModal />

      {/* Floating Confirmation & Status Toast */}
      <Toast toast={toast} onClose={hideToast} />
    </div>
  );
}

