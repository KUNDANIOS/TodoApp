// ============================================================
// src/store/slices/taskSlice.ts
// Redux Toolkit slice for task state management
// ============================================================

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  Task,
  TaskState,
  TaskFilter,
  SortOption,
  CreateTaskInput,
  UpdateTaskInput,
} from '../../types';
import {
  fetchTasks,
  createTask,
  updateTask,
  toggleTaskComplete,
  deleteTask,
} from '../../services/taskService';

// ─── Initial state ────────────────────────────────────────────
const initialState: TaskState = {
  tasks: [],
  isLoading: false,
  error: null,
  filter: {
    status: 'all',
    category: 'all',
    priority: 'all',
    searchQuery: '',
  },
  sortBy: 'smart',
};

// ─── Async thunks ─────────────────────────────────────────────

/** Fetch all tasks for the current user */
export const fetchTasksAsync = createAsyncThunk(
  'tasks/fetch',
  async (userId: string, { rejectWithValue }) => {
    try {
      return await fetchTasks(userId);
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  },
);

/** Create a new task */
export const createTaskAsync = createAsyncThunk(
  'tasks/create',
  async ({ input, userId }: { input: CreateTaskInput; userId: string }, { rejectWithValue }) => {
    try {
      return await createTask(input, userId);
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  },
);

/** Update a task */
export const updateTaskAsync = createAsyncThunk(
  'tasks/update',
  async ({ taskId, input }: { taskId: string; input: UpdateTaskInput }, { rejectWithValue }) => {
    try {
      return await updateTask(taskId, input);
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  },
);

/** Toggle task completion */
export const toggleTaskAsync = createAsyncThunk(
  'tasks/toggle',
  async (taskId: string, { rejectWithValue }) => {
    try {
      return await toggleTaskComplete(taskId);
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  },
);

/** Delete a task */
export const deleteTaskAsync = createAsyncThunk(
  'tasks/delete',
  async (taskId: string, { rejectWithValue }) => {
    try {
      await deleteTask(taskId);
      return taskId;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  },
);

// ─── Slice ────────────────────────────────────────────────────
const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setFilter(state, action: PayloadAction<Partial<TaskFilter>>) {
      state.filter = { ...state.filter, ...action.payload };
    },
    setSortBy(state, action: PayloadAction<SortOption>) {
      state.sortBy = action.payload;
    },
    resetFilter(state) {
      state.filter = initialState.filter;
    },
    clearTaskError(state) {
      state.error = null;
    },
    clearTasks(state) {
      // Called on logout to clear in-memory tasks
      state.tasks = [];
    },
  },
  extraReducers: builder => {
    // Fetch
    builder
      .addCase(fetchTasksAsync.pending, state => { state.isLoading = true; state.error = null; })
      .addCase(fetchTasksAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tasks = action.payload;
      })
      .addCase(fetchTasksAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create
    builder
      .addCase(createTaskAsync.pending, state => { state.isLoading = true; })
      .addCase(createTaskAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tasks.unshift(action.payload);
      })
      .addCase(createTaskAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update
    builder
      .addCase(updateTaskAsync.fulfilled, (state, action) => {
        const idx = state.tasks.findIndex(t => t.id === action.payload.id);
        if (idx !== -1) state.tasks[idx] = action.payload;
      });

    // Toggle
    builder
      .addCase(toggleTaskAsync.fulfilled, (state, action) => {
        const idx = state.tasks.findIndex(t => t.id === action.payload.id);
        if (idx !== -1) state.tasks[idx] = action.payload;
      });

    // Delete
    builder
      .addCase(deleteTaskAsync.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter(t => t.id !== action.payload);
      });
  },
});

export const { setFilter, setSortBy, resetFilter, clearTaskError, clearTasks } = taskSlice.actions;
export default taskSlice.reducer;
