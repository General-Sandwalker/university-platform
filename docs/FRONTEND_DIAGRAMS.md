# Frontend Diagrams & Visual Reference

## Quick Navigation
1. [Component Tree](#component-tree)
2. [Data Flow Diagrams](#data-flow-diagrams)
3. [State Management](#state-management)
4. [API Integration](#api-integration)
5. [User Flows](#user-flows)

---

## Component Tree

### Complete Application Hierarchy

```
App.tsx
│
├─► Routes Configuration
│   │
│   ├─► Public Routes
│   │   └─► LoginPage
│   │       ├─► LoginForm
│   │       ├─► Logo
│   │       └─► Footer
│   │
│   └─► Protected Routes
│       └─► DashboardLayout
│           │
│           ├─► Sidebar
│           │   ├─► Logo
│           │   ├─► NavigationMenu
│           │   │   ├─► Dashboard (MenuItem)
│           │   │   ├─► Users (MenuItem)
│           │   │   ├─► Academic (MenuGroup)
│           │   │   │   ├─► Departments (MenuItem)
│           │   │   │   ├─► Specialties (MenuItem)
│           │   │   │   ├─► Levels (MenuItem)
│           │   │   │   ├─► Groups (MenuItem)
│           │   │   │   ├─► Subjects (MenuItem)
│           │   │   │   └─► Rooms (MenuItem)
│           │   │   ├─► Timetable (MenuItem)
│           │   │   ├─► Messages (MenuItem)
│           │   │   ├─► Events (MenuItem)
│           │   │   ├─► Absences (MenuItem)
│           │   │   ├─► Notifications (MenuItem)
│           │   │   └─► Analytics (MenuItem)
│           │   └─► UserProfile
│           │
│           ├─► Header
│           │   ├─► Breadcrumbs
│           │   ├─► SearchBar
│           │   ├─► NotificationBell
│           │   │   └─► NotificationDropdown
│           │   └─► UserMenu
│           │       ├─► ProfileLink
│           │       ├─► SettingsLink
│           │       └─► LogoutButton
│           │
│           └─► MainContent (Outlet)
│               │
│               ├─► Dashboard
│               │   ├─► WelcomeBanner
│               │   ├─► StatCards
│               │   │   ├─► UserStatsCard
│               │   │   ├─► ClassStatsCard
│               │   │   ├─► MessageStatsCard
│               │   │   └─► EventStatsCard
│               │   ├─► TodaySchedule
│               │   ├─► RecentMessages
│               │   └─► UpcomingEvents
│               │
│               ├─► Users
│               │   ├─► PageHeader
│               │   │   ├─► Title
│               │   │   └─► AddUserButton
│               │   ├─► FiltersBar
│               │   │   ├─► SearchInput
│               │   │   └─► RoleFilter
│               │   ├─► UsersTable
│               │   │   ├─► TableHeader
│               │   │   ├─► TableBody
│               │   │   │   └─► UserRow[]
│               │   │   │       ├─► Avatar
│               │   │   │       ├─► UserInfo
│               │   │   │       ├─► RoleBadge
│               │   │   │       ├─► StatusBadge
│               │   │   │       └─► ActionButtons
│               │   │   │           ├─► EditButton
│               │   │   │           └─► DeleteButton
│               │   │   └─► Pagination
│               │   └─► UserModal
│               │       ├─► ModalHeader
│               │       ├─► UserForm
│               │       │   ├─► CINInput
│               │       │   ├─► EmailInput
│               │       │   ├─► NameInputs
│               │       │   ├─► PasswordInput
│               │       │   ├─► RoleSelect
│               │       │   ├─► DepartmentSelect
│               │       │   ├─► SpecialtySelect
│               │       │   └─► GroupSelect
│               │       └─► ModalFooter
│               │
│               ├─► DepartmentsManagement
│               │   ├─► PageHeader
│               │   ├─► SearchBar
│               │   ├─► DepartmentGrid
│               │   │   └─► DepartmentCard[]
│               │   │       ├─► Icon
│               │   │       ├─► Name & Code
│               │   │       ├─► Details
│               │   │       └─► Actions
│               │   └─► DepartmentModal
│               │
│               ├─► SpecialtiesManagement
│               │   ├─► PageHeader
│               │   ├─► SearchBar
│               │   ├─► SpecialtyGrid
│               │   │   └─► SpecialtyCard[]
│               │   └─► SpecialtyModal
│               │
│               ├─► LevelsManagement
│               │   ├─► PageHeader
│               │   ├─► SearchBar
│               │   ├─► LevelGrid
│               │   │   └─► LevelCard[]
│               │   └─► LevelModal
│               │
│               ├─► GroupsManagement
│               │   ├─► PageHeader
│               │   ├─► SearchBar
│               │   ├─► GroupGrid
│               │   │   └─► GroupCard[]
│               │   └─► GroupModal
│               │
│               ├─► SubjectsManagement
│               │   ├─► PageHeader
│               │   ├─► SearchBar
│               │   ├─► SubjectGrid
│               │   │   └─► SubjectCard[]
│               │   └─► SubjectModal
│               │
│               ├─► RoomsManagement
│               │   ├─► PageHeader
│               │   ├─► SearchBar
│               │   ├─► RoomGrid
│               │   │   └─► RoomCard[]
│               │   └─► RoomModal
│               │
│               ├─► TimetableAdvanced
│               │   ├─► ViewControls
│               │   │   ├─► ViewToggle (Week/Day)
│               │   │   ├─► DatePicker
│               │   │   └─► TodayButton
│               │   ├─► TimetableGrid
│               │   │   ├─► TimeColumn
│               │   │   ├─► DayColumns[]
│               │   │   └─► SessionBlocks[]
│               │   ├─► SessionModal
│               │   └─► CreateSessionButton
│               │
│               ├─► MessagesAdvanced
│               │   ├─► MessageLayout
│               │   │   ├─► MessageSidebar
│               │   │   │   ├─► ComposeButton
│               │   │   │   ├─► TabNavigation
│               │   │   │   │   ├─► InboxTab
│               │   │   │   │   ├─► SentTab
│               │   │   │   │   └─► DraftsTab
│               │   │   │   └─► MessageList[]
│               │   │   │       └─► MessagePreview
│               │   │   ├─► MessageContent
│               │   │   │   ├─► MessageHeader
│               │   │   │   ├─► MessageBody
│               │   │   │   ├─► Attachments
│               │   │   │   └─► ReplyButton
│               │   │   └─► ComposePane
│               │   │       ├─► RecipientSelect
│               │   │       ├─► SubjectInput
│               │   │       ├─► MessageEditor
│               │   │       └─► SendButton
│               │
│               ├─► EventsAdvanced
│               │   ├─► ViewToggle
│               │   │   ├─► CalendarView
│               │   │   ├─► ListView
│               │   │   └─► GridView
│               │   ├─► EventsDisplay
│               │   │   └─► EventCard[]
│               │   │       ├─► Title & Description
│               │   │       ├─► DateTime
│               │   │       ├─► Location
│               │   │       ├─► TypeBadge
│               │   │       └─► RSVPButton
│               │   └─► CreateEventModal
│               │
│               ├─► AnalyticsAdvanced
│               │   ├─► FiltersBar
│               │   │   ├─► DateRangePicker
│               │   │   ├─► DepartmentFilter
│               │   │   └─► ExportButton
│               │   ├─► StatsCards[]
│               │   ├─► Charts
│               │   │   ├─► UserDistribution (Pie)
│               │   │   ├─► AttendanceTrends (Line)
│               │   │   ├─► DepartmentComparison (Bar)
│               │   │   └─► RoomUtilization (Area)
│               │   └─► DataTable
│               │
│               └─► Profile
│                   ├─► ProfileHeader
│                   │   ├─► Avatar
│                   │   ├─► Name
│                   │   └─► Role
│                   ├─► ProfileInfo
│                   │   ├─► PersonalSection
│                   │   ├─► ContactSection
│                   │   └─► AcademicSection
│                   ├─► EditProfileModal
│                   └─► ChangePasswordModal
```

---

## Data Flow Diagrams

### 1. User Creation Flow (Detailed)

```
User clicks "Add User" button
         │
         ▼
┌─────────────────────────┐
│   setShowModal(true)    │
│   setEditing(null)      │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Modal appears with     │
│  empty form             │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  User fills in:         │
│  - CIN                  │
│  - Email                │
│  - First Name           │
│  - Last Name            │
│  - Password             │
│  - Role                 │
│  - Department (opt)     │
│  - Specialty (opt)      │
│  - Group (opt)          │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  User clicks "Create"   │
│  Form submits           │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  handleSubmit()         │
│  - Prevent default      │
│  - Extract FormData     │
│  - Create DTO object    │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  createMutation.mutate  │
│  (TanStack Query)       │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  userService.create()   │
│  (Service Layer)        │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  api.post('/users')     │
│  + JWT token in header  │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Backend validates      │
│  - Check duplicates     │
│  - Hash password        │
│  - Create in DB         │
└────────┬────────────────┘
         │
         ├─────────────┬──────────────┐
         │ Success     │ Error        │
         ▼             ▼              │
┌─────────────────┐ ┌──────────────┐│
│ Return 201      │ │ Return 400   ││
│ + user data     │ │ + error msg  ││
└────────┬────────┘ └──────┬───────┘│
         │                 │        │
         ▼                 ▼        │
┌─────────────────┐ ┌──────────────┐│
│ onSuccess()     │ │ onError()    ││
│ - Invalidate    │ │ - Show toast ││
│   ['users']     │ │   error      ││
│ - Show toast    │ └──────────────┘│
│   success       │                 │
│ - Close modal   │                 │
└────────┬────────┘                 │
         │                          │
         ▼                          │
┌─────────────────┐                 │
│ Query refetch   │                 │
│ - GET /users    │                 │
│ - Update cache  │                 │
└────────┬────────┘                 │
         │                          │
         ▼                          │
┌─────────────────┐                 │
│ Component       │◄────────────────┘
│ re-renders      │
│ with new data   │
└─────────────────┘
```

### 2. Timetable Session Display Flow

```
Component mounts
      │
      ▼
┌──────────────────────┐
│ useQuery({           │
│   queryKey:          │
│   ['timetable',      │
│    groupId]          │
│ })                   │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Check Query Cache    │
└──────┬───────────────┘
       │
   ┌───┴───┐
   │       │
Cache      No
Hit        Cache
   │       │
   │       ▼
   │ ┌─────────────────┐
   │ │ timetable       │
   │ │ Service         │
   │ │ .getByGroup()   │
   │ └────────┬────────┘
   │          │
   │          ▼
   │ ┌─────────────────┐
   │ │ GET /api/       │
   │ │ timetable?      │
   │ │ groupId=X       │
   │ └────────┬────────┘
   │          │
   │          ▼
   │ ┌─────────────────┐
   │ │ Backend queries │
   │ │ - Get sessions  │
   │ │ - Join subject  │
   │ │ - Join room     │
   │ │ - Join teacher  │
   │ └────────┬────────┘
   │          │
   │          ▼
   │ ┌─────────────────┐
   │ │ Return sessions │
   │ │ array           │
   │ └────────┬────────┘
   │          │
   │          ▼
   │ ┌─────────────────┐
   │ │ Cache data      │
   │ └────────┬────────┘
   │          │
   └──────────┘
       │
       ▼
┌──────────────────────┐
│ Component receives   │
│ sessions data        │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Group by day & time  │
│ sessions.filter()    │
│ sessions.sort()      │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Render grid:         │
│ - Time slots (rows)  │
│ - Days (columns)     │
│ - Sessions (blocks)  │
└──────────────────────┘
```

### 3. Message Send Flow

```
User clicks "Compose"
         │
         ▼
┌─────────────────────────┐
│  Compose form opens     │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Select recipient(s)    │
│  (useQuery for users)   │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Enter subject          │
│  Enter message body     │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Click "Send"           │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  sendMutation.mutate({  │
│    recipientIds: [1,2], │
│    subject: "...",      │
│    content: "..."       │
│  })                     │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  messageService.send()  │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  POST /api/messages     │
│  {                      │
│    recipientIds: [...], │
│    subject: "...",      │
│    content: "..."       │
│  }                      │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Backend:               │
│  - Validate recipients  │
│  - Create message       │
│  - Create notification  │
│  - Return created msg   │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  onSuccess()            │
│  - Invalidate queries:  │
│    ['messages','inbox'] │
│    ['messages','sent']  │
│  - Show success toast   │
│  - Close compose form   │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Queries refetch        │
│  Inbox & Sent update    │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  UI updates to show     │
│  message in "Sent"      │
└─────────────────────────┘
```

---

## State Management

### State Distribution Map

```
┌──────────────────────────────────────────────────────┐
│                  Application State                   │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌────────────────────────────────────────────────┐ │
│  │         Global State (Zustand)                 │ │
│  ├────────────────────────────────────────────────┤ │
│  │  authStore:                                    │ │
│  │  - user: User | null                           │ │
│  │  - token: string | null                        │ │
│  │  - isAuthenticated: boolean                    │ │
│  │  - setUser()                                   │ │
│  │  - setToken()                                  │ │
│  │  - logout()                                    │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  ┌────────────────────────────────────────────────┐ │
│  │       Server State (TanStack Query)            │ │
│  ├────────────────────────────────────────────────┤ │
│  │  Query Keys:                                   │ │
│  │  - ['users'] → User[]                          │ │
│  │  - ['departments'] → Department[]              │ │
│  │  - ['specialties'] → Specialty[]               │ │
│  │  - ['levels'] → Level[]                        │ │
│  │  - ['groups'] → Group[]                        │ │
│  │  - ['subjects'] → Subject[]                    │ │
│  │  - ['rooms'] → Room[]                          │ │
│  │  - ['timetable', groupId] → Session[]          │ │
│  │  - ['messages', 'inbox'] → Message[]           │ │
│  │  - ['messages', 'sent'] → Message[]            │ │
│  │  - ['events'] → Event[]                        │ │
│  │  - ['analytics'] → AnalyticsData              │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  ┌────────────────────────────────────────────────┐ │
│  │         Local Component State (useState)       │ │
│  ├────────────────────────────────────────────────┤ │
│  │  Per Component:                                │ │
│  │  - searchTerm: string                          │ │
│  │  - showModal: boolean                          │ │
│  │  - editing: Entity | null                      │ │
│  │  - filters: FilterState                        │ │
│  │  - selectedDate: Date                          │ │
│  │  - viewMode: 'week' | 'day'                    │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### Query Cache Behavior

```
Time →
───────────────────────────────────────────────────────►

T0: Component mounts
    │
    ├─► Query initiated: ['users']
    │
    ▼
T1: API request sent
    │
    ▼
T2: Response received (200ms)
    │
    ├─► Cache populated with data
    │   staleTime: 5 minutes
    │   cacheTime: 10 minutes
    │
    ▼
T3: Component renders with data
    │
    │
    │ ... 2 minutes pass ...
    │
    ▼
T4: User navigates away
    │
    ├─► Query marked as "inactive"
    │   Data still in cache
    │
    │ ... 3 minutes pass ...
    │
    ▼
T5: User returns (5min total)
    │
    ├─► Data is now "stale"
    ├─► Show cached (stale) data immediately
    ├─► Refetch in background
    │
    ▼
T6: Fresh data arrives
    │
    ├─► Cache updated
    ├─► Component re-renders with fresh data
    │
    │
    │ ... 10 minutes pass (no activity) ...
    │
    ▼
T7: Cache cleanup
    │
    └─► Data removed from cache
        (cacheTime expired)
```

---

## API Integration

### Service Architecture

```
┌────────────────────────────────────────────────────┐
│                  Services Layer                    │
├────────────────────────────────────────────────────┤
│                                                    │
│  ┌──────────────────────────────────────────────┐ │
│  │         Base API Instance (api.ts)           │ │
│  ├──────────────────────────────────────────────┤ │
│  │  axios.create({                              │ │
│  │    baseURL: VITE_API_URL,                    │ │
│  │    timeout: 10000,                           │ │
│  │  })                                          │ │
│  │                                              │ │
│  │  Request Interceptor:                        │ │
│  │    - Add Authorization header                │ │
│  │    - Add request timestamp                   │ │
│  │                                              │ │
│  │  Response Interceptor:                       │ │
│  │    - Handle 401 → logout                     │ │
│  │    - Handle 500 → error toast                │ │
│  │    - Transform data                          │ │
│  └──────────────────────────────────────────────┘ │
│                          │                         │
│         ┌────────────────┴────────────┐            │
│         │                              │            │
│  ┌──────▼─────────┐           ┌───────▼────────┐  │
│  │  Auth Service  │           │  User Service  │  │
│  ├────────────────┤           ├────────────────┤  │
│  │ - login()      │           │ - getAll()     │  │
│  │ - logout()     │           │ - getById()    │  │
│  │ - refresh()    │           │ - create()     │  │
│  └────────────────┘           │ - update()     │  │
│                               │ - delete()     │  │
│                               └────────────────┘  │
│                                                    │
│  ┌──────────────────┐         ┌──────────────────┐│
│  │ Academic Service │         │ Message Service  ││
│  ├──────────────────┤         ├──────────────────┤│
│  │ Departments:     │         │ - getInbox()     ││
│  │ - getAll()       │         │ - getSent()      ││
│  │ - create()       │         │ - send()         ││
│  │ - update()       │         │ - markRead()     ││
│  │ - delete()       │         │ - delete()       ││
│  │                  │         └──────────────────┘│
│  │ Specialties:     │                             │
│  │ - getAll()       │         ┌──────────────────┐│
│  │ - create()       │         │ Timetable Srv    ││
│  │ ...              │         ├──────────────────┤│
│  │                  │         │ - getByGroup()   ││
│  │ Levels, Groups,  │         │ - create()       ││
│  │ Subjects, Rooms  │         │ - update()       ││
│  │ (same pattern)   │         │ - delete()       ││
│  └──────────────────┘         └──────────────────┘│
│                                                    │
└────────────────────────────────────────────────────┘
```

### API Endpoint Map

```
Backend API: http://localhost:3000/api
├── /auth
│   ├── POST /login                 (Login)
│   ├── POST /logout                (Logout)
│   └── POST /refresh               (Refresh token)
│
├── /users
│   ├── GET /                       (Get all users)
│   ├── GET /:id                    (Get user by ID)
│   ├── POST /                      (Create user)
│   ├── PUT /:id                    (Update user)
│   └── DELETE /:id                 (Delete user)
│
├── /departments
│   ├── GET /                       (Get all)
│   ├── GET /:id                    (Get by ID)
│   ├── POST /                      (Create)
│   ├── PUT /:id                    (Update)
│   └── DELETE /:id                 (Delete)
│
├── /specialties
│   └── ... (same CRUD pattern)
│
├── /levels
│   └── ... (same CRUD pattern)
│
├── /groups
│   └── ... (same CRUD pattern)
│
├── /subjects
│   └── ... (same CRUD pattern)
│
├── /rooms
│   └── ... (same CRUD pattern)
│
├── /timetable
│   ├── GET /                       (Get all sessions)
│   ├── GET /group/:groupId         (By group)
│   ├── GET /teacher/:teacherId     (By teacher)
│   ├── POST /                      (Create session)
│   ├── PUT /:id                    (Update session)
│   └── DELETE /:id                 (Delete session)
│
├── /messages
│   ├── GET /inbox                  (User's inbox)
│   ├── GET /sent                   (Sent messages)
│   ├── GET /:id                    (Get message)
│   ├── POST /                      (Send message)
│   ├── PUT /:id/read               (Mark as read)
│   └── DELETE /:id                 (Delete message)
│
├── /events
│   ├── GET /                       (Get all events)
│   ├── GET /:id                    (Get event)
│   ├── POST /                      (Create event)
│   ├── PUT /:id                    (Update event)
│   ├── DELETE /:id                 (Delete event)
│   └── POST /:id/rsvp              (RSVP to event)
│
├── /absences
│   ├── GET /                       (Get absences)
│   ├── POST /                      (Submit absence)
│   └── PUT /:id/approve            (Approve absence)
│
├── /notifications
│   ├── GET /                       (Get notifications)
│   ├── PUT /:id/read               (Mark as read)
│   └── DELETE /:id                 (Delete)
│
└── /analytics
    ├── GET /users                  (User statistics)
    ├── GET /attendance             (Attendance stats)
    ├── GET /performance            (Academic stats)
    └── GET /utilization            (Resource usage)
```

---

## User Flows

### 1. Admin Creates Department Flow

```
START: Admin logged in, on Dashboard
   │
   ▼
Click "Academic" in sidebar
   │
   ▼
Click "Departments" submenu
   │
   ▼
Departments page loads
- Shows grid of existing departments
- Search bar at top
- "Add Department" button visible
   │
   ▼
Click "Add Department" button
   │
   ▼
Modal opens with form:
- Name field (empty)
- Code field (empty)
- Description field (empty)
- Head of Department field (empty)
- Building field (empty)
- Phone field (empty)
- Email field (empty)
   │
   ▼
Admin fills in:
- Name: "Computer Science"
- Code: "CS"
- Description: "Computer Science Department"
- Building: "Building A"
- Email: "cs@university.edu"
   │
   ▼
Click "Create" button
   │
   ▼
Form submits → Mutation executes
   │
   ├─► Loading spinner on button
   │
   ▼
API request sent to backend
   │
   ├─► Backend validates data
   ├─► Backend creates department in DB
   ├─► Backend returns created department
   │
   ▼
Response received (success)
   │
   ├─► Query cache invalidated
   ├─► Toast notification: "Department created"
   ├─► Modal closes
   │
   ▼
Departments list refetches
   │
   ▼
New department appears in grid
   │
   ▼
END: User sees new department card
```

### 2. Student Views Timetable Flow

```
START: Student logged in
   │
   ▼
Click "Timetable" in sidebar
   │
   ▼
Timetable page loads
   │
   ├─► useQuery fetches sessions
   │   for student's group
   │
   ▼
Loading spinner shows
   │
   ▼
Sessions data arrives
   │
   ├─► Sessions grouped by day & time
   │
   ▼
Week view renders:
- Monday through Saturday columns
- Time slots 8:00 - 18:00 rows
- Session blocks positioned in grid
   │
   ▼
Student sees their schedule:
- Each block shows:
  * Subject name
  * Room number
  * Teacher name
  * Time duration
   │
   ▼
Student clicks on a session block
   │
   ▼
Session details popup shows:
- Full subject information
- Teacher contact
- Room location with building
- Session notes (if any)
   │
   ▼
Student clicks "Day View" toggle
   │
   ▼
View switches to single day
- Shows only today's sessions
- Larger blocks with more detail
   │
   ▼
Student clicks arrows to navigate
   │
   ├─► Previous/Next day
   │
   ▼
Date updates, sessions refetch
for new date
   │
   ▼
END: Student can view any day's schedule
```

### 3. Teacher Sends Message to Group Flow

```
START: Teacher logged in
   │
   ▼
Click "Messages" in sidebar
   │
   ▼
Messages page loads
- Shows inbox by default
- "New Message" button visible
   │
   ▼
Click "New Message" button
   │
   ▼
Compose form appears:
- Recipient dropdown (empty)
- Subject field (empty)
- Message editor (empty)
   │
   ▼
Teacher clicks recipient dropdown
   │
   ├─► useQuery fetches groups
   │   that teacher teaches
   │
   ▼
Dropdown shows:
- Individual users
- Groups (with student count)
   │
   ▼
Teacher selects "Group A (30 students)"
   │
   ├─► Group added to recipients
   ├─► Shows "30 recipients"
   │
   ▼
Teacher types subject:
"Homework Assignment Due"
   │
   ▼
Teacher types message:
"Please submit your assignments
by Friday..."
   │
   ▼
Click "Send" button
   │
   ▼
Mutation executes
   │
   ├─► Loading state on button
   │
   ▼
Backend receives:
- groupId: 5
- subject: "..."
- content: "..."
   │
   ├─► Backend expands group
   │   to individual student IDs
   ├─► Creates 30 message records
   ├─► Creates 30 notifications
   │
   ▼
Response: Success
   │
   ├─► Toast: "Message sent to 30 students"
   ├─► Compose form closes
   ├─► Query invalidated
   │
   ▼
"Sent" messages list refetches
   │
   ▼
New message appears in "Sent"
   │
   ▼
END: Message delivered to all students
```

---

## Responsive Breakpoints

```
Mobile (xs)      Tablet (sm)      Desktop (md)     Large (lg)       XL (xl)
   0px               640px            768px           1024px          1280px
   │                  │                │               │               │
   ├──────────────────┤                │               │               │
   │  1 column        │                │               │               │
   │  Stack           │                │               │               │
   │  Full width      │                │               │               │
   │                  ├────────────────┤               │               │
   │                  │  2 columns     │               │               │
   │                  │  Grid          │               │               │
   │                  │  Sidebar →     │               │               │
   │                  │  Bottom nav    │               │               │
   │                  │                ├───────────────┤               │
   │                  │                │  3 columns    │               │
   │                  │                │  Full sidebar │               │
   │                  │                │  Cards grid   │               │
   │                  │                │               ├───────────────┤
   │                  │                │               │  4 columns    │
   │                  │                │               │  Max width    │
   │                  │                │               │  Comfortable  │
```

### Component Responsiveness

```
Sidebar:
Mobile:    Hidden, hamburger menu
Tablet:    Collapsible, icons only
Desktop:   Full width, always visible

Cards Grid:
Mobile:    1 column, full width
Tablet:    2 columns
Desktop:   3 columns
Large:     4 columns

Tables:
Mobile:    Horizontal scroll
Tablet:    Hide less important columns
Desktop:   All columns visible

Modals:
Mobile:    Full screen
Tablet:    80% width, centered
Desktop:   Fixed max-width, centered
```

---

## Performance Metrics

```
Metric                  Target          Actual
──────────────────────────────────────────────
First Contentful Paint   < 1.5s          ~1.2s
Time to Interactive      < 3.0s          ~2.5s
Largest Contentful Paint < 2.5s          ~2.0s
Cumulative Layout Shift  < 0.1           ~0.05
First Input Delay        < 100ms         ~50ms

Bundle Sizes:
- Main bundle            ~250 KB         ~180 KB
- Vendor bundle          ~400 KB         ~350 KB
- Total (gzipped)        ~650 KB         ~530 KB

Load Performance:
- Initial load           < 3s            ~2.5s
- Route transition       < 500ms         ~200ms
- API response time      < 1s            ~300ms
- Query cache hit        ~10ms           ~5ms
```

---

## Color System

```
Primary Color Palette:
├─► primary-50:  #eff6ff (lightest)
├─► primary-100: #dbeafe
├─► primary-200: #bfdbfe
├─► primary-300: #93c5fd
├─► primary-400: #60a5fa
├─► primary-500: #3b82f6 (base)
├─► primary-600: #2563eb (interactive)
├─► primary-700: #1d4ed8
├─► primary-800: #1e40af
└─► primary-900: #1e3a8a (darkest)

Semantic Colors:
├─► Success: green-500 (#10b981)
├─► Warning: yellow-500 (#f59e0b)
├─► Error:   red-500 (#ef4444)
└─► Info:    blue-500 (#3b82f6)

Role Colors:
├─► Admin:       purple-600
├─► Dept Head:   blue-600
├─► Teacher:     green-600
└─► Student:     gray-600

Status Colors:
├─► Active:      green-500
├─► Inactive:    gray-400
├─► Pending:     yellow-500
└─► Rejected:    red-500
```

---

**Last Updated:** December 2024  
**Version:** 1.0.0
