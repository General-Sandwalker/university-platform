import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import departmentRoutes from './department.routes';
import roomRoutes from './room.routes';
import specialtyRoutes from './specialty.routes';
import levelRoutes from './level.routes';
import groupRoutes from './group.routes';
import subjectRoutes from './subject.routes';
import timetableRoutes from './timetable.routes';
import absenceRoutes from './absence.routes';
import messageRoutes from './message.routes';
import notificationRoutes from './notification.routes';
import analyticsRoutes from './analytics.routes';
import eventRoutes from './event.routes';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'University Platform API is running',
    timestamp: new Date().toISOString(),
  });
});

// Mount route modules
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/departments', departmentRoutes);
router.use('/rooms', roomRoutes);
router.use('/specialties', specialtyRoutes);
router.use('/levels', levelRoutes);
router.use('/groups', groupRoutes);
router.use('/subjects', subjectRoutes);
router.use('/timetable', timetableRoutes);
router.use('/absences', absenceRoutes);
router.use('/messages', messageRoutes);
router.use('/notifications', notificationRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/events', eventRoutes);

export default router;
