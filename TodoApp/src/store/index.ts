// ============================================================
// src/store/index.ts
// Redux store configuration with redux-persist
// ============================================================

import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import taskReducer from './slices/taskSlice';

// ─── Persist config ───────────────────────────────────────────
const rootPersistConfig = {
  key: 'root',
  version: 1,
  storage: storage,
  whitelist: ['auth'],
};

const taskPersistConfig = {
  key: 'tasks',
  version: 1,
  storage: storage,
  whitelist: ['tasks', 'filter', 'sortBy'],
};

// ─── Root reducer ─────────────────────────────────────────────
const rootReducer = combineReducers({
  auth: authReducer,
  tasks: persistReducer(taskPersistConfig, taskReducer),
});

const persistedReducer = persistReducer(rootPersistConfig, rootReducer);

// ─── Store ────────────────────────────────────────────────────
export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

// Inferred types
export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;