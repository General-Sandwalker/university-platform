# Academic Pages Quick Start Guide

## 🎯 Overview
This guide provides a quick reference for using all 6 academic management pages.

---

## 🏢 Departments

**URL:** `/departments`  
**Access:** Administrators, Department Heads

### Quick Actions
- **View All:** Opens automatically when you navigate
- **Search:** Type in search bar (filters by name)
- **Add New:** Click "Add Department" button (top right)
- **Edit:** Click pencil icon on any card
- **Delete:** Click trash icon (confirmation required)

### Required Fields
- Name (e.g., "Computer Science")
- Code (e.g., "CS")

### Optional Fields
- Description
- Head of Department
- Building
- Phone
- Email

---

## 🎓 Specialties

**URL:** `/specialties`  
**Access:** Administrators, Department Heads

### Quick Actions
Same as Departments (search, add, edit, delete)

### Required Fields
- Name (e.g., "Software Engineering")
- Code (e.g., "SE")
- **Department** (select from dropdown)
- **Duration in Years** (e.g., 3 or 5)

### Optional Fields
- Description

### Note
Specialties belong to departments. You must create departments first.

---

## 📊 Levels

**URL:** `/levels`  
**Access:** Administrators

### Quick Actions
Same as above

### Required Fields
- Name (e.g., "First Year")
- Code (e.g., "L1")
- **Display Order** (number for sorting, e.g., 1, 2, 3)

### Optional Fields
- Description

### Note
Lower order numbers appear first in lists.

---

## 👥 Groups

**URL:** `/groups`  
**Access:** Administrators, Department Heads

### Quick Actions
Same as above

### Required Fields
- Name (e.g., "Group A")
- Code (e.g., "GA")
- **Level** (select from dropdown)
- **Specialty** (select from dropdown)
- **Capacity** (number of students, e.g., 30)
- **Academic Year** (e.g., "2023-2024")

### Note
You must create levels and specialties first.

---

## 📚 Subjects

**URL:** `/subjects`  
**Access:** Administrators, Department Heads

### Quick Actions
Same as above

### Required Fields
- Name (e.g., "Data Structures")
- Code (e.g., "CS201")
- **Credits** (1-10)
- **Hours per Week** (1-20)
- **Department** (select from dropdown)
- **Semester** (1 or 2)

### Optional Fields
- Description

---

## 🚪 Rooms

**URL:** `/rooms`  
**Access:** Administrators

### Quick Actions
Same as above

### Required Fields
- Name (e.g., "Room 101")
- Code (e.g., "R101")
- Building (e.g., "Building A")
- **Capacity** (number of seats)
- **Type** (select from dropdown):
  - Classroom
  - Laboratory
  - Amphitheater
  - Office
  - Conference Room

### Optional Fields
- Floor
- Equipment

---

## 🔄 Common Workflow

### Creating Related Entities (Order Matters)

1. **First, create:**
   - Departments
   - Levels

2. **Then create:**
   - Specialties (requires Departments)
   - Rooms

3. **Then create:**
   - Subjects (requires Departments)
   - Groups (requires Levels + Specialties)

4. **Finally:**
   - Assign users to departments/specialties/groups
   - Create timetable sessions using subjects, rooms, groups

---

## 💡 Tips

### Search
- Search works on name and code
- Real-time filtering (no need to press enter)
- Case-insensitive

### Editing
- Click edit icon on card
- Same form as creation
- Changes save immediately
- Toast notification confirms success

### Deleting
- Click trash icon
- Confirmation popup appears
- Cannot undo deletion
- Related data may be affected

### Validation
- Required fields marked with *
- Red border if field invalid
- Can't submit until valid
- Helpful error messages

---

## ⚠️ Important Notes

### Departments
- Used by: Specialties, Subjects, Users
- Deleting removes relationships
- At least one recommended

### Specialties
- Must have a department
- Used by: Groups, Users
- Duration affects academic planning

### Levels
- Order determines display
- Used by: Groups
- Typically 3-5 levels

### Groups
- Must have level + specialty
- Used by: Users, Timetable
- Capacity is important for room assignment

### Subjects
- Must have department
- Credits affect workload
- Hours used in timetable planning

### Rooms
- Type determines usage
- Capacity must match group sizes
- Equipment helps in assignment

---

## 🎨 UI Elements

### Card Colors
- **Departments:** Blue icon background
- **Specialties:** Green icon background
- **Levels:** Indigo icon background
- **Groups:** Purple icon background
- **Subjects:** Blue icon background
- **Rooms:** Orange icon background

### Buttons
- **Blue:** Primary actions (Create, Update)
- **Gray:** Secondary actions (Cancel)
- **Red:** Destructive actions (Delete)

### Icons
- **Pencil:** Edit
- **Trash:** Delete
- **Plus:** Create new
- **Search:** Search/filter
- **X:** Close modal

---

## 🚨 Troubleshooting

### Can't create entity
- Check all required fields filled
- Verify dropdowns have selections
- Ensure related entities exist
- Check browser console for errors

### Changes not saving
- Wait for loading spinner
- Check internet connection
- Verify you have permissions
- Try refreshing page

### Can't delete entity
- May have dependent data
- Check if used in timetable
- Verify permissions
- Contact administrator

### Search not working
- Clear and retype
- Check spelling
- Try code instead of name
- Refresh page

---

## 📱 Mobile Usage

### Best Practices
- Use portrait mode
- Tap to open modals
- Swipe to scroll long forms
- Pinch to zoom if needed

### Grid Layout
- **Mobile:** 1 column
- **Tablet:** 2 columns
- **Desktop:** 3-4 columns

---

## ⌨️ Keyboard Shortcuts

### Global
- `Esc` - Close modal
- `Ctrl/Cmd + F` - Focus search

### Forms
- `Tab` - Next field
- `Shift + Tab` - Previous field
- `Enter` - Submit form

---

## 📞 Need Help?

1. Check **USER_GUIDE.md** for detailed instructions
2. Check **ARCHITECTURE.md** for technical details
3. Ask your system administrator
4. Check browser console (F12) for errors

---

## ✅ Checklist for New Semester

Before starting a new semester:

### Setup Academic Structure
- [ ] Create/update departments
- [ ] Create/update specialties
- [ ] Create levels (if new)
- [ ] Update academic year in groups
- [ ] Add new groups if needed
- [ ] Add/update subjects for semester
- [ ] Verify room availability

### Assign Users
- [ ] Add new students
- [ ] Assign students to groups
- [ ] Add new teachers
- [ ] Assign teachers to departments
- [ ] Update user roles if needed

### Create Schedule
- [ ] Plan subject distribution
- [ ] Assign rooms to groups
- [ ] Create timetable sessions
- [ ] Verify no conflicts
- [ ] Publish schedule

---

**Quick Reference Version:** 1.0.0  
**Last Updated:** December 2024  
**For:** University Platform v1.0.0
