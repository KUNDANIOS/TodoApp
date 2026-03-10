# Nexus Task OS 🚀

> A production-grade React Native To-Do application with user authentication, state management, and smart task prioritization.

---

## ✨ Features

### Core Requirements
- ✅ **User Registration** — Email/password sign-up with validation & password strength indicator
- ✅ **User Login** — Persistent sessions via AsyncStorage
- ✅ **Add Tasks** — Title, description, date-time, deadline, and priority
- ✅ **Mark Complete** — One-tap completion toggle with visual feedback
- ✅ **Delete Tasks** — Swipe or delete button with confirmation dialog
- ✅ **Task List** — Full list view with status indicators

### Bonus Features Implemented
- ✅ **Task Deadlines** — Date/time scheduling + deadline tracking
- ✅ **Smart Sort Algorithm** — Composite score using priority weight × deadline urgency
- ✅ **Task Categories** — Work, Personal, Health, Finance, Study, Shopping, Other
- ✅ **Tags** — Custom tags per task (up to 8), searchable
- ✅ **Filter System** — Filter by status, priority, category simultaneously
- ✅ **Multi-sort** — Smart / Deadline / Priority / Recent / A-Z
- ✅ **Search** — Real-time search across title, description, and tags
- ✅ **Dashboard** — Stats, completion rate, urgent/overdue tasks
- ✅ **Redux Persist** — State survives app restarts
- ✅ **TypeScript** — Fully typed throughout

---

## 🏗 Architecture

```
src/
├── types/          # Shared TypeScript types & interfaces
├── theme/          # Design system: colors, typography, spacing
├── services/       # Auth + Task services (AsyncStorage layer)
├── store/
│   └── slices/     # Redux slices: auth + tasks
├── hooks/          # Custom typed hooks (useAuth, useFilteredTasks, etc.)
├── utils/          # Smart sort algorithm, date utilities
├── components/     # Reusable UI: Button, Input, Badge, etc.
├── navigation/     # React Navigation stack + tab setup
└── screens/
    ├── SplashScreen.tsx
    ├── LoginScreen.tsx
    ├── RegisterScreen.tsx
    ├── DashboardScreen.tsx
    ├── TaskListScreen.tsx
    ├── CreateTaskScreen.tsx
    ├── EditTaskScreen.tsx
    ├── TaskDetailScreen.tsx
    └── ProfileScreen.tsx
```

---

## 🧠 Smart Sort Algorithm

The sorting algorithm (`src/utils/sortAlgorithm.ts`) computes a composite score:

```
smartScore = (priorityWeight × 20) + (deadlineUrgency × 0.8)
```

**Priority weights:**
| Priority | Weight |
|----------|--------|
| Critical | 4      |
| High     | 3      |
| Medium   | 2      |
| Low      | 1      |

**Deadline urgency (0–100):**
| Time Until Deadline | Urgency |
|---------------------|---------|
| Overdue             | 100     |
| < 24 hours          | 90      |
| < 48 hours          | 75      |
| < 3 days            | 60      |
| < 7 days            | 40      |
| < 14 days           | 20      |
| Further             | 5       |

Completed tasks are always sorted to the bottom.

---

## 🔐 Authentication

Authentication uses a local `AsyncStorage`-based system that simulates Firebase Auth behavior:
- Passwords are hashed before storage (demo-safe hash)
- Sessions persist across app restarts
- Display names can be updated from the Profile screen

**To use Firebase Auth instead:**
1. Install `@react-native-firebase/app` and `@react-native-firebase/auth`
2. Replace `src/services/authService.ts` with Firebase calls:
   ```ts
   import auth from '@react-native-firebase/auth';
   export const loginUser = (email, password) =>
     auth().signInWithEmailAndPassword(email, password);
   ```

---

## 🛠 Setup

### Prerequisites
- Node.js >= 18
- React Native CLI
- Android Studio / Xcode
- JDK 17 (Android)

### Installation

```bash
# Clone the project
cd TodoApp

# Install dependencies
npm install

# iOS only
cd ios && pod install && cd ..

# Start Metro bundler
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

### Vector Icons (required post-install)
For Android, add to `android/app/build.gradle`:
```gradle
apply from: "../../node_modules/react-native-vector-icons/fonts.gradle"
```

---

## 📦 Tech Stack

| Technology | Purpose |
|-----------|---------|
| React Native 0.73 | Mobile framework |
| TypeScript | Type safety |
| Redux Toolkit | State management |
| Redux Persist | State persistence |
| React Navigation 6 | Navigation |
| AsyncStorage | Local database |
| date-fns | Date utilities |

---

## 🎨 Design System

The app uses a deep navy/indigo dark theme (`src/theme/index.ts`):

- **Background:** `#0F0E1A` (near-black)
- **Surface:** `#1A1830`
- **Accent:** `#6366F1` (vibrant indigo)
- **Text:** `#F1F0FF`
- **Priority colors:** Red → Orange → Yellow → Green

---

## 🏆 Backend Extension (Bonus)

To add a Node.js/NestJS + MongoDB backend:

```
backend/
├── src/
│   ├── auth/          # JWT authentication
│   ├── tasks/         # Task CRUD API
│   ├── users/         # User management
│   └── app.module.ts
├── package.json
└── .env
```

**API endpoints pattern:**
```
POST   /auth/register
POST   /auth/login
GET    /tasks          # Get user tasks
POST   /tasks          # Create task
PATCH  /tasks/:id      # Update task
DELETE /tasks/:id      # Delete task
PATCH  /tasks/:id/complete  # Toggle complete
```

Replace `src/services/taskService.ts` calls with `fetch()`/`axios` to these endpoints.

---

## 📝 Notes

- State is persisted locally using `redux-persist` + `AsyncStorage`
- The date picker shows simulated behavior; integrate `@react-native-community/datetimepicker` for a native modal picker
- All screens are fully TypeScript typed
- The sort algorithm handles edge cases: overdue tasks, far-future tasks, and completed task segregation
