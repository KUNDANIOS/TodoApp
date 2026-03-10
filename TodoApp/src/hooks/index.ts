// ============================================================
// src/hooks/index.ts
// Custom typed hooks for Redux store access
// ============================================================

import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import { useMemo } from 'react';
import { AppDispatch } from '../store';
import { RootState, Task, TaskFilter, SortOption } from '../types';
import { filterTasks, sortTasks } from '../utils/sortAlgorithm';

// ─── Typed hooks ──────────────────────────────────────────────

/** Typed dispatch hook */
export const useAppDispatch = () => useDispatch<AppDispatch>();

/** Typed selector hook */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// ─── Auth hook ────────────────────────────────────────────────

/** Access auth state */
export const useAuth = () => useAppSelector(state => state.auth);

// ─── Task hooks ───────────────────────────────────────────────

/** Access raw task state */
export const useTaskState = () => useAppSelector(state => state.tasks);

/**
 * Get filtered + sorted tasks for display.
 * Memoized so re-renders only trigger when tasks/filter/sortBy change.
 */
export const useFilteredTasks = (): Task[] => {
  const { tasks, filter, sortBy } = useAppSelector(state => state.tasks);

  return useMemo(() => {
    const filtered = filterTasks(tasks, filter as TaskFilter);
    return sortTasks(filtered, sortBy as SortOption);
  }, [tasks, filter, sortBy]);
};

/** Get task stats for dashboard */
export const useTaskStats = () => {
  const tasks = useAppSelector(state => state.tasks.tasks);

  return useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const active = total - completed;
    const overdue = tasks.filter(t => {
      if (t.completed) return false;
      return new Date(t.deadline) < new Date();
    }).length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Today's tasks
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayTasks = tasks.filter(t => {
      const d = new Date(t.deadline);
      return d >= today && d < tomorrow;
    });

    return { total, completed, active, overdue, completionRate, todayTasks };
  }, [tasks]);
};

/** Get a single task by ID */
export const useTask = (taskId: string): Task | undefined => {
  return useAppSelector(state => state.tasks.tasks.find(t => t.id === taskId));
};
