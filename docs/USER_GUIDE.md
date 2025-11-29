# University Platform - User Guide

## Table of Contents
1. [Getting Started](#getting-started)
2. [Login](#login)
3. [Dashboard](#dashboard)
4. [User Management](#user-management)
5. [Academic Management](#academic-management)
6. [Semesters](#semesters)
7. [Schedule](#schedule)
8. [Messaging](#messaging)
9. [Events](#events)
10. [Analytics](#analytics)
11. [Profile](#profile)

---

## Getting Started

### Accessing the Platform
1. Open your web browser
2. Navigate to: `http://localhost:5173` (development) or your production URL
3. You'll be redirected to the login page

### System Requirements
- Modern web browser (Chrome, Firefox, Safari, Edge)
- JavaScript enabled
- Internet connection

---

## Login

### Default Credentials
Use these credentials for initial access:

**Administrator:**
- CIN: `ADMIN001`
- Password: `Admin@123456`

**Department Head:**
- CIN: `DEPT001`
- Password: `Dept@123456`

**Teacher:**
- CIN: `TEACHER001`
- Password: `Teacher@123456`

**Student:**
- CIN: `STUDENT001`
- Password: `Student@123456`

### First Time Login
1. Enter your CIN (Carte d'Identité Nationale)
2. Enter your password
3. Click "Sign In"
4. You'll be redirected to the dashboard
5. **Important:** Change your password immediately via Profile settings

### Forgot Password
Contact your system administrator to reset your password.

---

## Dashboard

The dashboard provides an overview of your activities:

### For Students:
- **Today's Schedule:** Classes scheduled for today
- **Upcoming Assignments:** Due dates and submissions
- **Recent Messages:** Latest conversations
- **Announcements:** Important notices

### For Teachers:
- **Today's Classes:** Your teaching schedule
- **Pending Absences:** Student absence requests
- **Recent Messages:** Student communications
- **Class Statistics:** Overview of your classes

### For Administrators:
- **System Statistics:** User counts, active sessions
- **Recent Activities:** Latest system events
- **Pending Approvals:** Items requiring attention
- **Quick Actions:** Common administrative tasks

---

## User Management

**Access:** Administrators and Department Heads

### Viewing Users
1. Click **Users** in the sidebar
2. View all registered users in a table format
3. Columns displayed:
   - User (Name with avatar)
   - CIN
   - Email
   - Role (color-coded badge)
   - Status (Active/Inactive)
   - Actions

### Searching Users
- Use the search bar at the top
- Search by name, CIN, or email
- Results update in real-time

### Filtering Users
1. Click the **Filter** dropdown
2. Select a role:
   - All Roles (default)
   - Student
   - Teacher
   - Department Head
   - Admin
3. Table updates automatically

### Creating a New User
1. Click the **Add User** button (top right)
2. Fill in the required fields:
   - **CIN** (required): National ID number
   - **Email** (required): User's email address
   - **First Name** (required)
   - **Last Name** (required)
   - **Password** (required): Must be strong
   - **Role** (required): Select from dropdown
   - **Phone** (optional)
   - **Date of Birth** (optional)
   - **Address** (optional)
   - **Department** (optional, for teachers/dept heads)
   - **Specialty** (optional, for students)
   - **Group** (optional, for students)
3. Click **Create**
4. Success message appears

### Editing a User
1. Click the **Edit** icon (pencil) on the user row
2. Modify the fields you want to update
3. Click **Update**
4. Changes are saved immediately

### Deleting a User
1. Click the **Delete** icon (trash) on the user row
2. Confirm the deletion in the popup
3. User is permanently removed

**⚠️ Warning:** Deleting a user cannot be undone. All their data will be lost.

---

## Academic Management

Manage all academic entities: departments, specialties, levels, groups, subjects, and rooms.

### Departments Management

**Access:** Administrators and Department Heads

#### Viewing Departments
- Navigate to **Academic** → **Departments**
- Departments displayed as cards in a grid layout
- Each card shows:
  - Department name and code
  - Description
  - Head of Department
  - Building location
  - Contact info (phone, email)

#### Creating a Department
1. Click **Add Department**
2. Fill in the form:
   - **Name** (required): e.g., "Computer Science"
   - **Code** (required): e.g., "CS"
   - **Description** (optional): Brief overview
   - **Head of Department** (optional): Name
   - **Building** (optional): Physical location
   - **Phone** (optional): Contact number
   - **Email** (optional): Department email
3. Click **Create**

#### Editing/Deleting
- Click edit icon on any department card to modify
- Click delete icon to remove (with confirmation)

### Specialties Management

**Access:** Administrators and Department Heads

#### About Specialties
Specialties are programs of study within departments (e.g., "Software Engineering" within Computer Science).

#### Creating a Specialty
1. Navigate to **Academic** → **Specialties**
2. Click **Add Specialty**
3. Fill in:
   - **Name** (required): e.g., "Software Engineering"
   - **Code** (required): e.g., "SE"
   - **Description** (optional)
   - **Department** (required): Select from dropdown
   - **Duration in Years** (required): e.g., 3 or 5
4. Click **Create**

### Levels Management

**Access:** Administrators

#### About Levels
Levels represent academic years (e.g., "First Year", "Second Year").

#### Creating a Level
1. Navigate to **Academic** → **Levels**
2. Click **Add Level**
3. Fill in:
   - **Name** (required): e.g., "First Year"
   - **Code** (required): e.g., "L1"
   - **Description** (optional)
   - **Display Order** (required): Numeric order for sorting
4. Click **Create**

### Groups Management

**Access:** Administrators and Department Heads

#### About Groups
Groups are student cohorts within a level and specialty.

#### Creating a Group
1. Navigate to **Academic** → **Groups**
2. Click **Add Group**
3. Fill in:
   - **Name** (required): e.g., "Group A"
   - **Code** (required): e.g., "GA"
   - **Level** (required): Select from dropdown
   - **Specialty** (required): Select from dropdown
   - **Capacity** (required): Maximum students (e.g., 30)
   - **Academic Year** (required): e.g., "2023-2024"
4. Click **Create**

### Subjects Management

**Access:** Administrators and Department Heads

#### About Subjects
Subjects are individual courses taught in the curriculum.

#### Creating a Subject
1. Navigate to **Academic** → **Subjects**
2. Click **Add Subject**
3. Fill in:
   - **Name** (required): e.g., "Data Structures"
   - **Code** (required): e.g., "CS201"
   - **Description** (optional): Course overview
   - **Credits** (required): Credit hours (1-10)
   - **Hours per Week** (required): Teaching hours (1-20)
   - **Department** (required): Select from dropdown
   - **Semester** (required): 1 or 2
4. Click **Create**

### Rooms Management

**Access:** Administrators

#### About Rooms
Rooms are physical spaces where classes are held.

#### Creating a Room
1. Navigate to **Academic** → **Rooms**
2. Click **Add Room**
3. Fill in:
   - **Name** (required): e.g., "Room 101"
   - **Code** (required): e.g., "R101"
   - **Building** (required): e.g., "Building A"
   - **Floor** (optional): e.g., "Ground Floor"
   - **Capacity** (required): Number of seats
   - **Type** (required): Select from:
     - Classroom
     - Laboratory
     - Amphitheater
     - Office
     - Conference Room
   - **Equipment** (optional): Available equipment
4. Click **Create**

---

## Semesters

**Access:** Admin only

### What are Semesters?
Semesters define academic periods (Fall/Spring) with start and end dates. All class schedules are associated with a specific semester.

### Managing Semesters (Admin Only)

1. Click **Semesters** in the sidebar
2. View all academic semesters with:
   - Semester name (e.g., "Fall 2024-2025")
   - Academic year
   - Date range
   - Active status

### Creating a New Semester

1. Click **Add Semester**
2. Fill in the form:
   - **Code:** Unique identifier (e.g., "2024-2025-S1")
   - **Name:** Display name (e.g., "Fall 2024-2025")
   - **Academic Year:** Starting year (e.g., 2024 for 2024-2025)
   - **Semester Number:** 1 (Fall) or 2 (Spring)
   - **Start Date:** First day of semester
   - **End Date:** Last day of semester
   - **Is Active:** Check to set as current semester
3. Click **Create**

### Setting Active Semester

- Only one semester can be active at a time
- The active semester is used by default for all schedule views
- Click **Set Active** button on any semester card
- All schedules will default to showing the active semester

### Important Notes

- Deleting a semester will also delete all associated schedule entries
- Students and teachers will automatically see schedules for the active semester
- Always create next semester before the current one ends

---

## Schedule

**Access:** All users (permissions vary by role)

### Overview
The Schedule system shows weekly recurring classes for a selected group and semester. Classes repeat every week throughout the semester.

### Viewing Schedules

1. Click **Schedule** in the sidebar
2. Select a **Group** from the dropdown
   - Students: See only their own group
   - Teachers: See groups where they teach
   - Department Heads: See groups in their department
   - Admins: See all groups
3. Select a **Semester** from the dropdown (defaults to active semester)
4. View the visual weekly grid showing all classes

### Understanding the Schedule Grid

- **Days:** Monday through Saturday (columns)
- **Time Slots:** 08:00 to 18:00 in 30-minute intervals (rows)
- **Class Blocks:** Colored rectangles showing:
  - Subject code and name
  - Time (start - end)
  - Teacher name
  - Room code
  - Session type badge

### Session Type Colors

- **Blue:** Lecture - Traditional lecture class
- **Green:** TD (Travaux Dirigés) - Tutorial/Exercise session
- **Purple:** TP (Travaux Pratiques) - Practical/Lab session
- **Red:** Exam - Examination
- **Yellow:** Makeup - Makeup class (Rattrapage)

### For Students

- View your group's weekly schedule
- See when and where each class takes place
- Know which teacher is assigned
- Read-only access (cannot edit)

### For Teachers

- View schedules for groups where you teach
- See all your teaching assignments
- Check room locations
- Read-only access (cannot edit)

### For Department Heads

1. Select any group from your department
2. Click **Add Class** to create new entries
3. Click empty time slots to quick-add
4. Click **Edit** button on any class to modify
5. Click **Delete** button to remove a class

### For Administrators

1. Access all groups in the system
2. Full edit capabilities
3. Can manage semesters via separate page
4. Same editing interface as Department Heads

### Adding a New Class (Admin/Department Head)

1. Click **Add Class** button or click an empty time slot
2. Fill in the form:
   - **Day:** Select day of week (Monday-Saturday)
   - **Session Type:** Lecture, TD, TP, Exam, or Makeup
   - **Start Time:** Class start time (HH:MM format)
   - **End Time:** Class end time (HH:MM format)
   - **Subject:** Select from available subjects
   - **Teacher:** Assign an instructor
   - **Room:** Select available room
   - **Notes:** Optional additional information
3. System automatically checks for conflicts:
   - Same group cannot have overlapping classes
   - Shows error if time slot is already occupied
4. Click **Create** to save

### Editing a Class (Admin/Department Head)

1. Click the **Edit** icon on any class block
2. Modify any fields as needed
3. Conflict detection runs automatically
4. Click **Update** to save changes

### Deleting a Class (Admin/Department Head)

1. Click the **Delete** icon on any class block
2. Confirm the deletion
3. Class is removed from the schedule

### Conflict Detection

The system automatically prevents:
- **Time Overlaps:** Same group cannot have two classes at overlapping times
- Shows which class is causing the conflict
- Helps maintain a valid schedule

### Best Practices

For Administrators/Department Heads:
- Create next semester's schedule before current semester ends
- Assign rooms with appropriate capacity
- Avoid back-to-back classes in distant buildings
- Use appropriate session types for clarity
- Add notes for special requirements (bring laptops, etc.)

For All Users:
- Check the schedule regularly for updates
- Note room locations in advance
- Be aware of your active semester
- Report scheduling conflicts to administrators

---

## Events (Timetable)

**Access:** All users (view permissions vary by role)

### What are Events?
Events are one-time or recurring activities separate from the regular class schedule (conferences, meetings, workshops, etc.).

### Viewing Events
1. Click **Timetable** in the sidebar (Events section)
2. Select view mode:
   - **Week View:** See the entire week
   - **Day View:** Focus on a single day
3. Navigate between dates using arrow buttons
4. Click **Today** to jump to current day

### Understanding the Events Timetable
- **Time slots:** Listed on the left (vertical axis)
- **Days:** Columns across the top
- **Events:** Colored blocks showing:
  - Event name
  - Location
  - Time duration
  - Organizer information

### For Students:
- View university-wide events
- See event locations
- Check event descriptions

### For Teachers:
- View all events
- See assigned locations
- Check for scheduling conflicts with classes

### For Administrators:
1. Click **Create Event** to add new activities
2. Fill in:
   - **Event Name:** Title of the event
   - **Location:** Room or venue
   - **Date:** Specific date
   - **Start Time:** Event start
   - **End Time:** Event end
   - **Description:** Event details
3. System checks for room availability
4. Click **Create** to save

### Editing an Event
- Click on any event block
- Modify details in the popup
- Click **Save Changes**

### Deleting a Session
- Click on the class block
- Click **Delete** button
- Confirm deletion

---

## Messaging

**Access:** All users

### Viewing Messages
1. Click **Messages** in the sidebar
2. See three sections:
   - **Inbox:** Received messages
   - **Sent:** Messages you sent
   - **Drafts:** Unsent messages (coming soon)

### Sending a Message
1. Click **Compose** or **New Message** button
2. Fill in:
   - **To:** Select recipient(s) from dropdown
     - Search by name or CIN
     - Multiple recipients allowed
   - **Subject:** Brief title
   - **Message:** Your content
3. Click **Send**

### Reading Messages
1. Click on any message in your inbox
2. Message opens in a detail view
3. See:
   - Sender information
   - Timestamp
   - Full message content
   - Attachments (if any)

### Replying to Messages
1. Open the message
2. Click **Reply** button
3. Type your response
4. Click **Send**

### Message Features
- **Mark as Read/Unread:** Click the envelope icon
- **Delete:** Click the trash icon
- **Search Messages:** Use the search bar
- **Filter by Sender:** Click filter dropdown

### For Teachers:
- **Broadcast to Group:** Send to all students in a group
- Click "New Message" → Select group → Compose → Send

---

## Events

**Access:** All users (creation restricted by role)

### Viewing Events
1. Click **Events** in the sidebar
2. See events in:
   - **List View:** Chronological list
   - **Calendar View:** Monthly calendar
   - **Grid View:** Card-based layout

### Event Information
Each event displays:
- **Title:** Event name
- **Description:** Details
- **Date & Time:** When it occurs
- **Location:** Where it takes place
- **Organizer:** Who created it
- **Type:** Category (Academic, Social, Administrative)
- **Status:** Upcoming, Ongoing, Completed

### Creating an Event (Admins/Teachers)
1. Click **Create Event** button
2. Fill in:
   - **Title** (required)
   - **Description** (optional)
   - **Start Date & Time** (required)
   - **End Date & Time** (required)
   - **Location** (optional)
   - **Event Type** (required):
     - Academic (exams, lectures)
     - Social (clubs, activities)
     - Administrative (meetings)
   - **All Day Event:** Check if applicable
   - **Recurrence:** None, Daily, Weekly, Monthly
3. Click **Create**

### RSVP to Events (Students)
1. Click on an event
2. Click **RSVP** button
3. Select your response:
   - Going
   - Maybe
   - Not Going
4. Your response is recorded

### Editing/Deleting Events
- Only event organizers can edit/delete
- Click event → Edit/Delete buttons

---

## Analytics

**Access:** Administrators and Department Heads

### Dashboard Overview
The analytics page provides comprehensive insights:

#### User Statistics
- Total users by role (pie chart)
- Active vs inactive users
- Registration trends (line graph)
- User growth over time

#### Academic Performance
- Overall attendance rates
- Subject-wise performance
- Department comparisons
- Grade distributions

#### Class Utilization
- Room occupancy rates
- Peak hours analysis
- Capacity utilization
- Unused resources

#### Messaging Activity
- Messages sent/received over time
- Most active users
- Response times
- Communication patterns

### Filtering Data
1. **Date Range:** Select custom date ranges
2. **Department:** Filter by specific department
3. **Level/Group:** Narrow down to specific cohorts
4. **Export:** Download reports as PDF/Excel

### Reading Charts
- **Hover:** See detailed tooltips
- **Legend:** Click to show/hide data series
- **Zoom:** Drag on chart to zoom in
- **Reset:** Double-click to reset view

### Generating Reports
1. Set your filters
2. Click **Generate Report**
3. Select format (PDF, Excel, CSV)
4. Report downloads automatically

---

## Profile

**Access:** All users (own profile only)

### Viewing Your Profile
1. Click your avatar/name in the top right
2. Select **Profile** from dropdown
3. View your information:
   - Personal details
   - Contact information
   - Role and permissions
   - Academic information (if student)

### Editing Your Profile
1. Click **Edit Profile** button
2. Update allowed fields:
   - Email
   - Phone number
   - Address
   - Profile picture
3. Click **Save Changes**

**Note:** CIN, role, and official details can only be changed by administrators.

### Changing Your Password
1. Go to Profile page
2. Click **Change Password**
3. Enter:
   - Current password
   - New password
   - Confirm new password
4. Click **Update Password**

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one number
- At least one special character

### Uploading Profile Picture
1. Click on your avatar
2. Click **Change Picture**
3. Select image file (JPG, PNG)
4. Crop if needed
5. Click **Upload**

---

## Tips & Best Practices

### For Students
✓ Check your timetable daily for updates
✓ Read messages from teachers promptly
✓ RSVP to events you plan to attend
✓ Keep your contact information updated
✓ Report absences in advance

### For Teachers
✓ Keep your timetable up to date
✓ Respond to student messages within 24 hours
✓ Review absence requests regularly
✓ Post important announcements via messages
✓ Use events for assignment deadlines

### For Administrators
✓ Regularly backup the database
✓ Monitor system analytics for issues
✓ Review new user accounts promptly
✓ Keep academic data (rooms, subjects) current
✓ Ensure all departments have heads assigned

---

## Troubleshooting

### Can't Login
- Verify CIN is correct (check with admin)
- Ensure password is exact (case-sensitive)
- Clear browser cache and cookies
- Try a different browser
- Contact system administrator

### Page Not Loading
- Check internet connection
- Refresh the page (Ctrl+R or Cmd+R)
- Clear browser cache
- Try incognito/private mode
- Check if server is running

### Messages Not Sending
- Check recipient is valid
- Ensure subject and message are filled
- Try refreshing the page
- Check network connection
- Contact support if persists

### Timetable Not Showing
- Verify you're assigned to a group (students)
- Check that sessions exist for your group
- Refresh the page
- Try different date range
- Contact administrator

### Changes Not Saving
- Ensure all required fields are filled
- Check for error messages
- Verify you have permission for that action
- Try logging out and back in
- Contact system administrator

---

## Getting Help

### Support Channels
1. **In-App Help:** Click the ? icon
2. **Email Support:** support@university.edu
3. **Help Desk:** Visit Room 101, Admin Building
4. **Phone:** +212 XXX-XXXXXX

### Reporting Bugs
When reporting issues, include:
- What you were trying to do
- What happened instead
- Browser and version
- Screenshots if possible
- Error messages (if any)

### Feature Requests
Have an idea to improve the platform?
- Email: feedback@university.edu
- Describe the feature clearly
- Explain the benefit
- Provide examples if possible

---

## Keyboard Shortcuts

### Global
- `Ctrl/Cmd + K`: Quick search
- `Ctrl/Cmd + /`: Show shortcuts
- `Esc`: Close modals/dialogs

### Navigation
- `G + D`: Go to Dashboard
- `G + M`: Go to Messages
- `G + S`: Go to Schedule
- `G + E`: Go to Events
- `G + T`: Go to Events (Timetable)

### Actions
- `N`: New message (on messages page)
- `C`: Compose (on messages page)
- `R`: Reply (when message open)
- `/`: Focus search bar

---

## Appendix

### Role Permissions Matrix

| Feature | Student | Teacher | Dept Head | Admin |
|---------|---------|---------|-----------|-------|
| View Dashboard | ✓ | ✓ | ✓ | ✓ |
| View Timetable | Own | Own | All | All |
| Send Messages | ✓ | ✓ | ✓ | ✓ |
| Create Events | ✗ | ✓ | ✓ | ✓ |
| Manage Users | ✗ | ✗ | Dept | All |
| Manage Academic | ✗ | ✗ | Dept | All |
| View Analytics | ✗ | ✗ | ✓ | ✓ |
| System Settings | ✗ | ✗ | ✗ | ✓ |

### Glossary

- **CIN:** Carte d'Identité Nationale (National ID)
- **CRUD:** Create, Read, Update, Delete
- **RSVP:** Répondez s'il vous plaît (Please respond)
- **Admin:** Administrator
- **Dept:** Department

---

**Last Updated:** December 2024  
**Version:** 1.0.0  
**Platform:** University Management System
