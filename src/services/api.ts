import { 
  Task, 
  TaskStatus, 
  Role, 
  ServerStatus,
  User,
  RegisterInput,
  VerifyInput,
  LoginInput
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
// Authentication APIs
// ==========================================

export interface RegisterResponse {
  success: boolean;
  message: string;
  devCode?: string;
}

export interface VerifyResponse {
  success: boolean;
  message: string;
  user: User;
}

export interface LoginResponse {
  success: boolean;
  user: User;
}

export interface ResendCodeResponse {
  success: boolean;
  message: string;
  devCode?: string;
}

export async function register(input: RegisterInput): Promise<RegisterResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });
  return handleResponse<RegisterResponse>(res);
}

export async function verifyEmail(input: VerifyInput): Promise<VerifyResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });
  return handleResponse<VerifyResponse>(res);
}

export async function login(input: LoginInput): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });
  return handleResponse<LoginResponse>(res);
}

export async function resendCode(email: string): Promise<ResendCodeResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/resend-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
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
  const res = await fetch(url);
  return handleResponse<FetchTasksResponse>(res);
}

export async function fetchTaskById(taskId: string): Promise<{ success: boolean; data: Task }> {
  const res = await fetch(`${API_BASE_URL}/tasks/${taskId}`);
  return handleResponse<{ success: boolean; data: Task }>(res);
}

export async function createTask(taskData: any): Promise<{ success: boolean; data: Task }> {
  const res = await fetch(`${API_BASE_URL}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
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
      'Content-Type': 'application/json'
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
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ message, author_role, author_name })
  });
  return handleResponse<{ success: boolean; task: Task }>(res);
}
