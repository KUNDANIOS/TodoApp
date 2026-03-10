// ============================================================
// src/services/taskService.ts
// Task CRUD operations using AsyncStorage as local database
// In a real app this would talk to a REST API / Firebase
// ============================================================

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task, CreateTaskInput, UpdateTaskInput } from '../types';

const TASKS_KEY = '@todo_tasks';

/**
 * Load all tasks from storage
 */
const loadAllTasks = async (): Promise<Task[]> => {
  const raw = await AsyncStorage.getItem(TASKS_KEY);
  return raw ? JSON.parse(raw) : [];
};

/**
 * Persist all tasks to storage
 */
const saveAllTasks = async (tasks: Task[]): Promise<void> => {
  await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
};

/**
 * Fetch all tasks belonging to a specific user
 */
export const fetchTasks = async (userId: string): Promise<Task[]> => {
  const all = await loadAllTasks();
  return all.filter(t => t.userId === userId);
};

/**
 * Create a new task
 */
export const createTask = async (
  input: CreateTaskInput,
  userId: string,
): Promise<Task> => {
  const all = await loadAllTasks();

  const newTask: Task = {
    ...input,
    id: 'task_' + Date.now().toString(36) + Math.random().toString(36).slice(2),
    userId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    completed: false,
  };

  all.push(newTask);
  await saveAllTasks(all);
  return newTask;
};

/**
 * Update an existing task by ID
 */
export const updateTask = async (
  taskId: string,
  input: UpdateTaskInput,
): Promise<Task> => {
  const all = await loadAllTasks();
  const idx = all.findIndex(t => t.id === taskId);

  if (idx === -1) throw new Error(`Task ${taskId} not found`);

  all[idx] = {
    ...all[idx],
    ...input,
    updatedAt: new Date().toISOString(),
  };

  await saveAllTasks(all);
  return all[idx];
};

/**
 * Toggle task completion status
 */
export const toggleTaskComplete = async (taskId: string): Promise<Task> => {
  const all = await loadAllTasks();
  const idx = all.findIndex(t => t.id === taskId);

  if (idx === -1) throw new Error(`Task ${taskId} not found`);

  const wasCompleted = all[idx].completed;
  all[idx] = {
    ...all[idx],
    completed: !wasCompleted,
    completedAt: !wasCompleted ? new Date().toISOString() : undefined,
    updatedAt: new Date().toISOString(),
  };

  await saveAllTasks(all);
  return all[idx];
};

/**
 * Delete a task by ID
 */
export const deleteTask = async (taskId: string): Promise<void> => {
  const all = await loadAllTasks();
  const filtered = all.filter(t => t.id !== taskId);
  await saveAllTasks(filtered);
};

/**
 * Delete all tasks belonging to a user (used on account deletion)
 */
export const deleteAllUserTasks = async (userId: string): Promise<void> => {
  const all = await loadAllTasks();
  const filtered = all.filter(t => t.userId !== userId);
  await saveAllTasks(filtered);
};
