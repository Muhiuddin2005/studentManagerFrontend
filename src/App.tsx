import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import StatusFilter from './components/StatusFilter';

import StudentDashboard from './components/StudentDashboard';
import TutorDashboard from './components/TutorDashboard';
import AttachmentModal from './components/AttachmentModal';
import Modal from './components/Modal';
import AuthModal from './components/AuthModal';
import WeeklyRoutine from './components/WeeklyRoutine';
import Toast from './components/Toast';
import LogoutConfirmModal from './components/LogoutConfirmModal';
import LoginPage from './components/LoginPage';
import TeacherDirectory from './components/TeacherDirectory';
import StudentRequestsModal from './components/StudentRequestsModal';
import { useAuth } from './context/AuthContext';
import { StatusBadge, SubjectBadge } from './components/Badge';
import * as api from './services/api';
import { 
  Task, 
  TaskStatus, 
  Priority, 
  NewTaskInput, 
  AttachmentSubmitData, 
  ServerStatus,
  TutorStudentPair 
} from './types';

import { 
  Plus, 
  Clock, 
  Send, 
  AlertCircle,
  Flag,
  ArrowRight,
  Trash2,
  Users,
  Bell,
  Pencil
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

  // Teacher-Student Tuple & Pairing State
  const [activeTuple, setActiveTuple] = useState<TutorStudentPair | null>(null);
  const [acceptedTuples, setAcceptedTuples] = useState<TutorStudentPair[]>([]);
  const [pendingRequests, setPendingRequests] = useState<TutorStudentPair[]>([]);
  const [isRequestsModalOpen, setIsRequestsModalOpen] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<'dashboard' | 'teachers'>('dashboard');

  // Auto show dashboard whenever an active tuple is active or selected
  const prevActiveTupleId = useRef<string | null>(null);
  useEffect(() => {
    if (activeTuple && activeTuple.status === 'accepted') {
      if (prevActiveTupleId.current !== activeTuple.id) {
        prevActiveTupleId.current = activeTuple.id;
        setCurrentView('dashboard');
      }
    }
  }, [activeTuple]);

  // Modals state
  const [isNewTaskOpen, setIsNewTaskOpen] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
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
      loadTuples();
      loadTasks();

      // Background silent polling every 6 seconds to keep student and tutor in sync
      const pollTimer = setInterval(() => {
        loadTuples();
        loadTasks(true);
      }, 6000);

      // Sync immediately when student or tutor switches back to window/tab
      const handleFocus = () => {
        loadTuples();
        loadTasks(true);
      };
      window.addEventListener('focus', handleFocus);

      return () => {
        clearInterval(pollTimer);
        window.removeEventListener('focus', handleFocus);
      };
    }
    checkHealth();
  }, [isAuthenticated, currentUser?.email, role, activeTuple?.id]);

  async function checkHealth() {
    try {
      const status = await api.checkHealth();
      setServerStatus(status);
    } catch {
      setServerStatus({ status: 'error', supabaseConnected: false });
    }
  }

  async function loadTuples() {
    if (!currentUser?.email) return;
    try {
      const res = await api.fetchMyTuples(currentUser.email, role);
      if (res.success) {
        setAcceptedTuples(res.data.accepted);
        setPendingRequests(res.data.pending);

        if (role === 'student') {
          if (res.data.accepted.length > 0) {
            setActiveTuple(prev => {
              if (prev && res.data.accepted.some(t => t.id === prev.id)) {
                return res.data.accepted.find(t => t.id === prev.id)!;
              }
              return res.data.accepted[0];
            });
            // Automatically show dashboard when tuple is active
            setCurrentView('dashboard');
          } else {
            setActiveTuple(null);
            // First time student has no teacher -> show teacher directory directly
            setCurrentView('teachers');
          }
        } else {
          // role === 'tutor'
          if (res.data.accepted.length > 0) {
            setActiveTuple(prev => {
              if (prev && res.data.accepted.some(t => t.id === prev.id)) {
                return res.data.accepted.find(t => t.id === prev.id)!;
              }
              return res.data.accepted[0];
            });
            // Automatically show dashboard when tutor has active student
            setCurrentView('dashboard');
          } else {
            setActiveTuple(null);
          }
        }
      }
    } catch (err: any) {
      console.warn('⚠️ Tuple load error:', err.message);
    }
  }

  async function loadTasks(silent = false) {
    try {
      if (!silent) setLoading(true);
      setError(null);

      // If student has no accepted tutor yet, dashboard has 0 shared tasks
      if (role === 'student' && !activeTuple) {
        setTasks([]);
        setSelectedTaskDetails(null);
        return;
      }

      const res = await api.fetchTasks({ tuple_id: activeTuple?.id || undefined });
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

  // Open create task modal
  function handleOpenCreateTask() {
    setEditingTask(null);
    setNewTaskForm({
      title: '',
      subject: 'Mathematics',
      description: '',
      priority: 'medium',
      deadline: ''
    });
    setIsNewTaskOpen(true);
  }

  // Open edit task modal (available for both Student & Tutor)
  function handleOpenEditTask(task: Task) {
    setEditingTask(task);
    setNewTaskForm({
      title: task.title,
      subject: task.subject,
      description: task.description || '',
      priority: task.priority,
      deadline: task.deadline ? task.deadline.slice(0, 10) : ''
    });
    setIsNewTaskOpen(true);
  }

  // Handle create or update task
  async function handleSaveTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTaskForm.title.trim()) return;

    if (editingTask) {
      // Edit existing task
      const isConfirmed = await confirmAction({
        title: 'Save Changes to Task?',
        text: `Update details for "${newTaskForm.title}" (${newTaskForm.subject})?`,
        confirmButtonText: 'Yes, Save Changes',
        icon: 'question',
        isSuccess: true
      });
      if (!isConfirmed) return;

      try {
        const actorName = currentUser?.name || (role === 'student' ? (activeTuple?.student_name || 'Mohona') : (activeTuple?.tutor_name || 'Tutor Axis'));
        const res = await api.updateTask(editingTask.id, {
          title: newTaskForm.title.trim(),
          description: newTaskForm.description,
          subject: newTaskForm.subject,
          priority: newTaskForm.priority,
          deadline: newTaskForm.deadline || null,
          actor_role: role,
          actor_name: actorName
        });

        if (res.success) {
          setTasks(prev => prev.map(t => t.id === editingTask.id ? res.data : t));
          setSelectedTaskDetails(prev => prev && prev.id === editingTask.id ? res.data : prev);
          setIsNewTaskOpen(false);
          setEditingTask(null);
          await showSuccessModal('Task Updated!', `"${res.data.title}" has been updated successfully.`);
        }
      } catch (err: any) {
        await showErrorModal('Update Failed', err.message);
      }
    } else {
      // Create new task (Both Student and Tutor can create)
      const isConfirmed = await confirmAction({
        title: role === 'student' ? 'Add New Study Task?' : 'Assign New Task?',
        text: `${role === 'student' ? 'Add' : 'Assign'} "${newTaskForm.title}" (${newTaskForm.subject}) to the study timeline?`,
        confirmButtonText: role === 'student' ? 'Yes, Add Task' : 'Yes, Assign Task',
        icon: 'question',
        isSuccess: true
      });
      if (!isConfirmed) return;

      try {
        const creatorName = currentUser?.name || (role === 'student' ? (activeTuple?.student_name || 'Mohona') : (activeTuple?.tutor_name || 'Tutor Axis'));
        const res = await api.createTask({
          ...newTaskForm,
          tuple_id: activeTuple?.id || null,
          creator_role: role,
          student_id: activeTuple?.student_id || (role === 'student' ? (currentUser?.id || 'student-1') : 'student-1'),
          student_name: activeTuple?.student_name || (role === 'student' ? (currentUser?.name || 'Mohona') : 'Mohona'),
          tutor_id: activeTuple?.tutor_id || (role === 'tutor' ? (currentUser?.id || 'tutor-1') : 'tutor-1'),
          tutor_name: activeTuple?.tutor_name || (role === 'tutor' ? (currentUser?.name || 'Tutor Axis') : 'Tutor Axis'),
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
          await showSuccessModal(
            role === 'student' ? 'Task Added!' : 'Task Assigned!', 
            `"${res.data.title}" has been added to the study timeline.`
          );
        }
      } catch (err: any) {
        await showErrorModal('Creation Failed', err.message);
      }
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
        pendingRequestsCount={pendingRequests.length}
        onOpenRequestsModal={() => setIsRequestsModalOpen(true)}
        onOpenTeacherDirectory={() => setCurrentView(v => v === 'teachers' ? 'dashboard' : 'teachers')}
        activeTuple={activeTuple}
        acceptedTuples={acceptedTuples}
        onSelectTuple={(pair) => {
          setActiveTuple(pair);
          setCurrentView('dashboard');
        }}
        currentView={currentView}
        onSwitchView={(v) => setCurrentView(v === 'teachers' ? 'teachers' : 'dashboard')}
      />

      <main className="main-content">
        {/* If Student/Tutor is in Teachers Directory View */}
        {currentView === 'teachers' ? (
          <TeacherDirectory
            activeTuple={activeTuple}
            onSelectTuple={(pair) => {
              setActiveTuple(pair);
              setCurrentView('dashboard');
            }}
            onRefresh={loadTuples}
          />
        ) : (
          <>
            {/* Tutor Notification Alert for Pending Student Requests */}
            {role === 'tutor' && pendingRequests.length > 0 && (
              <div 
                onClick={() => setIsRequestsModalOpen(true)}
                style={{
                  background: '#FEF3C7',
                  border: '1.5px solid #FCD34D',
                  borderRadius: '18px',
                  padding: '0.85rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1.25rem',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.25rem' }}>🔔</span>
                  <div>
                    <strong style={{ color: '#92400E', fontSize: '0.9rem' }}>
                      {pendingRequests.length} Student Connection {pendingRequests.length === 1 ? 'Request' : 'Requests'} Waiting
                    </strong>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: '#B45309' }}>
                      Click to review and accept students into your shared group.
                    </p>
                  </div>
                </div>
                <button 
                  className="btn btn-sm" 
                  style={{ background: '#F59E0B', color: '#FFF', border: 'none', borderRadius: '999px', padding: '0.4rem 0.95rem', fontWeight: 700 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsRequestsModalOpen(true);
                  }}
                >
                  Review Requests
                </button>
              </div>
            )}

            {/* Student Alert when no tutor is accepted yet */}
            {role === 'student' && !activeTuple && (
              <div style={{
                background: 'var(--pastel-lilac)',
                border: '1.5px solid var(--pastel-lilac-border)',
                borderRadius: '22px',
                padding: '1.75rem',
                marginBottom: '1.75rem',
                textAlign: 'center'
              }}>
                <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--primary)', fontWeight: 800, fontSize: '1.25rem' }}>
                  Connect with a Teacher to Activate Your Dashboard 🎓
                </h3>
                <p style={{ margin: '0 0 1.25rem 0', color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '520px', marginInline: 'auto', lineHeight: 1.5 }}>
                  You do not have an active teacher connection yet. Request a teacher from our verified tutor list to bind your accounts and start sharing homework tasks and 7-day schedules.
                </p>
                <button 
                  className="btn btn-primary"
                  onClick={() => setCurrentView('teachers')}
                  style={{ marginInline: 'auto', padding: '0.6rem 1.4rem' }}
                >
                  <span>Browse Verified Teachers →</span>
                </button>
              </div>
            )}

            {/* Mockup-Style Goal Banner */}
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
              onClick={() => handleOpenCreateTask()}
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
                  {role === 'student' 
                    ? (activeTuple ? `Bound with Teacher: ${activeTuple.tutor_name}` : 'Request a Teacher to start learning!') 
                    : (activeTuple ? `Managing Student: ${activeTuple.student_name}` : 'Awaiting student requests')}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 700 }}>
                <span className="hide-on-mobile">{role === 'tutor' ? 'Assign Task' : 'Add Study Task'}</span>
                <ArrowRight size={15} />
              </div>
            </div>

            {/* Hero Title Section */}
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
                    ? (activeTuple ? `Study timeline synchronized with ${activeTuple.tutor_name}` : 'Browse teachers and request connection')
                    : (activeTuple ? `1-on-1 Workspace with ${activeTuple.student_name} (${activeTuple.student_email})` : 'Select or accept students to manage')}
                </p>
              </div>
            </div>

            {/* 7-Day Study Routine Schedule (Filtered by active Tuple) */}
            <WeeklyRoutine
              currentRole={role}
              currentUser={currentUser}
              tupleId={activeTuple?.id || null}
            />

            {/* Status Filter Tabs */}
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
                <button className="btn btn-secondary btn-sm" onClick={() => loadTasks()} style={{ marginTop: '0.5rem' }}>
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
                onOpenNewTaskModal={handleOpenCreateTask}
                onEditTask={handleOpenEditTask}
              />
            ) : (
              <TutorDashboard
                tasks={filteredTasks}
                onStatusChange={handleStatusChange}
                onOpenDetailsModal={(t) => setSelectedTaskDetails(t)}
                onOpenPreviewImage={(url) => setPreviewImage(url)}
                onOpenNewTaskModal={handleOpenCreateTask}
                onDeleteTask={handleDeleteTask}
                onEditTask={handleOpenEditTask}
              />
            )}
          </>
        )}
      </main>

      {/* MODAL 1: Create / Edit Study Task */}
      <Modal
        isOpen={isNewTaskOpen}
        onClose={() => {
          setIsNewTaskOpen(false);
          setEditingTask(null);
        }}
        title={editingTask ? 'Edit Study Task' : (role === 'student' ? 'Add Study Task' : 'Assign Study Task')}
      >
        <form onSubmit={handleSaveTask}>
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
              onClick={() => {
                setIsNewTaskOpen(false);
                setEditingTask(null);
              }}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingTask ? <Pencil size={15} /> : <Plus size={16} />}
              <span>{editingTask ? 'Save Changes' : (role === 'student' ? 'Add Task' : 'Initialize Task')}</span>
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

              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexShrink: 0 }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    const taskToEdit = selectedTaskDetails;
                    setSelectedTaskDetails(null);
                    handleOpenEditTask(taskToEdit);
                  }}
                  title="Edit Task Details"
                >
                  <Pencil size={13} />
                  <span>Edit Task</span>
                </button>

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
                      cursor: 'pointer'
                    }}
                    onClick={() => handleDeleteTask(selectedTaskDetails)}
                    title="Permanently Delete Task & Attachments"
                  >
                    <Trash2 size={14} />
                    <span>Delete Task</span>
                  </button>
                )}
              </div>
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

      {/* MODAL 5: Student Requests Modal for Tutors */}
      <StudentRequestsModal
        isOpen={isRequestsModalOpen}
        onClose={() => setIsRequestsModalOpen(false)}
        pendingRequests={pendingRequests}
        onRefresh={loadTuples}
      />

      {/* Authentication Modal (Password-Only Login & Resend OTP Registration) */}
      <AuthModal />

      {/* Sign Out Confirmation Modal */}
      <LogoutConfirmModal />

      {/* Floating Confirmation & Status Toast */}
      <Toast toast={toast} onClose={hideToast} />
    </div>
  );
}

