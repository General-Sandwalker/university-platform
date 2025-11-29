# Frontend Architecture Documentation

## Table of Contents
1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Architecture Patterns](#architecture-patterns)
5. [Component Hierarchy](#component-hierarchy)
6. [Data Flow](#data-flow)
7. [State Management](#state-management)
8. [Routing System](#routing-system)
9. [Service Layer](#service-layer)
10. [Security](#security)
11. [Performance Optimization](#performance-optimization)
12. [Testing Strategy](#testing-strategy)

---

## Overview

The University Platform frontend is a modern, single-page application (SPA) built with React 18 and TypeScript. It follows a component-based architecture with clear separation of concerns, utilizing industry-standard patterns for state management, data fetching, and routing.

### Design Principles
- **Component-Based Architecture:** Modular, reusable UI components
- **Type Safety:** Full TypeScript coverage for compile-time error detection
- **Separation of Concerns:** Clear boundaries between UI, business logic, and data
- **Performance First:** Optimized rendering, lazy loading, and code splitting
- **Accessibility:** WCAG 2.1 compliant interfaces
- **Responsive Design:** Mobile-first, adaptive layouts

---

## Technology Stack

### Core Framework
```
React 18.3.1
├── React DOM
├── React Router 6.x
└── TypeScript 5.x
```

### State Management
```
TanStack Query (React Query) 5.x
├── Server State Management
├── Caching & Synchronization
├── Optimistic Updates
└── Background Refetching
```

### UI & Styling
```
Tailwind CSS 3.x
├── Utility-First Styling
├── Custom Design System
├── Responsive Utilities
└── Dark Mode Support

Lucide React
└── Icon Library (280+ icons)
```

### Data Visualization
```
Recharts 2.x
├── Line Charts
├── Bar Charts
├── Pie Charts
└── Area Charts
```

### Build Tools
```
Vite 5.x
├── Fast HMR (Hot Module Replacement)
├── Optimized Production Builds
├── TypeScript Support
└── CSS Processing
```

### Additional Libraries
- **React Hot Toast:** Toast notifications
- **Axios:** HTTP client
- **Zustand:** Global state management (auth)
- **Date-fns:** Date manipulation

---

## Project Structure

```
frontend/
├── public/                      # Static assets
│   └── favicon.ico
├── src/
│   ├── components/              # Reusable UI components
│   │   ├── common/              # Generic components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Card.tsx
│   │   │   └── Table.tsx
│   │   ├── layout/              # Layout components
│   │   │   ├── DashboardLayout.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   └── Footer.tsx
│   │   └── features/            # Feature-specific components
│   │       ├── timetable/
│   │       ├── messaging/
│   │       └── events/
│   │
│   ├── pages/                   # Page components (routes)
│   │   ├── auth/
│   │   │   └── LoginPage.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Profile.tsx
│   │   ├── users/
│   │   │   └── Users.tsx
│   │   ├── academic/
│   │   │   ├── DepartmentsManagement.tsx
│   │   │   ├── SpecialtiesManagement.tsx
│   │   │   ├── LevelsManagement.tsx
│   │   │   ├── GroupsManagement.tsx
│   │   │   ├── SubjectsManagement.tsx
│   │   │   └── RoomsManagement.tsx
│   │   ├── timetable/
│   │   │   └── TimetableAdvanced.tsx
│   │   ├── messages/
│   │   │   └── MessagesAdvanced.tsx
│   │   ├── events/
│   │   │   └── EventsAdvanced.tsx
│   │   ├── absences/
│   │   │   └── Absences.tsx
│   │   ├── notifications/
│   │   │   └── Notifications.tsx
│   │   └── AnalyticsAdvanced.tsx
│   │
│   ├── services/                # API service layer
│   │   ├── api.ts               # Axios instance & interceptors
│   │   ├── authService.ts       # Authentication APIs
│   │   ├── userService.ts       # User management APIs
│   │   ├── academicService.ts   # Academic entities APIs
│   │   ├── timetableService.ts  # Timetable APIs
│   │   ├── messageService.ts    # Messaging APIs
│   │   ├── eventService.ts      # Events APIs
│   │   └── analyticsService.ts  # Analytics APIs
│   │
│   ├── stores/                  # Global state stores
│   │   └── authStore.ts         # Authentication state (Zustand)
│   │
│   ├── types/                   # TypeScript type definitions
│   │   ├── user.ts
│   │   ├── academic.ts
│   │   ├── timetable.ts
│   │   └── message.ts
│   │
│   ├── lib/                     # Utility libraries
│   │   ├── utils.ts             # Helper functions
│   │   ├── constants.ts         # App constants
│   │   └── validators.ts        # Form validation
│   │
│   ├── config/                  # Configuration files
│   │   └── api.config.ts        # API endpoints
│   │
│   ├── App.tsx                  # Root component & routing
│   ├── main.tsx                 # Application entry point
│   ├── index.css                # Global styles
│   └── vite-env.d.ts            # Vite type definitions
│
├── index.html                   # HTML template
├── package.json                 # Dependencies & scripts
├── tsconfig.json                # TypeScript configuration
├── tailwind.config.js           # Tailwind CSS configuration
├── vite.config.ts               # Vite build configuration
└── README.md                    # Documentation
```

---

## Architecture Patterns

### 1. Component-Based Architecture

```
┌─────────────────────────────────────┐
│          Application Root           │
│            (App.tsx)                │
└──────────────┬──────────────────────┘
               │
       ┌───────┴────────┐
       │                │
┌──────▼──────┐  ┌─────▼─────────┐
│  Routing    │  │  Global State │
│ (Routes)    │  │  (AuthStore)  │
└──────┬──────┘  └───────────────┘
       │
┌──────▼──────────────────┐
│   Layout Components     │
│  (DashboardLayout)      │
├─────────────────────────┤
│  ┌────────┐  ┌────────┐│
│  │Sidebar │  │ Header ││
│  └────────┘  └────────┘│
│  ┌────────────────────┐│
│  │   Page Content     ││
│  │   (Feature Pages)  ││
│  └────────────────────┘│
└─────────────────────────┘
       │
┌──────▼──────────────────┐
│    Feature Pages        │
│  (Users, Timetable...)  │
├─────────────────────────┤
│  - Business Logic       │
│  - API Calls            │
│  - Local State          │
└──────┬──────────────────┘
       │
┌──────▼──────────────────┐
│  Reusable Components    │
│  (Button, Modal, Card)  │
└─────────────────────────┘
```

### 2. Layered Architecture

```
┌────────────────────────────────────────┐
│        Presentation Layer              │
│    (Components, Pages, UI Logic)       │
└────────────────┬───────────────────────┘
                 │
┌────────────────▼───────────────────────┐
│         Business Logic Layer           │
│    (Custom Hooks, State Management)    │
└────────────────┬───────────────────────┘
                 │
┌────────────────▼───────────────────────┐
│          Service Layer                 │
│    (API Services, Data Transformation) │
└────────────────┬───────────────────────┘
                 │
┌────────────────▼───────────────────────┐
│          Network Layer                 │
│    (Axios, HTTP Interceptors)          │
└────────────────────────────────────────┘
```

---

## Component Hierarchy

### Dashboard Layout Hierarchy

```
App
└── DashboardLayout
    ├── Sidebar
    │   ├── Logo
    │   ├── NavigationMenu
    │   │   ├── MenuItem (Dashboard)
    │   │   ├── MenuItem (Users)
    │   │   ├── MenuGroup (Academic)
    │   │   │   ├── MenuItem (Departments)
    │   │   │   ├── MenuItem (Specialties)
    │   │   │   ├── MenuItem (Levels)
    │   │   │   ├── MenuItem (Groups)
    │   │   │   ├── MenuItem (Subjects)
    │   │   │   └── MenuItem (Rooms)
    │   │   ├── MenuItem (Timetable)
    │   │   ├── MenuItem (Messages)
    │   │   ├── MenuItem (Events)
    │   │   └── MenuItem (Analytics)
    │   └── UserProfile
    │
    ├── Header
    │   ├── SearchBar
    │   ├── NotificationBell
    │   └── UserMenu
    │       ├── Profile Link
    │       ├── Settings Link
    │       └── Logout Button
    │
    └── MainContent
        └── <Outlet/> (Renders active page)
```

### Page Component Pattern (Example: Users)

```
Users Page
├── Header Section
│   ├── Title & Description
│   └── Action Buttons
│       └── Add User Button
│
├── Filters Section
│   ├── Search Input
│   └── Role Filter Dropdown
│
├── Data Display
│   ├── Loading Spinner (conditional)
│   ├── Empty State (conditional)
│   └── Users Table
│       ├── Table Header
│       ├── Table Body
│       │   └── User Row (mapped)
│       │       ├── Avatar & Name
│       │       ├── CIN
│       │       ├── Email
│       │       ├── Role Badge
│       │       ├── Status Badge
│       │       └── Action Buttons
│       │           ├── Edit Button
│       │           └── Delete Button
│       └── Pagination (future)
│
└── Modal (conditional)
    ├── Modal Header
    ├── Form
    │   ├── Input Fields
    │   ├── Dropdowns
    │   └── Validation
    └── Modal Footer
        ├── Cancel Button
        └── Submit Button
```

### Academic Management Pattern

All academic pages follow this consistent pattern:

```
Academic Page Component
├── State Management
│   ├── Local State (search, modal, editing)
│   └── Server State (useQuery)
│
├── Mutations
│   ├── Create Mutation
│   ├── Update Mutation
│   └── Delete Mutation
│
├── UI Structure
│   ├── Header (Title + Add Button)
│   ├── Search Bar
│   ├── Card Grid (3-4 columns)
│   │   └── Entity Card
│   │       ├── Icon Badge
│   │       ├── Name & Code
│   │       ├── Details
│   │       └── Actions (Edit/Delete)
│   └── Modal Form
│       ├── Form Fields
│       └── Submit Buttons
│
└── Event Handlers
    ├── handleSubmit
    ├── handleEdit
    └── handleDelete
```

---

## Data Flow

### Request Flow Diagram

```
┌──────────────┐
│ User Action  │ (e.g., Click "Add User")
└──────┬───────┘
       │
┌──────▼───────────┐
│  Event Handler   │ (handleSubmit)
└──────┬───────────┘
       │
┌──────▼───────────┐
│   Mutation       │ (useMutation)
└──────┬───────────┘
       │
┌──────▼───────────┐
│  Service Layer   │ (userService.create)
└──────┬───────────┘
       │
┌──────▼───────────┐
│  HTTP Request    │ (axios.post)
│  + JWT Token     │
└──────┬───────────┘
       │
┌──────▼───────────┐
│  Backend API     │
└──────┬───────────┘
       │
┌──────▼───────────┐
│   Response       │
└──────┬───────────┘
       │
┌──────▼───────────┐
│  Query Cache     │ (invalidateQueries)
│  Invalidation    │
└──────┬───────────┘
       │
┌──────▼───────────┐
│  Cache Refetch   │ (automatic)
└──────┬───────────┘
       │
┌──────▼───────────┐
│  UI Update       │ (re-render)
└──────┬───────────┘
       │
┌──────▼───────────┐
│  Toast Notif.    │ ("User created!")
└──────────────────┘
```

### Authentication Flow

```
┌────────────┐
│ Login Page │
└─────┬──────┘
      │ 1. User enters CIN & Password
      │
┌─────▼────────────┐
│ authService      │
│ .login()         │
└─────┬────────────┘
      │ 2. POST /api/auth/login
      │
┌─────▼────────────┐
│ Backend          │
│ Validates        │
└─────┬────────────┘
      │ 3. Returns JWT token + user data
      │
┌─────▼────────────┐
│ authStore        │
│ .setToken()      │
│ .setUser()       │
└─────┬────────────┘
      │ 4. Store in Zustand + localStorage
      │
┌─────▼────────────┐
│ axios interceptor│
│ adds token to    │
│ all requests     │
└─────┬────────────┘
      │ 5. Navigate to dashboard
      │
┌─────▼────────────┐
│ Protected Routes │
│ render           │
└──────────────────┘
```

### Query & Cache Flow

```
Component Mounts
      │
      ▼
┌─────────────────┐
│   useQuery      │
│   queryKey      │
└─────┬───────────┘
      │
      ├──── Check Cache ────┐
      │                     │
   ┌──▼──┐            ┌────▼──────┐
   │Cache│            │ No Cache  │
   │Hit  │            │           │
   └──┬──┘            └────┬──────┘
      │                    │
      │              ┌─────▼─────┐
      │              │API Request│
      │              └─────┬─────┘
      │                    │
      │              ┌─────▼─────┐
      │              │  Cache    │
      │              │  Update   │
      │              └─────┬─────┘
      │                    │
      └──────┬─────────────┘
             │
       ┌─────▼──────┐
       │ Component  │
       │ Re-renders │
       └────────────┘
```

---

## State Management

### 1. Server State (TanStack Query)

**Purpose:** Manage data from the backend (users, academic entities, messages, etc.)

**Implementation:**
```typescript
// Example: Fetching users
const { data: users, isLoading, error } = useQuery({
  queryKey: ['users'],
  queryFn: userService.getAll,
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
});

// Example: Creating a user
const createMutation = useMutation({
  mutationFn: userService.create,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['users'] });
    toast.success('User created successfully');
  },
  onError: (error) => {
    toast.error(error.message);
  },
});
```

**Query Keys Structure:**
```typescript
['users']                    // All users
['users', userId]            // Single user
['departments']              // All departments
['departments', deptId]      // Single department
['timetable', groupId]       // Timetable for group
['messages', 'inbox']        // Inbox messages
['events', { date }]         // Events by date
```

### 2. Global State (Zustand)

**Purpose:** Authentication state (user, token)

**Implementation:**
```typescript
// stores/authStore.ts
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  
  setUser: (user) => set({ user, isAuthenticated: true }),
  
  setToken: (token) => {
    localStorage.setItem('token', token);
    set({ token, isAuthenticated: true });
  },
  
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
```

### 3. Local Component State (useState)

**Purpose:** UI state specific to a component (modals, search, filters)

**Implementation:**
```typescript
const [searchTerm, setSearchTerm] = useState('');
const [showModal, setShowModal] = useState(false);
const [editing, setEditing] = useState<User | null>(null);
const [filterRole, setFilterRole] = useState<string>('');
```

### State Management Decision Tree

```
Need to store data?
│
├─ Is it from the backend? ────────► Use TanStack Query
│
├─ Is it global across pages? ─────► Use Zustand
│
├─ Is it specific to a component? ─► Use useState
│
└─ Is it derived from other state? ► Use useMemo
```

---

## Routing System

### Route Configuration

```typescript
// App.tsx
<Routes>
  <Route path="/login" element={<LoginPage />} />
  
  <Route path="/*" element={
    <ProtectedRoute>
      <DashboardLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/users/*" element={<Users />} />
          <Route path="/departments" element={<DepartmentsManagement />} />
          <Route path="/specialties" element={<SpecialtiesManagement />} />
          <Route path="/levels" element={<LevelsManagement />} />
          <Route path="/groups" element={<GroupsManagement />} />
          <Route path="/subjects" element={<SubjectsManagement />} />
          <Route path="/rooms" element={<RoomsManagement />} />
          <Route path="/timetable" element={<TimetableAdvanced />} />
          <Route path="/messages/*" element={<MessagesAdvanced />} />
          <Route path="/events" element={<EventsAdvanced />} />
          <Route path="/absences/*" element={<Absences />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/analytics" element={<AnalyticsAdvanced />} />
        </Routes>
      </DashboardLayout>
    </ProtectedRoute>
  } />
</Routes>
```

### Route Protection

```
User visits page
      │
      ▼
┌─────────────────┐
│ Check if        │
│ authenticated   │
└─────┬───────────┘
      │
  ┌───┴───┐
  │       │
  │       │
Yes       No
  │       │
  │       ▼
  │   ┌──────────────┐
  │   │ Redirect to  │
  │   │ /login       │
  │   └──────────────┘
  │
  ▼
┌──────────────────┐
│ Render protected │
│ content          │
└──────────────────┘
```

### Navigation Structure

```
/ (Dashboard)
├── /profile
├── /users
├── /academic
│   ├── /departments
│   ├── /specialties
│   ├── /levels
│   ├── /groups
│   ├── /subjects
│   └── /rooms
├── /timetable
├── /messages
│   ├── /inbox
│   ├── /sent
│   └── /drafts
├── /events
├── /absences
├── /notifications
└── /analytics
```

---

## Service Layer

### API Service Architecture

```
┌────────────────────────────────────┐
│         Service Layer              │
├────────────────────────────────────┤
│                                    │
│  ┌──────────────────────────────┐ │
│  │   api.ts (Axios Instance)    │ │
│  │  - Base URL                  │ │
│  │  - Request Interceptors      │ │
│  │  - Response Interceptors     │ │
│  │  - Error Handling            │ │
│  └──────────────┬───────────────┘ │
│                 │                  │
│  ┌──────────────▼───────────────┐ │
│  │     Feature Services         │ │
│  ├──────────────────────────────┤ │
│  │  authService.ts              │ │
│  │  userService.ts              │ │
│  │  academicService.ts          │ │
│  │  timetableService.ts         │ │
│  │  messageService.ts           │ │
│  │  eventService.ts             │ │
│  │  analyticsService.ts         │ │
│  └──────────────────────────────┘ │
└────────────────────────────────────┘
```

### API Instance Configuration

```typescript
// services/api.ts
import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Add JWT token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Service Pattern

```typescript
// services/userService.ts
import api from './api';

export interface User {
  id: number;
  cin: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export const userService = {
  // GET /api/users
  getAll: async (): Promise<User[]> => {
    const response = await api.get('/users');
    return response.data;
  },

  // GET /api/users/:id
  getById: async (id: number): Promise<User> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // POST /api/users
  create: async (data: CreateUserDto): Promise<User> => {
    const response = await api.post('/users', data);
    return response.data;
  },

  // PUT /api/users/:id
  update: async (id: number, data: UpdateUserDto): Promise<User> => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },

  // DELETE /api/users/:id
  delete: async (id: number): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
};
```

---

## Security

### 1. Authentication

**JWT Token Management:**
- Token stored in localStorage
- Attached to all API requests via interceptor
- Automatically cleared on logout or 401 response

**Login Flow:**
```
1. User submits CIN + password
2. Backend validates credentials
3. Backend returns JWT token + user data
4. Frontend stores token in localStorage
5. Frontend stores user data in Zustand
6. All subsequent requests include token
7. Token validated on backend for each request
```

### 2. Authorization

**Role-Based Access Control (RBAC):**
- User role stored in auth state
- UI elements conditionally rendered based on role
- Backend validates permissions on each request

**Permission Levels:**
```
Admin > Department Head > Teacher > Student
```

### 3. Input Validation

**Client-Side:**
- HTML5 validation (required, type, pattern)
- Custom validators for complex rules
- Real-time feedback on forms

**Example:**
```typescript
<input
  type="email"
  required
  pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
  minLength={5}
  maxLength={100}
/>
```

### 4. XSS Protection

- React automatically escapes content
- Avoid dangerouslySetInnerHTML
- Sanitize user-generated content
- Use Content Security Policy headers

### 5. CSRF Protection

- JWT tokens in headers (not cookies)
- SameSite cookie attributes
- Origin validation on backend

---

## Performance Optimization

### 1. Code Splitting

```typescript
// Lazy load heavy components
const AnalyticsAdvanced = lazy(() => import('./pages/AnalyticsAdvanced'));
const TimetableAdvanced = lazy(() => import('./pages/timetable/TimetableAdvanced'));

// Usage with Suspense
<Suspense fallback={<LoadingSpinner />}>
  <AnalyticsAdvanced />
</Suspense>
```

### 2. Caching Strategy

**TanStack Query Configuration:**
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,    // 5 minutes
      cacheTime: 10 * 60 * 1000,   // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
```

### 3. Optimistic Updates

```typescript
const updateMutation = useMutation({
  mutationFn: userService.update,
  onMutate: async (newData) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ['users'] });
    
    // Snapshot previous value
    const previousUsers = queryClient.getQueryData(['users']);
    
    // Optimistically update cache
    queryClient.setQueryData(['users'], (old: any) =>
      old.map((u: any) => u.id === newData.id ? { ...u, ...newData } : u)
    );
    
    return { previousUsers };
  },
  onError: (err, newData, context) => {
    // Rollback on error
    queryClient.setQueryData(['users'], context.previousUsers);
  },
});
```

### 4. Virtualization

For large lists (future enhancement):
```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

// Render only visible rows
const rowVirtualizer = useVirtualizer({
  count: users.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 50,
});
```

### 5. Image Optimization

- Use WebP format with fallbacks
- Implement lazy loading
- Responsive images with srcset
- CDN for static assets

### 6. Bundle Optimization

**Vite Configuration:**
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          'query': ['@tanstack/react-query'],
          'charts': ['recharts'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});
```

---

## Testing Strategy

### Test Pyramid

```
      ┌────────────┐
      │    E2E     │  (10%)
      │  Cypress   │
      └────────────┘
    ┌──────────────────┐
    │  Integration     │  (30%)
    │  React Testing   │
    │  Library         │
    └──────────────────┘
  ┌────────────────────────┐
  │     Unit Tests         │  (60%)
  │     Jest + Vitest      │
  └────────────────────────┘
```

### Unit Tests

**Test Services:**
```typescript
// userService.test.ts
describe('userService', () => {
  it('should fetch all users', async () => {
    const users = await userService.getAll();
    expect(users).toBeInstanceOf(Array);
  });

  it('should create a user', async () => {
    const newUser = { cin: 'TEST001', email: 'test@test.com' };
    const created = await userService.create(newUser);
    expect(created.cin).toBe('TEST001');
  });
});
```

### Integration Tests

**Test Components:**
```typescript
// Users.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import Users from './Users';

describe('Users Component', () => {
  it('renders user list', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Users />
      </QueryClientProvider>
    );
    
    expect(await screen.findByText('Users')).toBeInTheDocument();
  });

  it('opens modal on add button click', () => {
    render(<Users />);
    const addButton = screen.getByText('Add User');
    fireEvent.click(addButton);
    expect(screen.getByText('Create User')).toBeInTheDocument();
  });
});
```

### E2E Tests (Future)

```typescript
// cypress/e2e/user-management.cy.ts
describe('User Management', () => {
  it('admin can create user', () => {
    cy.login('ADMIN001', 'Admin@123456');
    cy.visit('/users');
    cy.get('[data-testid="add-user-btn"]').click();
    cy.get('[name="cin"]').type('TEST001');
    cy.get('[name="email"]').type('test@test.com');
    cy.get('[type="submit"]').click();
    cy.contains('User created successfully').should('be.visible');
  });
});
```

---

## Diagrams

### System Context Diagram

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│               University Platform                   │
│                                                     │
│  ┌─────────────────────────────────────────────┐  │
│  │                                             │  │
│  │            Frontend (React SPA)             │  │
│  │                                             │  │
│  │   ┌────────────────┐  ┌─────────────────┐  │  │
│  │   │  Components    │  │  State Mgmt     │  │  │
│  │   │  (Pages, UI)   │  │  (Query, Store) │  │  │
│  │   └────────────────┘  └─────────────────┘  │  │
│  │                                             │  │
│  │   ┌────────────────┐  ┌─────────────────┐  │  │
│  │   │  Services      │  │  Routing        │  │  │
│  │   │  (API Layer)   │  │  (React Router) │  │  │
│  │   └────────────────┘  └─────────────────┘  │  │
│  │                                             │  │
│  └──────────────────────┬──────────────────────┘  │
│                         │                         │
│                         │ HTTP/REST               │
│                         │ (JWT Auth)              │
│                         │                         │
│  ┌──────────────────────▼──────────────────────┐  │
│  │                                             │  │
│  │         Backend (Node.js/Express)           │  │
│  │                                             │  │
│  │   ┌────────────────┐  ┌─────────────────┐  │  │
│  │   │  Controllers   │  │  Services       │  │  │
│  │   │  (Endpoints)   │  │  (Logic)        │  │  │
│  │   └────────────────┘  └─────────────────┘  │  │
│  │                                             │  │
│  │   ┌────────────────┐  ┌─────────────────┐  │  │
│  │   │  TypeORM       │  │  PostgreSQL     │  │  │
│  │   │  (ORM)         │──│  (Database)     │  │  │
│  │   └────────────────┘  └─────────────────┘  │  │
│  │                                             │  │
│  └─────────────────────────────────────────────┘  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Component Data Flow

```
┌──────────────────────────────────────────────────┐
│              User Interaction                    │
└────────────────────┬─────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────┐
│         Page Component (e.g., Users.tsx)         │
│                                                  │
│  - Local state (search, filters, modal)         │
│  - Event handlers (onClick, onSubmit)           │
└─────────┬────────────────────────────────────────┘
          │
          ├───────────────────┬────────────────────┐
          │                   │                    │
          ▼                   ▼                    ▼
┌──────────────────┐ ┌───────────────┐ ┌──────────────┐
│   useQuery       │ │  useMutation  │ │  UI State    │
│   (Read Data)    │ │  (Write Data) │ │  (useState)  │
└─────────┬────────┘ └───────┬───────┘ └──────────────┘
          │                  │
          ▼                  ▼
┌──────────────────────────────────────┐
│        Service Layer                 │
│  (userService, academicService...)   │
└─────────┬────────────────────────────┘
          │
          ▼
┌──────────────────────────────────────┐
│         Axios Instance               │
│  - Add JWT token                     │
│  - Handle errors                     │
└─────────┬────────────────────────────┘
          │
          ▼
┌──────────────────────────────────────┐
│         Backend API                  │
└─────────┬────────────────────────────┘
          │
          ▼
┌──────────────────────────────────────┐
│         Response                     │
└─────────┬────────────────────────────┘
          │
          ├───────────────────┐
          │                   │
          ▼                   ▼
┌──────────────────┐ ┌───────────────────┐
│  Query Cache     │ │  Toast Notif.     │
│  Update          │ │  (Success/Error)  │
└─────────┬────────┘ └───────────────────┘
          │
          ▼
┌──────────────────────────────────────┐
│      Component Re-renders            │
│      (with updated data)             │
└──────────────────────────────────────┘
```

---

## Build & Deployment

### Development Build

```bash
npm run dev
# Starts Vite dev server on http://localhost:5173
# Features: HMR, source maps, dev tools
```

### Production Build

```bash
npm run build
# Creates optimized bundle in dist/
# Features: Minification, tree-shaking, code splitting
```

### Build Output

```
dist/
├── assets/
│   ├── index-[hash].js        # Main bundle
│   ├── vendor-[hash].js       # Vendor chunk
│   ├── query-[hash].js        # React Query chunk
│   ├── charts-[hash].js       # Recharts chunk
│   └── index-[hash].css       # Styles
├── index.html                 # Entry HTML
└── favicon.ico
```

### Environment Variables

```bash
# .env.development
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=University Platform

# .env.production
VITE_API_URL=https://api.university.edu/api
VITE_APP_NAME=University Platform
```

### Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## Best Practices

### Code Style
✓ Use TypeScript for type safety
✓ Follow React hooks rules
✓ Use functional components
✓ Keep components small (<300 lines)
✓ Extract reusable logic to custom hooks
✓ Use meaningful variable names
✓ Add JSDoc comments for complex functions

### Performance
✓ Memoize expensive computations with useMemo
✓ Prevent unnecessary re-renders with React.memo
✓ Use useCallback for event handlers in lists
✓ Lazy load routes and heavy components
✓ Optimize images (WebP, lazy loading)
✓ Implement pagination for large lists

### Security
✓ Sanitize user input
✓ Validate on both client and server
✓ Use HTTPS in production
✓ Implement proper CORS
✓ Store tokens securely
✓ Handle 401/403 responses appropriately

### Accessibility
✓ Use semantic HTML elements
✓ Add ARIA labels where needed
✓ Ensure keyboard navigation works
✓ Maintain color contrast ratios
✓ Provide text alternatives for images
✓ Test with screen readers

---

## Future Enhancements

### Planned Features
- [ ] Real-time notifications (WebSockets)
- [ ] Offline support (Service Workers)
- [ ] Advanced search with filters
- [ ] Bulk operations (import/export)
- [ ] File uploads (documents, images)
- [ ] Print-friendly views
- [ ] Multi-language support (i18n)
- [ ] Dark mode
- [ ] Mobile app (React Native)
- [ ] PWA capabilities

### Technical Debt
- [ ] Add comprehensive test coverage
- [ ] Implement error boundaries
- [ ] Add analytics tracking
- [ ] Set up monitoring (Sentry)
- [ ] Implement A/B testing
- [ ] Add performance monitoring
- [ ] Create Storybook for components
- [ ] Set up CI/CD pipelines

---

**Last Updated:** December 2024  
**Version:** 1.0.0  
**Maintainer:** Development Team
