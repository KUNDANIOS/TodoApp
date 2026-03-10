// ============================================================
// src/types/index.ts
// Central type definitions for the entire application
// ============================================================

/**
 * Task priority levels with numeric values for sorting algorithm
 */
export type Priority = 'critical' | 'high' | 'medium' | 'low';

/**
 * Priority weight map used in the smart sort algorithm
 */
export const PRIORITY_WEIGHTS: Record<Priority, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

/**
 * Task category/tag options
 */
export type Category =
  | 'work'
  | 'personal'
  | 'health'
  | 'finance'
  | 'study'
  | 'shopping'
  | 'other';

/**
 * Core Task model
 */
export interface Task {
  id: string;
  title: string;
  description: string;
  createdAt: string;       // ISO date string
  updatedAt: string;       // ISO date string
  dateTime: string;        // Scheduled date/time ISO string
  deadline: string;        // Deadline ISO string
  priority: Priority;
  category: Category;
  tags: string[];
  completed: boolean;
  completedAt?: string;    // ISO date string, set when marked complete
  userId: string;          // Owner user ID
}

/**
 * Input shape when creating a new task
 */
export type CreateTaskInput = Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'userId'>;

/**
 * Input shape when updating an existing task
 */
export type UpdateTaskInput = Partial<Omit<Task, 'id' | 'createdAt' | 'userId'>>;

/**
 * Authenticated user model
 */
export interface User {
  uid: string;
  email: string;
  displayName?: string;
  createdAt: string;
}

/**
 * Auth state slice shape
 */
export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Task state slice shape
 */
export interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  filter: TaskFilter;
  sortBy: SortOption;
}

/**
 * Filter options for task list
 */
export interface TaskFilter {
  status: 'all' | 'active' | 'completed';
  category: Category | 'all';
  priority: Priority | 'all';
  searchQuery: string;
}

/**
 * Sort options
 */
export type SortOption = 'smart' | 'deadline' | 'priority' | 'createdAt' | 'title';

/**
 * Root state shape for Redux store
 */
export interface RootState {
  auth: AuthState;
  tasks: TaskState;
}

/**
 * Navigation param list for type-safe routing
 */
export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  Login: undefined;
  Register: undefined;
  Main: undefined;
  TaskDetail: { taskId: string };
  CreateTask: undefined;
  EditTask: { taskId: string };
  Profile: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Tasks: undefined;
  Calendar: undefined;
  Profile: undefined;
};
