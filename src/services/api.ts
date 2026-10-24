import { 
  Task, 
  TaskStatus, 
  Role, 
  ServerStatus,
  User,
  RegisterInput,
  VerifyInput,
  LoginStepResult,
  AuthSuccessResult,
  TeacherProfile,
  TutorStudentPair,
  MyTuplesResponse
} from '../types';

function getBaseUrl(): string {
  const envUrl = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '');
  if (envUrl) {
    return envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`;
  }
  if (typeof window !== 'undefined') {
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (!isLocalhost) {
      return 'https://student-manager-backend.vercel.app/api';
    }
  }
  return 'http://localhost:5000/api';
}

export const API_BASE_URL = getBaseUrl();

export function getAuthToken(): string | null {
  try {
    return localStorage.getItem('tutorflow_token');
  } catch {
    return null;
  }
}

export function getAuthHeaders(): Record<string, string> {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function apiFetch(url: string, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(url, init);
  } catch (err: any) {
    // If request fails (e.g. localhost unavailable or network switch), attempt fallback to live Vercel backend
    if (typeof window !== 'undefined' && !url.includes('student-manager-backend.vercel.app')) {
      const fallbackUrl = url.replace(/^(\/api|http:\/\/[^/]+\/api)/, 'https://student-manager-backend.vercel.app/api');
      try {
        return await fetch(fallbackUrl, init);
      } catch {
        // Fall through
      }
    }
    throw new Error('Unable to connect to the server. Please check your internet connection or try again.');
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Request failed with status ${response.status}`);
  }
  return response.json();
}

export async function checkHealth(): Promise<ServerStatus> {
  const res = await apiFetch(`${API_BASE_URL}/health`);
  return handleResponse<ServerStatus>(res);
}

// ==========================================
// Authentication APIs (Email + Password Login, Email OTP & JWT)
// ==========================================

export interface RegisterResponse {
  success: boolean;
  message: string;
}

export interface ResendCodeResponse {
  success: boolean;
  message: string;
}

/**
 * Validates active JWT token with backend and retrieves user profile on reload
 */
export async function getMe(): Promise<{ success: boolean; user: User }> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('No authentication token found');
  }
  const res = await apiFetch(`${API_BASE_URL}/auth/me`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  });
  return handleResponse<{ success: boolean; user: User }>(res);
}

/**
 * Directly switches active role between Mohona and Tutor Axis with signed JWT
 */
export async function switchRole(role: Role): Promise<AuthSuccessResult> {
  const token = getAuthToken();
  const res = await apiFetch(`${API_BASE_URL}/auth/switch-role`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify({ role })
  });
  return handleResponse<AuthSuccessResult>(res);
}

/**
 * 1-click instant demo login with signed JWT for testing
 */
export async function demoLogin(role: Role): Promise<AuthSuccessResult> {
  const res = await apiFetch(`${API_BASE_URL}/auth/demo-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role })
  });
  return handleResponse<AuthSuccessResult>(res);
}

/**
 * Initiates registration with email, password, name, and role.
 * Dispatches 6-digit verification code via email.
 */
export async function register(input: RegisterInput): Promise<RegisterResponse> {
  const res = await apiFetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });
  return handleResponse<RegisterResponse>(res);
}

/**
 * Verifies email for registration and returns JWT token & user object.
 */
export async function verifyEmail(input: VerifyInput): Promise<AuthSuccessResult> {
  const res = await apiFetch(`${API_BASE_URL}/auth/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });
  return handleResponse<AuthSuccessResult>(res);
}

/**
 * Log in with Email and Password (both mandatory).
 * Matches user credentials in database and dispatches 6-digit OTP code to user's email.
 */
export async function loginWithPassword(email: string, password: string): Promise<LoginStepResult> {
  const res = await apiFetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim(), password: password.trim() })
  });
  return handleResponse<LoginStepResult>(res);
}

/**
 * Verifies the 6-digit OTP code sent via email for login.
 * Returns JWT token and authenticated user.
 */
export async function verifyLoginOtp(email: string, code: string): Promise<AuthSuccessResult> {
  const res = await apiFetch(`${API_BASE_URL}/auth/verify-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code })
  });
  return handleResponse<AuthSuccessResult>(res);
}

/**
 * Resends a fresh 6-digit OTP code via email
 */
export async function resendCode(email: string, type: 'login' | 'register' = 'login'): Promise<ResendCodeResponse> {
  const res = await apiFetch(`${API_BASE_URL}/auth/resend-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, type })
  });
  return handleResponse<ResendCodeResponse>(res);
}

