export type TaskStatus = 'start' | 'ongoing' | 'update raised' | 'done';
export type Role = 'student' | 'tutor';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type AttachmentType = 'text_question' | 'screenshot' | 'solution' | 'feedback';

export interface Attachment {
  id: string;
  task_id: string;
  type: AttachmentType;
  content: string;
  file_url: string | null;
  file_name: string | null;
  uploader_role: Role;
  created_at: string;
}

export interface TimelineEvent {
  id: string;
  task_id: string;
  from_status: TaskStatus | null;
  to_status: TaskStatus;
  actor_role: Role;
  note: string;
  created_at: string;
}

export interface TaskComment {
  id: string;
  task_id: string;
  author_role: Role;
  author_name: string;
  message: string;
  created_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  subject: string;
  status: TaskStatus;
  student_id: string;
  student_name: string;
  tutor_id: string;
  tutor_name: string;
  priority: Priority;
  deadline: string | null;
  created_at: string;
  updated_at: string;
  attachments?: Attachment[];
  timeline_events?: TimelineEvent[];
  comments?: TaskComment[];
}

export interface NewTaskInput {
  title: string;
  subject: string;
  description: string;
  priority: Priority;
  deadline: string;
}

export interface AttachmentSubmitData {
  taskId: string;
  questionText: string;
  file: File | null;
  autoRaiseUpdate: boolean;
  uploaderRole: Role;
}

export interface ServerStatus {
  status: string;
  timestamp?: string;
  supabaseConnected?: boolean;
  environment?: string;
}

export interface StatusCounts {
  all: number;
  start: number;
  ongoing: number;
  updateRaised: number;
  done: number;
}

// User & Authentication Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role: Role;
}

export interface VerifyInput {
  email: string;
  code: string;
}

export interface LoginInput {
  password: string;
  email?: string;
}

export interface VerifyLoginInput {
  email: string;
  code: string;
}

export interface LoginStepResult {
  success: boolean;
  step: 'verify_otp' | 'completed';
  email: string;
  maskedEmail: string;
  message: string;
}

export interface AuthSuccessResult {
  success: boolean;
  message?: string;
  token: string;
  user: User;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
}


// 7-Day Weekly Routine Types
export type DayOfWeek = 'Saturday' | 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';

export interface RoutineItem {
  id: string;
  day: DayOfWeek;
  subject: string;
  time_slot?: string;
  topic?: string;
  note?: string;
  creator_role: Role;
  creator_name: string;
  created_at: string;
}

export interface CreateRoutineInput {
  day: DayOfWeek;
  subject: string;
  time_slot?: string;
  topic?: string;
  note?: string;
  creator_role?: Role;
  creator_name?: string;
}


