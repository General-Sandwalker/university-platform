# Schedule System Redesign - Complete Implementation

## Overview
The timetable system has been completely redesigned from a date-based event system to a **semester-based weekly schedule system** with comprehensive role-based access control.

## Key Changes

### 1. Data Model Changes

#### New Entity: Semester
- **Purpose**: Define academic semesters with date ranges
- **Fields**:
  - `code`: Unique identifier (e.g., "2024-2025-S1")
  - `name`: Display name (e.g., "Fall 2024-2025")
  - `academicYear`: Starting year (e.g., 2024 for 2024-2025)
  - `semesterNumber`: 1 or 2
  - `startDate` & `endDate`: Date range
  - `isActive`: Only one semester can be active at a time

#### Modified Entity: Timetable
**Before** (Date-based):
- `date`: Specific date (YYYY-MM-DD)
- No semester relation
- One-time events

**After** (Weekly recurring):
- `dayOfWeek`: Enum (monday, tuesday, wednesday, thursday, friday, saturday, sunday)
- `semester`: Relation to Semester entity
- Repeats weekly throughout the semester

### 2. Role-Based Access Control

| Role | Access Rights |
|------|--------------|
| **Admin** | Full read/write access to all schedules |
| **Department Head** | Read/write access to schedules for groups in their department |
| **Teacher** | Read-only access to schedules where they teach |
| **Student** | Read-only access to their own group's schedule |
| **Staff** | No access to schedules |

### 3. Backend Changes

#### New Files
- `backend/src/entities/Semester.ts` - Semester entity
- `backend/src/services/semester.service.ts` - Semester management
- `backend/src/controllers/semester.controller.ts` - Semester API
- `backend/src/routes/semester.routes.ts` - Semester routes

#### Modified Files
- `backend/src/entities/Timetable.ts`:
  - Removed `date` field
  - Added `dayOfWeek` enum field
  - Added `semester` relation
  - Added `DayOfWeek` enum

- `backend/src/services/timetable.service.ts` (complete rewrite):
  - Added `canAccessGroup()` - Check if user can view a group's schedule
  - Added `canEditGroup()` - Check if user can edit a group's schedule
  - Added `getAccessibleGroups()` - Get all groups user can access
  - Modified `create()`, `update()`, `delete()` - Added permission checks
  - Modified `getByGroup()` - Query by group and semester with permissions
  - Removed date-based conflict checking
  - Added weekly time slot conflict checking

- `backend/src/controllers/timetable.controller.ts` (simplified):
  - `createTimetable` - With user context
  - `getTimetableByGroup` - By group ID and optional semester ID
  - `getTimetableById` - Single entry with permissions
  - `updateTimetable` - With permission checks
  - `deleteTimetable` - With permission checks
  - `getAccessibleGroups` - List groups user can access

- `backend/src/validators/schemas.ts`:
  - Updated `createTimetableSchema` - Changed `date` to `dayOfWeek`, added `semesterId`
  - Updated `updateTimetableSchema` - Same changes
  - Added `createSemesterSchema`
  - Added `updateSemesterSchema`

- `backend/src/routes/index.ts`:
  - Added `/semesters` route mounting

#### API Endpoints

**Semesters** (`/api/v1/semesters`):
- `GET /` - List all semesters
- `GET /active` - Get active semester
- `GET /:id` - Get semester by ID
- `POST /` - Create semester (admin only)
- `PUT /:id` - Update semester (admin only)
- `PATCH /:id/activate` - Set as active semester (admin only)
- `DELETE /:id` - Delete semester (admin only)

**Timetable** (`/api/v1/timetable`):
- `GET /accessible-groups` - Get groups user can access
- `GET /group/:groupId?semesterId=xxx` - Get schedule for group
- `GET /:id` - Get single entry
- `POST /` - Create entry (admin/department_head)
- `PUT /:id` - Update entry (admin/department_head)
- `DELETE /:id` - Delete entry (admin/department_head)

### 4. Frontend Changes

#### New Files
- `frontend/src/services/semesterService.ts` - Semester API calls
- `frontend/src/services/timetableService.ts` - Timetable API calls (rewritten)
- `frontend/src/components/schedule/ScheduleGrid.tsx` - Visual weekly grid
- `frontend/src/pages/schedule/Schedule.tsx` - Main schedule page
- `frontend/src/pages/schedule/Semesters.tsx` - Semester management page

#### Modified Files
- `frontend/src/App.tsx`:
  - Changed `/timetable` route to `/schedule`
  - Added `/semesters` route (admin only)

- `frontend/src/components/layout/DashboardLayout.tsx`:
  - Changed "Timetable" navigation to "Schedule"
  - Added "Semesters" navigation (admin only)

#### UI Components

**ScheduleGrid** Component:
- Visual weekly schedule (Monday-Saturday)
- Time slots from 08:00 to 18:00 (30-minute intervals)
- Color-coded session types:
  - Lecture (blue)
  - TD (green)
  - TP (purple)
  - Exam (red)
  - Makeup (yellow)
