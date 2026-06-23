import express from 'express';
import notificationController from '../controller/notificationController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import authorizeRole from '../middlewares/roleMiddleware.js';

const router = express.Router();

// Apply authMiddleware globally to all notification routes
router.use(authMiddleware);

// Admin route
router.post('/system', authorizeRole('admin'), notificationController.sendSystemNotification);

// User notification routes
router.put('/mark-all-read', notificationController.markAllAsRead);

router.post('/', notificationController.createNotification);
router.get('/', notificationController.getUserNotifications);
router.get('/:id', notificationController.getNotificationById);
router.put('/:id', notificationController.updateNotification);
router.delete('/:id', notificationController.deleteNotification);

export default router;