import { 
  Task, 
  TaskStatus, 
  Role, 
  ServerStatus,
  User,
  RegisterInput,
  VerifyInput,
  LoginStepResult,
  AuthSuccessResult
} from '../types';

const rawBaseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').trim().replace(/\/+$/, '');
const API_BASE_URL = rawBaseUrl.endsWith('/api') ? rawBaseUrl : `${rawBaseUrl}/api`;

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

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Request failed with status ${response.status}`);
  }
  return response.json();
}

export async function checkHealth(): Promise<ServerStatus> {
  const res = await fetch(`${API_BASE_URL}/health`);
  return handleResponse<ServerStatus>(res);
}

// ==========================================
// Authentication APIs (Password-Only Login, Resend OTP & JWT)
// ==========================================

export interface RegisterResponse {
  success: boolean;
  message: string;
  devCode?: string;
}

export interface ResendCodeResponse {
  success: boolean;
  message: string;
  devCode?: string;
}

/**
 * Validates active JWT token with backend and retrieves user profile on reload
 */
export async function getMe(): Promise<{ success: boolean; user: User }> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('No authentication token found');
  }
  const res = await fetch(`${API_BASE_URL}/auth/me`, {
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
  const res = await fetch(`${API_BASE_URL}/auth/switch-role`, {
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
  const res = await fetch(`${API_BASE_URL}/auth/demo-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role })
  });
  return handleResponse<AuthSuccessResult>(res);
}

export interface ResendCodeResponse {
  success: boolean;
  message: string;
  devCode?: string;
}

/**
 * Initiates registration with email, password, name, and role.
 * Dispatches 6-digit verification code via Resend.
 */
export async function register(input: RegisterInput): Promise<RegisterResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
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
  const res = await fetch(`${API_BASE_URL}/auth/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });
  return handleResponse<AuthSuccessResult>(res);
}

/**
 * Log in with ONLY password (or optional email).
 * Dispatches 6-digit OTP code to user's email via Resend.
 */
export async function loginWithPassword(password: string, email?: string): Promise<LoginStepResult> {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password, email })
  });
  return handleResponse<LoginStepResult>(res);
}

/**
 * Verifies the 6-digit OTP code sent via Resend for login.
 * Returns JWT token and authenticated user.
 */
export async function verifyLoginOtp(email: string, code: string): Promise<AuthSuccessResult> {
  const res = await fetch(`${API_BASE_URL}/auth/verify-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code })
  });
  return handleResponse<AuthSuccessResult>(res);
}

/**
 * Resends a fresh 6-digit OTP code via Resend
 */
export async function resendCode(email: string, type: 'login' | 'register' = 'login'): Promise<ResendCodeResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/resend-code`, {
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

export async function fetchTasks(filter: { status?: string; student_id?: string } = {}): Promise<FetchTasksResponse> {
  const params = new URLSearchParams();
  if (filter.status && filter.status !== 'all') {
    params.append('status', filter.status);
  }
  if (filter.student_id) {
    params.append('student_id', filter.student_id);
  }

  const url = `${API_BASE_URL}/tasks${params.toString() ? `?${params.toString()}` : ''}`;
  const res = await fetch(url, {
    headers: {
      ...getAuthHeaders()
    }
  });
  return handleResponse<FetchTasksResponse>(res);
}

export async function fetchTaskById(taskId: string): Promise<{ success: boolean; data: Task }> {
  const res = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
    headers: {
      ...getAuthHeaders()
    }
  });
  return handleResponse<{ success: boolean; data: Task }>(res);
}

export async function createTask(taskData: any): Promise<{ success: boolean; data: Task }> {
  const res = await fetch(`${API_BASE_URL}/tasks`, {
    method: 'POST',
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
  const res = await fetch(`${API_BASE_URL}/tasks/${taskId}/status`, {
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
  const res = await fetch(`${API_BASE_URL}/tasks/${taskId}/attachments`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders()
    },
    body: formData
  });
  return handleResponse<{ success: boolean; message: string; task: Task }>(res);
}

export async function addComment(
  taskId: string, 
  { message, author_role, author_name }: { message: string; author_role?: Role; author_name?: string }
): Promise<{ success: boolean; task: Task }> {
  const res = await fetch(`${API_BASE_URL}/tasks/${taskId}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify({ message, author_role, author_name })
  });
  return handleResponse<{ success: boolean; task: Task }>(res);
}

// ==========================================
// 7-Day Weekly Routine APIs
// ==========================================

import type { RoutineItem, CreateRoutineInput } from '../types';

export async function fetchRoutines(): Promise<{ success: boolean; count: number; data: RoutineItem[] }> {
  const res = await fetch(`${API_BASE_URL}/routines`, {
    headers: {
      ...getAuthHeaders()
    }
  });
  return handleResponse<{ success: boolean; count: number; data: RoutineItem[] }>(res);
}

export async function createRoutine(
  data: CreateRoutineInput
): Promise<{ success: boolean; data: RoutineItem }> {
  const res = await fetch(`${API_BASE_URL}/routines`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify(data)
  });
  return handleResponse<{ success: boolean; data: RoutineItem }>(res);
}

export async function deleteRoutine(
  id: string,
  actorRole: Role
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE_URL}/routines/${id}`, {
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

