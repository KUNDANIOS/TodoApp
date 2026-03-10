// ============================================================
// src/utils/sortAlgorithm.ts
// Smart task sorting algorithm combining deadline urgency,
// priority weight, and creation time for optimal ordering
// ============================================================

import { Task, Priority, SortOption, TaskFilter, PRIORITY_WEIGHTS } from '../types';
import { differenceInHours, parseISO, isPast } from 'date-fns';

// ─── Urgency score helpers ────────────────────────────────────

/**
 * Calculate deadline urgency score (0–100).
 * Overdue tasks get maximum urgency.
 * Tasks due within 24h get high urgency, scaling down over 7 days.
 */
const getDeadlineUrgency = (deadline: string): number => {
  const deadlineDate = parseISO(deadline);
  const hoursUntil = differenceInHours(deadlineDate, new Date());

  if (hoursUntil < 0) return 100;          // Already overdue
  if (hoursUntil <= 24) return 90;          // Due within 24h
  if (hoursUntil <= 48) return 75;          // Due within 48h
  if (hoursUntil <= 72) return 60;          // Due within 3 days
  if (hoursUntil <= 168) return 40;         // Due within 7 days
  if (hoursUntil <= 336) return 20;         // Due within 14 days
  return 5;                                  // Far future
};

/**
 * Composite smart score for a task.
 * Score = (priorityWeight × 20) + (deadlineUrgency × 0.8)
 * This balances priority importance vs deadline urgency.
 */
const getSmartScore = (task: Task): number => {
  const priorityScore = PRIORITY_WEIGHTS[task.priority as Priority] * 20;
  const urgencyScore = getDeadlineUrgency(task.deadline) * 0.8;
  return priorityScore + urgencyScore;
};

// ─── Sort functions ───────────────────────────────────────────

/**
 * Smart sort: composite score descending (highest priority first)
 */
const sortBySmart = (a: Task, b: Task): number => {
  return getSmartScore(b) - getSmartScore(a);
};

/**
 * Sort by deadline ascending (most urgent first)
 */
const sortByDeadline = (a: Task, b: Task): number => {
  return parseISO(a.deadline).getTime() - parseISO(b.deadline).getTime();
};

/**
 * Sort by priority descending (critical → low)
 */
const sortByPriority = (a: Task, b: Task): number => {
  return PRIORITY_WEIGHTS[b.priority as Priority] - PRIORITY_WEIGHTS[a.priority as Priority];
};

/**
 * Sort by creation date descending (newest first)
 */
const sortByCreatedAt = (a: Task, b: Task): number => {
  return parseISO(b.createdAt).getTime() - parseISO(a.createdAt).getTime();
};

/**
 * Sort alphabetically by title
 */
const sortByTitle = (a: Task, b: Task): number => {
  return a.title.localeCompare(b.title);
};

// ─── Filter function ──────────────────────────────────────────

/**
 * Filter tasks based on status, category, priority, and search query
 */
export const filterTasks = (tasks: Task[], filter: TaskFilter): Task[] => {
  return tasks.filter(task => {
    // Status filter
    if (filter.status === 'active' && task.completed) return false;
    if (filter.status === 'completed' && !task.completed) return false;

    // Category filter
    if (filter.category !== 'all' && task.category !== filter.category) return false;

    // Priority filter
    if (filter.priority !== 'all' && task.priority !== filter.priority) return false;

    // Search query filter (title + description + tags)
    if (filter.searchQuery.trim()) {
      const query = filter.searchQuery.toLowerCase();
      const inTitle = task.title.toLowerCase().includes(query);
      const inDesc = task.description.toLowerCase().includes(query);
      const inTags = task.tags.some(t => t.toLowerCase().includes(query));
      if (!inTitle && !inDesc && !inTags) return false;
    }

    return true;
  });
};

// ─── Main sort function ───────────────────────────────────────

/**
 * Sort tasks by the selected sort option.
 * Completed tasks are always pushed to the bottom.
 */
export const sortTasks = (tasks: Task[], sortBy: SortOption): Task[] => {
  const active = tasks.filter(t => !t.completed);
  const completed = tasks.filter(t => t.completed);

  const sortFn: Record<SortOption, (a: Task, b: Task) => number> = {
    smart: sortBySmart,
    deadline: sortByDeadline,
    priority: sortByPriority,
    createdAt: sortByCreatedAt,
    title: sortByTitle,
  };

  const fn = sortFn[sortBy] || sortBySmart;

  return [
    ...active.sort(fn),
    ...completed.sort(sortByCreatedAt), // completed sorted by recency
  ];
};

/**
 * Check if a task is overdue (deadline passed and not completed)
 */
export const isOverdue = (task: Task): boolean => {
  if (task.completed) return false;
  return isPast(parseISO(task.deadline));
};

/**
 * Check if a task is due soon (within 24 hours)
 */
export const isDueSoon = (task: Task): boolean => {
  if (task.completed) return false;
  const hours = differenceInHours(parseISO(task.deadline), new Date());
  return hours >= 0 && hours <= 24;
};

/**
 * Get task urgency label for display
 */
export const getUrgencyLabel = (task: Task): string | null => {
  if (task.completed) return null;
  const hours = differenceInHours(parseISO(task.deadline), new Date());
  if (hours < 0) return 'Overdue';
  if (hours < 1) return 'Due in < 1 hour';
  if (hours < 24) return `Due in ${Math.floor(hours)}h`;
  if (hours < 48) return 'Due tomorrow';
  return null;
};
