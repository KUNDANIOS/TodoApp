// ============================================================
// src/store/slices/authSlice.ts
// Redux Toolkit slice for authentication state management
// ============================================================

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, User } from '../../types';
import {
  loginUser,
  registerUser,
  logoutUser,
  restoreSession,
  updateDisplayName,
} from '../../services/authService';

// ─── Initial state ────────────────────────────────────────────
const initialState: AuthState = {
  user: null,
  isLoading: false,
  error: null,
};

// ─── Async thunks ─────────────────────────────────────────────

/**
 * Register new user async action
 */
export const registerAsync = createAsyncThunk(
  'auth/register',
  async (
    { email, password, displayName }: { email: string; password: string; displayName?: string },
    { rejectWithValue },
  ) => {
    try {
      return await registerUser(email, password, displayName);
    } catch (err: any) {
      return rejectWithValue(err.message || 'Registration failed');
    }
  },
);

/**
 * Login existing user async action
 */
export const loginAsync = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      return await loginUser(email, password);
    } catch (err: any) {
      return rejectWithValue(err.message || 'Login failed');
    }
  },
);

/**
 * Logout current user
 */
export const logoutAsync = createAsyncThunk('auth/logout', async () => {
  await logoutUser();
});

/**
 * Restore session on app launch
 */
export const restoreSessionAsync = createAsyncThunk('auth/restore', async () => {
  return await restoreSession();
});

/**
 * Update user's display name
 */
export const updateDisplayNameAsync = createAsyncThunk(
  'auth/updateDisplayName',
  async ({ uid, displayName }: { uid: string; displayName: string }, { rejectWithValue }) => {
    try {
      await updateDisplayName(uid, displayName);
      return displayName;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  },
);

// ─── Slice ────────────────────────────────────────────────────
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
    },
  },
  extraReducers: builder => {
    // Register
    builder
      .addCase(registerAsync.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(registerAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Login
    builder
      .addCase(loginAsync.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Logout
    builder
      .addCase(logoutAsync.fulfilled, state => {
        state.user = null;
        state.error = null;
      });

    // Restore session
    builder
      .addCase(restoreSessionAsync.pending, state => {
        state.isLoading = true;
      })
      .addCase(restoreSessionAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(restoreSessionAsync.rejected, state => {
        state.isLoading = false;
      });

    // Update display name
    builder.addCase(updateDisplayNameAsync.fulfilled, (state, action) => {
      if (state.user) {
        state.user.displayName = action.payload;
      }
    });
  },
});

export const { clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
