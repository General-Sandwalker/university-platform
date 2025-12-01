import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validator';
import {
  createTimetableSchema,
  updateTimetableSchema,
} from '../validators/schemas';
import {
  createTimetable,
  getTimetableByGroup,
  getTimetableById,
  updateTimetable,
  deleteTimetable,
  getAccessibleGroups,
  getMyTeachingSchedule,
} from '../controllers/timetable.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get groups accessible to the current user
router.get('/accessible-groups', getAccessibleGroups);

// Get teacher's teaching schedule
router.get('/my-schedule', getMyTeachingSchedule);

// Get timetable for a specific group
router.get('/group/:groupId', getTimetableByGroup);

// Get specific timetable entry
router.get('/:id', getTimetableById);

// Create timetable entry (admin and department_head only)
router.post('/', validate(createTimetableSchema), createTimetable);

// Update timetable entry (admin and department_head only)
router.put('/:id', validate(updateTimetableSchema), updateTimetable);

// Delete timetable entry (admin and department_head only)
router.delete('/:id', deleteTimetable);

export default router;
