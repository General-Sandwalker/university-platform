# University Management Platform - API Documentation

## Base URL
```
http://localhost:3000/api/v1
```

## Swagger Documentation
Interactive API documentation is available at:
```
http://localhost:3000/api/docs
```

## Authentication
All endpoints (except `/auth/*`) require JWT authentication.

**Header Format:**
```
Authorization: Bearer <access_token>
```

---

## 📋 Table of Contents
1. [Authentication](#authentication-endpoints)
2. [Users](#user-endpoints)
3. [Departments](#department-endpoints)
4. [Specialties](#specialty-endpoints)
5. [Levels](#level-endpoints)
6. [Groups](#group-endpoints)
7. [Rooms](#room-endpoints)
8. [Subjects](#subject-endpoints)
9. [Semesters](#semester-endpoints)
10. [Schedule (Timetable)](#schedule-endpoints)
11. [Absences](#absence-endpoints)
12. [Messages](#message-endpoints)
13. [Notifications](#notification-endpoints)
14. [Events](#event-endpoints)
15. [Analytics](#analytics-endpoints)

---

## Authentication Endpoints

### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "cin": "string",
  "email": "string",
  "password": "string",
  "firstName": "string",
  "lastName": "string",
  "role": "admin|teacher|student",
  "phone": "string (optional)",
  "dateOfBirth": "date (optional)"
}
```

**Response (201):**
```json
{
  "message": "Registration successful",
  "user": {
    "id": "uuid",
    "cin": "string",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "role": "string"
  }
}
```

### POST /auth/login
Login to get access and refresh tokens.

**Request Body:**
```json
{
  "cin": "string",
  "password": "string"
}
```

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "uuid",
      "cin": "string",
      "email": "string",
      "firstName": "string",
      "lastName": "string",
      "role": "string"
    },
    "accessToken": "string",
    "refreshToken": "string"
  }
}
```

### POST /auth/refresh
Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "string"
}
```

**Response (200):**
```json
{
  "accessToken": "string"
}
```

### POST /auth/logout
Logout and invalidate tokens.

**Request Body:**
```json
{
  "refreshToken": "string"
}
```

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

---

## Message Endpoints

### POST /messages/send
Send a message to another user.

**Authentication:** Required  
**Request Body:**
```json
{
  "receiverId": "uuid",
  "content": "string (1-5000 chars)"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "content": "string",
  "status": "sent",
  "readAt": null,
  "sender": {
    "id": "uuid",
    "cin": "string",
    "firstName": "string",
    "lastName": "string"
  },
  "receiver": {
    "id": "uuid",
    "cin": "string",
    "firstName": "string",
    "lastName": "string"
  },
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### GET /messages/inbox
Get received messages (inbox).

**Authentication:** Required  
**Query Parameters:**
- `unreadOnly` (boolean, optional): Filter for unread messages only

**Response (200):**
```json
[
  {
    "id": "uuid",
    "content": "string",
    "status": "sent|delivered|read",
    "readAt": "timestamp|null",
    "sender": {
      "id": "uuid",
      "cin": "string",
      "firstName": "string",
      "lastName": "string"
    },
    "createdAt": "timestamp"
  }
]
```

### GET /messages/sent
Get sent messages.

**Authentication:** Required  

**Response (200):**
```json
[
  {
    "id": "uuid",
    "content": "string",
    "status": "sent|delivered|read",
    "readAt": "timestamp|null",
    "receiver": {
      "id": "uuid",
      "cin": "string",
      "firstName": "string",
      "lastName": "string"
    },
    "createdAt": "timestamp"
  }
]
```

### GET /messages/unread-count
Get count of unread messages.

**Authentication:** Required  

**Response (200):**
```json
{
  "count": 5
}
```

### GET /messages/conversations
Get list of all conversations with other users.

**Authentication:** Required  

**Response (200):**
```json
[
  {
    "user": {
      "id": "uuid",
      "cin": "string",
      "firstName": "string",
      "lastName": "string"
    },
    "lastMessage": {
      "id": "uuid",
      "content": "string",
      "createdAt": "timestamp"
    },
    "unreadCount": 2
  }
]
```

### GET /messages/conversation/:otherUserId
Get conversation with a specific user.

**Authentication:** Required  
**URL Parameters:**
- `otherUserId` (uuid): ID of the other user

**Response (200):**
```json
[
  {
    "id": "uuid",
    "content": "string",
    "status": "sent|delivered|read",
    "readAt": "timestamp|null",
    "sender": {
      "id": "uuid",
      "cin": "string"
    },
    "receiver": {
      "id": "uuid",
      "cin": "string"
    },
    "createdAt": "timestamp"
  }
]
```

### GET /messages/:id
Get a specific message by ID.

**Authentication:** Required  
**URL Parameters:**
- `id` (uuid): Message ID

**Response (200):**
```json
{
  "id": "uuid",
  "content": "string",
  "status": "sent|delivered|read",
  "readAt": "timestamp|null",
  "sender": { "...": "..." },
  "receiver": { "...": "..." },
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### PUT /messages/:id/read
Mark a message as read.

**Authentication:** Required (receiver only)  
**URL Parameters:**
- `id` (uuid): Message ID

**Response (200):**
```json
{
  "id": "uuid",
  "status": "read",
  "readAt": "timestamp",
  "...": "..."
}
```

### PUT /messages/mark-all-read
Mark all received messages as read.

**Authentication:** Required  

**Response (200):**
```json
{
  "message": "All messages marked as read"
}
```

### DELETE /messages/:id
Delete a message.

**Authentication:** Required (sender or receiver only)  
**URL Parameters:**
- `id` (uuid): Message ID

**Response (200):**
```json
{
  "message": "Message deleted successfully"
}
```

---

## User Endpoints

### GET /users
Get all users (Admin only).

**Authentication:** Required (Admin)  
**Query Parameters:**
- `role` (optional): Filter by role (admin|teacher|student)
- `status` (optional): Filter by status (active|inactive|suspended)

**Response (200):**
```json
[
  {
    "id": "uuid",
    "cin": "string",
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "role": "string",
    "status": "string",
    "createdAt": "timestamp"
  }
]
```

### GET /users/:id
Get user by ID.

**Authentication:** Required  
**Authorization:** Admin or own profile

**Response (200):**
```json
{
  "id": "uuid",
  "cin": "string",
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "role": "string",
  "status": "string",
  "phone": "string",
  "address": "string",
  "dateOfBirth": "date",
  "profileImage": "string",
  "createdAt": "timestamp"
}
```

### PUT /users/:id
Update user information.

**Authentication:** Required  
**Authorization:** Admin or own profile

**Request Body:**
```json
{
  "firstName": "string (optional)",
  "lastName": "string (optional)",
  "phone": "string (optional)",
  "address": "string (optional)",
  "dateOfBirth": "date (optional)"
}
```

### DELETE /users/:id
Delete user (Admin only).

**Authentication:** Required (Admin)  

**Response (200):**
```json
{
  "message": "User deleted successfully"
}
```

---

## Department Endpoints

### GET /departments
Get all departments.

**Authentication:** Required  

**Response (200):**
```json
[
  {
    "id": "uuid",
    "name": "string",
    "code": "string",
    "description": "string",
    "headId": "uuid",
    "createdAt": "timestamp"
  }
]
```

### POST /departments
Create a new department (Admin only).

**Authentication:** Required (Admin)  

**Request Body:**
```json
{
  "name": "string",
  "code": "string",
  "description": "string (optional)",
  "headId": "uuid (optional)"
}
```

### GET /departments/:id
Get department by ID.

**Authentication:** Required  

### PUT /departments/:id
Update department (Admin only).

**Authentication:** Required (Admin)  

### DELETE /departments/:id
Delete department (Admin only).

**Authentication:** Required (Admin)  

---

## Specialty Endpoints

### GET /specialties
Get all specialties.

### POST /specialties
Create a specialty (Admin only).

### GET /specialties/:id
Get specialty by ID.

### PUT /specialties/:id
Update specialty (Admin only).

### DELETE /specialties/:id
Delete specialty (Admin only).

---

## Level Endpoints

### GET /levels
Get all levels.

### POST /levels
Create a level (Admin only).

### GET /levels/:id
Get level by ID.

### PUT /levels/:id
Update level (Admin only).

### DELETE /levels/:id
Delete level (Admin only).

---

## Group Endpoints

### GET /groups
Get all groups.

### POST /groups
Create a group (Admin only).

### GET /groups/:id
Get group by ID.

### PUT /groups/:id
Update group (Admin only).

### DELETE /groups/:id
Delete group (Admin only).

---

## Room Endpoints

### GET /rooms
Get all rooms.

### POST /rooms
Create a room (Admin only).

### GET /rooms/:id
Get room by ID.

### PUT /rooms/:id
Update room (Admin only).

### DELETE /rooms/:id
Delete room (Admin only).

---

## Subject Endpoints

### GET /subjects
Get all subjects.

### POST /subjects
Create a subject (Admin/Teacher).

### GET /subjects/:id
Get subject by ID.

### PUT /subjects/:id
Update subject (Admin/Teacher).

### DELETE /subjects/:id
Delete subject (Admin).

---

## Semester Endpoints

### GET /semesters
Get all semesters.

**Authentication:** Required  
**Authorization:** All roles

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "code": "2024-2025-S1",
      "name": "Fall 2024-2025",
      "academicYear": 2024,
      "semesterNumber": 1,
      "startDate": "2024-09-01",
      "endDate": "2025-01-31",
      "isActive": true,
      "createdAt": "2024-08-15T10:00:00.000Z",
      "updatedAt": "2024-08-15T10:00:00.000Z"
    }
  ]
}
```

### GET /semesters/active
Get the currently active semester.

**Authentication:** Required  
**Authorization:** All roles

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "code": "2024-2025-S1",
    "name": "Fall 2024-2025",
    "academicYear": 2024,
    "semesterNumber": 1,
    "startDate": "2024-09-01",
    "endDate": "2025-01-31",
    "isActive": true
  }
}
```

### GET /semesters/:id
Get semester by ID.

**Authentication:** Required  
**Authorization:** All roles

### POST /semesters
Create a new semester (Admin only).

**Authentication:** Required  
**Authorization:** Admin only

**Request Body:**
```json
{
  "code": "2024-2025-S1",
  "name": "Fall 2024-2025",
  "academicYear": 2024,
  "semesterNumber": 1,
  "startDate": "2024-09-01",
  "endDate": "2025-01-31",
  "isActive": true
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "code": "2024-2025-S1",
    "name": "Fall 2024-2025",
    "academicYear": 2024,
    "semesterNumber": 1,
    "startDate": "2024-09-01",
    "endDate": "2025-01-31",
    "isActive": true,
    "createdAt": "2024-08-15T10:00:00.000Z",
    "updatedAt": "2024-08-15T10:00:00.000Z"
  }
}
```

### PUT /semesters/:id
Update semester (Admin only).

**Authentication:** Required  
**Authorization:** Admin only

**Request Body:** Same as POST, all fields optional

### PATCH /semesters/:id/activate
Set a semester as active (Admin only). Automatically deactivates all other semesters.

**Authentication:** Required  
**Authorization:** Admin only

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "isActive": true
  }
}
```

### DELETE /semesters/:id
Delete semester (Admin only). Warning: This will also delete all associated schedule entries.

**Authentication:** Required  
**Authorization:** Admin only

---

## Schedule Endpoints

> **Note:** The schedule system is semester-based with weekly recurring classes. Each entry represents a class that repeats every week throughout the semester (e.g., "Math every Monday 08:00-10:00").

### GET /timetable/accessible-groups
Get all groups the current user can access based on their role.

**Authentication:** Required  
**Authorization:** All roles

**Role-based access:**
- **Admin**: All groups in the system
- **Department Head**: Groups in their department
- **Teacher**: Groups where they teach
- **Student**: Their own group only

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "code": "L1-G1",
      "name": "Group 1",
      "level": {
        "id": "uuid",
        "code": "L1",
        "name": "Level 1",
        "specialty": {
          "id": "uuid",
          "code": "CS",
          "name": "Computer Science",
          "department": {
            "id": "uuid",
            "code": "IT",
            "name": "Information Technology"
          }
        }
      }
    }
  ]
}
```

### GET /timetable/group/:groupId
Get schedule for a specific group.

**Authentication:** Required  
**Authorization:** 
- Admin: Can view all groups
- Department Head: Can view groups in their department
- Teacher: Can view groups where they teach
- Student: Can view their own group only

**Query Parameters:**
- `semesterId` (optional): Filter by semester. If not provided, uses active semester.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "dayOfWeek": "monday",
      "startTime": "08:00",
      "endTime": "10:00",
      "subject": {
        "id": "uuid",
        "code": "CS101",
        "name": "Introduction to Programming"
      },
      "teacher": {
        "id": "uuid",
        "firstName": "John",
        "lastName": "Doe"
      },
      "room": {
        "id": "uuid",
        "code": "A101",
        "name": "Computer Lab 1"
      },
      "group": {
        "id": "uuid",
        "code": "L1-G1",
        "name": "Group 1"
      },
      "semester": {
        "id": "uuid",
        "code": "2024-2025-S1",
        "name": "Fall 2024-2025"
      },
      "sessionType": "lecture",
      "notes": "Bring laptops",
      "isCancelled": false,
      "createdAt": "2024-08-15T10:00:00.000Z",
      "updatedAt": "2024-08-15T10:00:00.000Z"
    }
  ]
}
```

### GET /timetable/:id
Get a specific schedule entry by ID.

**Authentication:** Required  
**Authorization:** Same as group access rules

### POST /timetable
Create a new schedule entry (Admin/Department Head only).

**Authentication:** Required  
**Authorization:** 
- Admin: Can create for any group
- Department Head: Can create for groups in their department

**Request Body:**
```json
{
  "dayOfWeek": "monday",
  "startTime": "08:00",
  "endTime": "10:00",
  "subjectId": "uuid",
  "teacherId": "uuid",
  "roomId": "uuid",
  "groupId": "uuid",
  "semesterId": "uuid",
  "sessionType": "lecture",
  "notes": "Optional notes"
}
```

**Session Types:**
- `lecture`: Standard lecture class
- `td`: Travaux Dirigés (tutorial/exercise session)
- `tp`: Travaux Pratiques (practical/lab session)
- `exam`: Examination
- `makeup`: Makeup class (Rattrapage)

**Days of Week:**
- `monday`, `tuesday`, `wednesday`, `thursday`, `friday`, `saturday`, `sunday`

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "dayOfWeek": "monday",
    "startTime": "08:00",
    "endTime": "10:00",
    "subject": {...},
    "teacher": {...},
    "room": {...},
    "group": {...},
    "semester": {...},
    "sessionType": "lecture",
    "notes": "Optional notes"
  }
}
```

**Error (409) - Time Conflict:**
```json
{
  "status": "error",
  "message": "Time conflict: This slot overlaps with Math at 08:00-10:00"
}
```

### PUT /timetable/:id
Update a schedule entry (Admin/Department Head only).

**Authentication:** Required  
**Authorization:** Same as POST

**Request Body:** Same as POST, all fields optional

### DELETE /timetable/:id
Delete a schedule entry (Admin/Department Head only).

**Authentication:** Required  
**Authorization:** Same as POST

**Response (204):** No content

---

## Absence Endpoints

### GET /absences
Get absences.

**Query Parameters:**
- `studentId` (optional): Filter by student
- `sessionId` (optional): Filter by session
- `status` (optional): Filter by status

### POST /absences
Record an absence (Teacher).

### GET /absences/:id
Get absence by ID.

### PUT /absences/:id
Update absence (Teacher/Admin).

### DELETE /absences/:id
Delete absence (Admin).

---

## Event Endpoints

### GET /events
Get all events with optional filters.

**Authentication:** Required  
**Query Parameters:**
- `type` (optional): Filter by event type (holiday, conference, exam_period, registration, workshop, other)
- `startDate` (optional): Filter events starting from this date (YYYY-MM-DD)
- `endDate` (optional): Filter events ending before this date (YYYY-MM-DD)
- `isActive` (optional): Filter by active status (true/false)

**Response (200):**
```json
[
  {
    "id": "uuid",
    "title": "Winter Break",
    "description": "University winter vacation",
    "type": "holiday",
    "startDate": "2025-12-20",
    "endDate": "2026-01-05",
    "startTime": null,
    "endTime": null,
    "location": null,
    "affectsAllUsers": true,
    "blocksTimetable": true,
    "organizer": "Administration",
    "isActive": true,
    "createdAt": "2025-11-24T10:00:00Z",
    "updatedAt": "2025-11-24T10:00:00Z"
  }
]
```

### GET /events/upcoming
Get upcoming events (future events only).

**Authentication:** Required  
**Query Parameters:**
- `limit` (optional): Maximum number of events to return (default: 10)

**Response (200):**
```json
[
  {
    "id": "uuid",
    "title": "AI Conference 2026",
    "type": "conference",
    "startDate": "2026-03-15",
    "endDate": "2026-03-17",
    "location": "Main Auditorium"
  }
]
```

### GET /events/date-range
Get events within a specific date range.

**Authentication:** Required  
**Query Parameters:**
- `startDate` (required): Start date (YYYY-MM-DD)
- `endDate` (required): End date (YYYY-MM-DD)

**Response (200):**
```json
[
  {
    "id": "uuid",
    "title": "Midterm Exams",
    "type": "exam_period",
    "startDate": "2026-02-01",
    "endDate": "2026-02-15",
    "blocksTimetable": true
  }
]
```

### GET /events/type/:type
Get events by type.

**Authentication:** Required  
**URL Parameters:**
- `type`: Event type (holiday, conference, exam_period, registration, workshop, other)

**Response (200):**
```json
[
  {
    "id": "uuid",
    "title": "Python Workshop",
    "type": "workshop",
    "startDate": "2026-02-10",
    "endDate": "2026-02-10",
    "startTime": "14:00",
    "endTime": "17:00",
    "location": "Lab C"
  }
]
```

### GET /events/:id
Get event by ID.

**Authentication:** Required  
**URL Parameters:**
- `id` (uuid): Event ID

**Response (200):**
```json
{
  "id": "uuid",
  "title": "Student Registration",
  "description": "Registration period for new semester",
  "type": "registration",
  "startDate": "2025-12-01",
  "endDate": "2025-12-15",
  "affectsAllUsers": false,
  "organizer": "Registration Office",
  "isActive": true
}
```

### POST /events
Create a new event (Admin only).

**Authentication:** Required (Admin)  
**Request Body:**
```json
{
  "title": "Spring Festival",
  "description": "Annual university spring festival",
  "type": "other",
  "startDate": "2026-04-20",
  "endDate": "2026-04-22",
  "startTime": "09:00",
  "endTime": "18:00",
  "location": "Campus Grounds",
  "affectsAllUsers": true,
  "blocksTimetable": false,
  "organizer": "Student Affairs"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "title": "Spring Festival",
  "type": "other",
  "startDate": "2026-04-20",
  "endDate": "2026-04-22",
  "createdAt": "2025-11-24T18:00:00Z"
}
```

### PUT /events/:id
Update an event (Admin only).

**Authentication:** Required (Admin)  
**URL Parameters:**
- `id` (uuid): Event ID

**Request Body:**
```json
{
  "title": "Updated Event Title",
  "isActive": false
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "title": "Updated Event Title",
  "isActive": false,
  "updatedAt": "2025-11-24T18:30:00Z"
}
```

### DELETE /events/:id
Delete an event (Admin only).

**Authentication:** Required (Admin)  
**URL Parameters:**
- `id` (uuid): Event ID

**Response (200):**
```json
{
  "message": "Event deleted successfully"
}
```

---

## Notification Endpoints

### GET /notifications
Get user's notifications.

### POST /notifications
Create notification (System/Admin).

### GET /notifications/unread-count
Get unread notification count.

### PUT /notifications/:id/read
Mark notification as read.

### PUT /notifications/mark-all-read
Mark all notifications as read.

### DELETE /notifications/:id
Delete notification.

---

## Analytics Endpoints

### GET /analytics/overview
Get system overview statistics (Admin).

### GET /analytics/absences
Get absence statistics.

### GET /analytics/users
Get user statistics (Admin).

### GET /analytics/timetable
Get timetable statistics.

---

## Error Responses

All endpoints may return these error responses:

### 400 - Bad Request
```json
{
  "status": "error",
  "message": "Validation error",
  "errors": [
    {
      "field": "fieldName",
      "message": "Error message"
    }
  ]
}
```

### 401 - Unauthorized
```json
{
  "status": "error",
  "message": "Authentication required"
}
```

### 403 - Forbidden
```json
{
  "status": "error",
  "message": "Access denied. Insufficient permissions."
}
```

### 404 - Not Found
```json
{
  "status": "error",
  "message": "Resource not found"
}
```

### 500 - Internal Server Error
```json
{
  "status": "error",
  "message": "Internal server error"
}
```

---

## Test Credentials

From seed data:

**Admin:**
- CIN: `ADMIN001`
- Password: `Admin@123456`

**Department Heads:**
- CIN: `HEAD001` / `HEAD002` / `HEAD003`
- Password: `Head@123`

**Teachers:**
- CIN: `TEACH001` / `TEACH002`
- Password: `Teacher@123`

**Students:**
- CIN: `STUD001` / `STUD002` / `STUD003` / `STUD004` / `STUD005`
- Password: `Student@123`

---

## Rate Limiting
- Window: 15 minutes
- Max requests: 100 per IP

---

## Notes
- All timestamps are in ISO 8601 format
- All IDs are UUIDs (v4)
- Message content max length: 5000 characters
- File uploads (where applicable): Max 10MB
- CIN (Carte d'Identité Nationale) is used as the primary identifier for login
