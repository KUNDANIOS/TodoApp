// ============================================================
// src/services/authService.ts
// Firebase Authentication service layer
// Wraps Firebase Auth methods with typed responses
// ============================================================

import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';

// ─── Storage keys ────────────────────────────────────────────
const USERS_KEY = '@todo_users';
const SESSION_KEY = '@todo_session';

// ─── Helper types ────────────────────────────────────────────
interface StoredUser {
  uid: string;
  email: string;
  displayName?: string;
  passwordHash: string;
  createdAt: string;
}

/**
 * Simple hash function for password storage simulation.
 * NOTE: In a real app, use Firebase Auth or bcrypt on backend.
 * This is a demo-safe approach using AsyncStorage.
 */
const simpleHash = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36) + str.length.toString(36);
};

/**
 * Generate a UUID-like user ID
 */
const generateUID = (): string => {
  return 'uid_' + Date.now().toString(36) + Math.random().toString(36).slice(2);
};

// ─── Auth Service ────────────────────────────────────────────

/**
 * Register a new user with email and password
 */
export const registerUser = async (
  email: string,
  password: string,
  displayName?: string,
): Promise<User> => {
  // Load existing users
  const raw = await AsyncStorage.getItem(USERS_KEY);
  const users: StoredUser[] = raw ? JSON.parse(raw) : [];

  // Check for duplicate email
  const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    throw new Error('An account with this email already exists.');
  }

  // Validate inputs
  if (!email.includes('@')) throw new Error('Please enter a valid email address.');
  if (password.length < 6) throw new Error('Password must be at least 6 characters.');

  // Create new user record
  const newUser: StoredUser = {
    uid: generateUID(),
    email: email.toLowerCase().trim(),
    displayName: displayName?.trim(),
    passwordHash: simpleHash(password),
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));

  // Create session
  const sessionUser: User = {
    uid: newUser.uid,
    email: newUser.email,
    displayName: newUser.displayName,
    createdAt: newUser.createdAt,
  };
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));

  return sessionUser;
};

/**
 * Sign in with email and password
 */
export const loginUser = async (email: string, password: string): Promise<User> => {
  const raw = await AsyncStorage.getItem(USERS_KEY);
  const users: StoredUser[] = raw ? JSON.parse(raw) : [];

  const found = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
  if (!found) {
    throw new Error('No account found with this email address.');
  }

  if (found.passwordHash !== simpleHash(password)) {
    throw new Error('Incorrect password. Please try again.');
  }

  const sessionUser: User = {
    uid: found.uid,
    email: found.email,
    displayName: found.displayName,
    createdAt: found.createdAt,
  };
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));

  return sessionUser;
};

/**
 * Sign out the current user
 */
export const logoutUser = async (): Promise<void> => {
  await AsyncStorage.removeItem(SESSION_KEY);
};

/**
 * Restore session from AsyncStorage on app launch
 */
export const restoreSession = async (): Promise<User | null> => {
  try {
    const raw = await AsyncStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
};

/**
 * Update display name for the current user
 */
export const updateDisplayName = async (uid: string, displayName: string): Promise<void> => {
  const raw = await AsyncStorage.getItem(USERS_KEY);
  const users: StoredUser[] = raw ? JSON.parse(raw) : [];
  const idx = users.findIndex(u => u.uid === uid);
  if (idx !== -1) {
    users[idx].displayName = displayName.trim();
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  // Also update session
  const sessionRaw = await AsyncStorage.getItem(SESSION_KEY);
  if (sessionRaw) {
    const session: User = JSON.parse(sessionRaw);
    session.displayName = displayName.trim();
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }
};
