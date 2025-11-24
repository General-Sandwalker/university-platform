#!/bin/bash

# Fix AppError parameter order in all service files
# Correct format: new AppError(statusCode, message)
# Wrong format: new AppError(message, statusCode)

cd "$(dirname "$0")/.." || exit 1

echo "Fixing AppError parameter order..."

# Fix specialty.service.ts
sed -i "s/new AppError('Department not found', 404)/new AppError(404, 'Department not found')/g" src/services/specialty.service.ts
sed -i "s/new AppError('Specialty code already exists', 400)/new AppError(400, 'Specialty code already exists')/g" src/services/specialty.service.ts
sed -i "s/new AppError('Specialty not found', 404)/new AppError(404, 'Specialty not found')/g" src/services/specialty.service.ts

# Fix level.service.ts
sed -i "s/new AppError('Specialty not found', 404)/new AppError(404, 'Specialty not found')/g" src/services/level.service.ts
sed -i "s/new AppError('Level code already exists for this specialty', 400)/new AppError(400, 'Level code already exists for this specialty')/g" src/services/level.service.ts
sed -i "s/new AppError('Level not found', 404)/new AppError(404, 'Level not found')/g" src/services/level.service.ts

# Fix group.service.ts
sed -i "s/new AppError('Level not found', 404)/new AppError(404, 'Level not found')/g" src/services/group.service.ts
sed -i "s/new AppError('Group code already exists for this level', 400)/new AppError(400, 'Group code already exists for this level')/g" src/services/group.service.ts
sed -i "s/new AppError('Group not found', 404)/new AppError(404, 'Group not found')/g" src/services/group.service.ts
sed -i "s/new AppError('Group is at full capacity', 400)/new AppError(400, 'Group is at full capacity')/g" src/services/group.service.ts
sed -i "s/new AppError('Student not found', 404)/new AppError(404, 'Student not found')/g" src/services/group.service.ts
sed -i "s/new AppError('User is not a student', 400)/new AppError(400, 'User is not a student')/g" src/services/group.service.ts
sed -i "s/new AppError('Student is not in this group', 400)/new AppError(400, 'Student is not in this group')/g" src/services/group.service.ts

# Fix subject.service.ts
sed -i "s/new AppError('Specialty not found', 404)/new AppError(404, 'Specialty not found')/g" src/services/subject.service.ts
sed -i "s/new AppError('Level not found', 404)/new AppError(404, 'Level not found')/g" src/services/subject.service.ts
sed -i "s/new AppError('Level does not belong to the specified specialty', 400)/new AppError(400, 'Level does not belong to the specified specialty')/g" src/services/subject.service.ts
sed -i "s/new AppError('Subject code already exists for this specialty', 400)/new AppError(400, 'Subject code already exists for this specialty')/g" src/services/subject.service.ts
sed -i "s/new AppError('Teacher not found', 404)/new AppError(404, 'Teacher not found')/g" src/services/subject.service.ts
sed -i "s/new AppError('User is not a teacher', 400)/new AppError(400, 'User is not a teacher')/g" src/services/subject.service.ts
sed -i "s/new AppError('Subject not found', 404)/new AppError(404, 'Subject not found')/g" src/services/subject.service.ts

# Fix timetable.service.ts
sed -i "s/new AppError('Subject not found', 404)/new AppError(404, 'Subject not found')/g" src/services/timetable.service.ts
sed -i "s/new AppError('Teacher not found or invalid role', 404)/new AppError(404, 'Teacher not found or invalid role')/g" src/services/timetable.service.ts
sed -i "s/new AppError('Room not found', 404)/new AppError(404, 'Room not found')/g" src/services/timetable.service.ts
sed -i "s/new AppError('Group not found', 404)/new AppError(404, 'Group not found')/g" src/services/timetable.service.ts
sed -i "s/new AppError('Invalid time format. Use HH:MM', 400)/new AppError(400, 'Invalid time format. Use HH:MM')/g" src/services/timetable.service.ts
sed -i "s/new AppError('Start time must be before end time', 400)/new AppError(400, 'Start time must be before end time')/g" src/services/timetable.service.ts
sed -i "s/new AppError('Invalid date format', 400)/new AppError(400, 'Invalid date format')/g" src/services/timetable.service.ts
sed -i "s/new AppError('Timetable entry not found', 404)/new AppError(404, 'Timetable entry not found')/g" src/services/timetable.service.ts
sed -i "s/new AppError('Student not found', 404)/new AppError(404, 'Student not found')/g" src/services/timetable.service.ts
sed -i "s/new AppError('Room is already booked at this time', 409)/new AppError(409, 'Room is already booked at this time')/g" src/services/timetable.service.ts