// ==========================================
// Task & Timeline APIs
// ==========================================

export interface FetchTasksResponse {
  success: boolean;
  count: number;
  data: Task[];
}

export async function fetchTasks(filter: { status?: string; student_id?: string; tuple_id?: string } = {}): Promise<FetchTasksResponse> {
  const params = new URLSearchParams();
  if (filter.status && filter.status !== 'all') {
    params.append('status', filter.status);
  }
  if (filter.student_id) {
    params.append('student_id', filter.student_id);
  }
  if (filter.tuple_id) {
    params.append('tuple_id', filter.tuple_id);
  }

  const url = `${API_BASE_URL}/tasks${params.toString() ? `?${params.toString()}` : ''}`;
  const res = await apiFetch(url, {
    headers: {
      ...getAuthHeaders()
    }
  });
  return handleResponse<FetchTasksResponse>(res);
}

export async function fetchTaskById(taskId: string): Promise<{ success: boolean; data: Task }> {
  const res = await apiFetch(`${API_BASE_URL}/tasks/${taskId}`, {
    headers: {
      ...getAuthHeaders()
    }
  });
  return handleResponse<{ success: boolean; data: Task }>(res);
}

export async function createTask(taskData: any): Promise<{ success: boolean; data: Task }> {
  const res = await apiFetch(`${API_BASE_URL}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify(taskData)
  });
  return handleResponse<{ success: boolean; data: Task }>(res);
}

export async function updateTask(
  taskId: string, 
  taskData: {
    title: string;
    description?: string;
    subject?: string;
    priority?: string;
    deadline?: string | null;
    actor_role?: Role;
    actor_name?: string;
  }
): Promise<{ success: boolean; data: Task }> {
  const res = await apiFetch(`${API_BASE_URL}/tasks/${taskId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify(taskData)
  });
  return handleResponse<{ success: boolean; data: Task }>(res);
}

export async function updateTaskStatus(
  taskId: string, 
  { status, actor_role, note, question_text }: { status: TaskStatus; actor_role?: Role; note?: string; question_text?: string }
): Promise<{ success: boolean; data: Task }> {
  const res = await apiFetch(`${API_BASE_URL}/tasks/${taskId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify({ status, actor_role, note, question_text })
  });
  return handleResponse<{ success: boolean; data: Task }>(res);
}

export async function uploadAttachment(
  taskId: string, 
  formData: FormData
): Promise<{ success: boolean; message: string; task: Task }> {
  const res = await apiFetch(`${API_BASE_URL}/tasks/${taskId}/attachments`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders()
    },
    body: formData
  });
  return handleResponse<{ success: boolean; message: string; task: Task }>(res);
}

export async function addRemarks(taskId: string, remarks: string): Promise<{ success: boolean; data: Task }> {
  const res = await apiFetch(`${API_BASE_URL}/tasks/${taskId}/remarks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify({ remarks })
  });
  return handleResponse<{ success: boolean; data: Task }>(res);
}

export async function addComment(
  taskId: string, 
  { message, author_role, author_name }: { message: string; author_role: Role; author_name: string }
): Promise<{ success: boolean; task: Task }> {
  const res = await apiFetch(`${API_BASE_URL}/tasks/${taskId}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify({ message, author_role, author_name })
  });
  return handleResponse<{ success: boolean; task: Task }>(res);
}

export async function deleteTask(taskId: string, actorRole: Role = 'tutor'): Promise<{ success: boolean; message: string }> {
  const res = await apiFetch(`${API_BASE_URL}/tasks/${taskId}?actor_role=${encodeURIComponent(actorRole)}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'X-User-Role': actorRole,
      ...getAuthHeaders()
    },
    body: JSON.stringify({ actor_role: actorRole })
  });
  return handleResponse<{ success: boolean; message: string }>(res);
}

export async function clearAllDatabaseData(): Promise<{ success: boolean; message: string; counts?: any }> {
  const res = await apiFetch(`${API_BASE_URL}/admin/clear-database`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    }
  });
  return handleResponse<{ success: boolean; message: string; counts?: any }>(res);
}

// ==========================================
// 7-Day Routine APIs
// ==========================================

