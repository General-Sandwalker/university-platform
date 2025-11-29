import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validator';
import {
  createSemesterSchema,
  updateSemesterSchema,
} from '../validators/schemas';
import {
  createSemester,
  getAllSemesters,
  getActiveSemester,
  getSemesterById,
  updateSemester,
  deleteSemester,
  setActiveSemester,
} from '../controllers/semester.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all semesters
router.get('/', getAllSemesters);

// Get active semester
router.get('/active', getActiveSemester);

// Get semester by ID
router.get('/:id', getSemesterById);

// Create semester (admin only)
router.post('/', validate(createSemesterSchema), createSemester);

// Update semester (admin only)
router.put('/:id', validate(updateSemesterSchema), updateSemester);

// Set active semester (admin only)
router.patch('/:id/activate', setActiveSemester);

// Delete semester (admin only)
router.delete('/:id', deleteSemester);

export default router;