# Fix absence.service.ts
sed -i "s/new AppError('Student not found', 404)/new AppError(404, 'Student not found')/g" src/services/absence.service.ts
sed -i "s/new AppError('User is not a student', 400)/new AppError(400, 'User is not a student')/g" src/services/absence.service.ts
sed -i "s/new AppError('Timetable entry not found', 404)/new AppError(404, 'Timetable entry not found')/g" src/services/absence.service.ts
sed -i "s/new AppError('Invalid teacher', 400)/new AppError(400, 'Invalid teacher')/g" src/services/absence.service.ts
sed -i "s/new AppError('Absence already recorded for this session', 400)/new AppError(400, 'Absence already recorded for this session')/g" src/services/absence.service.ts
sed -i "s/new AppError('Absence record not found', 404)/new AppError(404, 'Absence record not found')/g" src/services/absence.service.ts
sed -i "s/new AppError('Not authorized to submit excuse for this absence', 403)/new AppError(403, 'Not authorized to submit excuse for this absence')/g" src/services/absence.service.ts
sed -i "s/new AppError('Teacher not found', 404)/new AppError(404, 'Teacher not found')/g" src/services/absence.service.ts
sed -i "s/new AppError('Not authorized to review this excuse', 403)/new AppError(403, 'Not authorized to review this excuse')/g" src/services/absence.service.ts
sed -i "s/new AppError('User not found', 404)/new AppError(404, 'User not found')/g" src/services/absence.service.ts
sed -i "s/new AppError('Not authorized to delete this absence record', 403)/new AppError(403, 'Not authorized to delete this absence record')/g" src/services/absence.service.ts

# Fix message.service.ts
sed -i "s/new AppError('Sender not found', 404)/new AppError(404, 'Sender not found')/g" src/services/message.service.ts
sed -i "s/new AppError('Receiver not found', 404)/new AppError(404, 'Receiver not found')/g" src/services/message.service.ts
sed -i "s/new AppError('Cannot send message to yourself', 400)/new AppError(400, 'Cannot send message to yourself')/g" src/services/message.service.ts
sed -i "s/new AppError('Message not found', 404)/new AppError(404, 'Message not found')/g" src/services/message.service.ts
sed -i "s/new AppError('Not authorized to view this message', 403)/new AppError(403, 'Not authorized to view this message')/g" src/services/message.service.ts
sed -i "s/new AppError('Only receiver can mark message as read', 403)/new AppError(403, 'Only receiver can mark message as read')/g" src/services/message.service.ts
sed -i "s/new AppError('Not authorized to delete this message', 403)/new AppError(403, 'Not authorized to delete this message')/g" src/services/message.service.ts

# Fix notification.service.ts
sed -i "s/new AppError('User not found', 404)/new AppError(404, 'User not found')/g" src/services/notification.service.ts
sed -i "s/new AppError('Notification not found', 404)/new AppError(404, 'Notification not found')/g" src/services/notification.service.ts
sed -i "s/new AppError('Not authorized to view this notification', 403)/new AppError(403, 'Not authorized to view this notification')/g" src/services/notification.service.ts
sed -i "s/new AppError('Not authorized to delete this notification', 403)/new AppError(403, 'Not authorized to delete this notification')/g" src/services/notification.service.ts

# Fix analytics.service.ts
sed -i "s/new AppError('Student not found', 404)/new AppError(404, 'Student not found')/g" src/services/analytics.service.ts
sed -i "s/new AppError('Unsupported export type', 400)/new AppError(400, 'Unsupported export type')/g" src/services/analytics.service.ts

echo "Done! AppError parameter order fixed in all service files."