export async function fetchWeeklyRoutine(tupleId?: string): Promise<{ success: boolean; data: any[] }> {
  const url = tupleId ? `${API_BASE_URL}/routines?tuple_id=${tupleId}` : `${API_BASE_URL}/routines`;
  const res = await apiFetch(url, {
    headers: {
      ...getAuthHeaders()
    }
  });
  return handleResponse<{ success: boolean; data: any[] }>(res);
}

export async function createRoutineItem(data: any): Promise<{ success: boolean; data: any }> {
  const res = await apiFetch(`${API_BASE_URL}/routines`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify(data)
  });
  return handleResponse<{ success: boolean; data: any }>(res);
}

export async function updateRoutineItem(id: string, data: any): Promise<{ success: boolean; data: any }> {
  const res = await apiFetch(`${API_BASE_URL}/routines/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify(data)
  });
  return handleResponse<{ success: boolean; data: any }>(res);
}

export async function deleteRoutineItem(id: string): Promise<{ success: boolean; message: string }> {
  const res = await apiFetch(`${API_BASE_URL}/routines/${id}`, {
    method: 'DELETE',
    headers: {
      ...getAuthHeaders()
    }
  });
  return handleResponse<{ success: boolean; message: string }>(res);
}

// Routine aliases for WeeklyRoutine component
export async function fetchRoutines(tupleId?: string): Promise<{ success: boolean; count: number; data: any[] }> {
  const url = tupleId ? `${API_BASE_URL}/routines?tuple_id=${tupleId}` : `${API_BASE_URL}/routines`;
  const res = await apiFetch(url, {
    headers: {
      ...getAuthHeaders()
    }
  });
  return handleResponse<{ success: boolean; count: number; data: any[] }>(res);
}

export async function createRoutine(data: any): Promise<{ success: boolean; data: any }> {
  const res = await apiFetch(`${API_BASE_URL}/routines`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify(data)
  });
  return handleResponse<{ success: boolean; data: any }>(res);
}

export async function deleteRoutine(id: string, actorRole: Role): Promise<{ success: boolean; message: string }> {
  const res = await apiFetch(`${API_BASE_URL}/routines/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'x-actor-role': actorRole,
      ...getAuthHeaders()
    }
  });
  return handleResponse<{ success: boolean; message: string }>(res);
}

// ==========================================
// Teacher-Student Tuple / Pairing APIs
// ==========================================

export async function fetchTeachers(studentEmail?: string): Promise<{ success: boolean; count: number; data: TeacherProfile[] }> {
  const url = studentEmail ? `${API_BASE_URL}/tuples/teachers?studentEmail=${encodeURIComponent(studentEmail)}` : `${API_BASE_URL}/tuples/teachers`;
  const res = await apiFetch(url, {
    headers: {
      ...getAuthHeaders(),
      ...(studentEmail ? { 'x-user-email': studentEmail } : {})
    }
  });
  return handleResponse<{ success: boolean; count: number; data: TeacherProfile[] }>(res);
}

export async function fetchMyTuples(email: string, role: Role): Promise<{ success: boolean; data: MyTuplesResponse }> {
  const res = await apiFetch(`${API_BASE_URL}/tuples/my-tuples?email=${encodeURIComponent(email)}&role=${role}`, {
    headers: {
      ...getAuthHeaders(),
      'x-user-email': email,
      'x-user-role': role
    }
  });
  return handleResponse<{ success: boolean; data: MyTuplesResponse }>(res);
}

export async function requestTeacherConnection(params: {
  tutor_email: string;
  tutor_name?: string;
  tutor_id?: string;
  student_email: string;
  student_name: string;
  student_id?: string;
}): Promise<{ success: boolean; message: string; data: TutorStudentPair }> {
  const res = await apiFetch(`${API_BASE_URL}/tuples/request`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify(params)
  });
  return handleResponse<{ success: boolean; message: string; data: TutorStudentPair }>(res);
}

export async function respondToTupleRequest(params: {
  tuple_id: string;
  status: 'accepted' | 'rejected';
}): Promise<{ success: boolean; message: string; data: TutorStudentPair }> {
  const res = await apiFetch(`${API_BASE_URL}/tuples/respond`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify(params)
  });
  return handleResponse<{ success: boolean; message: string; data: TutorStudentPair }>(res);
}

// ==========================================
// Attachment URL Helper
// ==========================================

export function resolveAttachmentUrl(url: string | null | undefined): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  // Local static uploads folder
  const base = API_BASE_URL.replace(/\/api\/?$/, '');
  return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
}