- Shows: Subject, time, teacher, room, session type
- Inline edit/delete buttons (when editable)
- Click empty slot to add new class (when editable)
- Cancelled classes indicated with overlay

**Schedule** Page:
- Group selector (filtered by user role)
- Semester selector
- Visual schedule grid
- Add/Edit modal with form:
  - Day of week
  - Start/end time
  - Subject, teacher, room
  - Session type
  - Notes
- Real-time conflict detection
- Role-based read-only/edit mode

**Semesters** Page (Admin only):
- Grid view of all semesters
- Shows: Name, code, date range, academic year, active status
- Create/Edit/Delete operations
- Set active semester
- Only one semester can be active at a time

### 5. User Experience

#### For Students:
1. Log in → Navigate to "Schedule"
2. See only their own group's schedule
3. View-only mode (no editing)
4. See weekly recurring classes for active semester
5. Color-coded session types for easy identification

#### For Teachers:
1. Log in → Navigate to "Schedule"
2. See groups where they teach
3. View-only mode (cannot edit)
4. Switch between different groups to see where they teach

#### For Department Heads:
1. Log in → Navigate to "Schedule"
2. See all groups in their department
3. Full edit access to their department's schedules
4. Group selector shows department groups
5. Can add/edit/delete classes
6. Visual drag-and-drop style interface

#### For Admins:
1. Log in → Navigate to "Schedule"
2. See all groups in the system
3. Full edit access to all schedules
4. Access to "Semesters" page to manage academic periods
5. Can create/edit/delete semesters
6. Can set active semester

### 6. Technical Implementation Details

#### Permission Logic
```typescript
canAccessGroup(userId, userRole, groupId):
  - admin: Always true
  - student: Only their own group
  - teacher: Groups where they have classes
  - department_head: Groups in their department
  - staff: Always false

canEditGroup(userId, userRole, groupId):
  - admin: Always true
  - department_head: Groups in their department
  - others: Always false
```

#### Schedule Display
- **Time Slots**: 30-minute intervals (08:00-18:00)
- **Grid Height**: 60px per 30-minute slot
- **Entry Positioning**: Calculated based on start/end times
- **Conflict Detection**: Check for overlapping times on same day/group/semester

#### Data Flow
1. User selects group and semester
2. Frontend fetches entries: `GET /api/v1/timetable/group/:groupId?semesterId=xxx`
3. Backend checks permissions via `canAccessGroup()`
4. Returns filtered timetable entries
5. Frontend renders visual grid with entries positioned by time

### 7. Database Changes

**New Table**: `semesters`
```sql
CREATE TABLE semesters (
  id UUID PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  academic_year INTEGER NOT NULL,
  semester_number INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Modified Table**: `timetable`
```sql
-- Removed columns:
-- date DATE

-- Added columns:
day_of_week timetable_dayofweek_enum NOT NULL
semester_id UUID REFERENCES semesters(id) ON DELETE CASCADE

-- Added enum:
CREATE TYPE timetable_dayofweek_enum AS ENUM (
  'monday', 'tuesday', 'wednesday', 'thursday', 
  'friday', 'saturday', 'sunday'
);

-- Modified indexes:
CREATE INDEX idx_timetable_group_semester_day ON timetable(group_id, semester_id, day_of_week, start_time);
```

### 8. Migration Notes

**Breaking Changes**:
- Old timetable entries with `date` field are incompatible
- All existing timetable data needs migration or deletion
- Frontend routes changed: `/timetable` → `/schedule`

**Migration Steps**:
1. Backup existing timetable data
2. Create first semester via admin panel or API
3. Convert existing date-based entries to weekly recurring format (manual)
4. Or start fresh (recommended for testing)

### 9. Testing

**Create Semester**:
```bash
curl -X POST http://localhost:3000/api/v1/semesters \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "2024-2025-S1",
    "name": "Fall 2024-2025",
    "academicYear": 2024,
    "semesterNumber": 1,
    "startDate": "2024-09-01",
    "endDate": "2025-01-31",
    "isActive": true
  }'
```

**Get Accessible Groups**:
```bash
curl -X GET http://localhost:3000/api/v1/timetable/accessible-groups \
  -H "Authorization: Bearer $TOKEN"
```

**Create Timetable Entry**:
```bash
curl -X POST http://localhost:3000/api/v1/timetable \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "dayOfWeek": "monday",
    "startTime": "08:00",
    "endTime": "10:00",
    "subjectId": "uuid",
    "teacherId": "uuid",
    "roomId": "uuid",
    "groupId": "uuid",
    "semesterId": "uuid",
    "sessionType": "lecture",
    "notes": "Introduction class"
  }'
```

## Summary

The schedule system now provides:
- ✅ Semester-based weekly schedules
- ✅ Role-based access control (admin, department_head, teacher, student)
- ✅ Visual weekly grid interface
- ✅ Group-specific schedules
- ✅ Conflict detection
- ✅ Color-coded session types
- ✅ Inline editing for authorized users
- ✅ Semester management (admin only)
- ✅ Permission-enforced API endpoints

Users can now view and manage class schedules in a visual, intuitive way with appropriate access control based on their role in the system.
