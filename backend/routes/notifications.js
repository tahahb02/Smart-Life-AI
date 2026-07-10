import { Router } from 'express';
import { protect, verifiedOnly } from '../middlewares/auth.js';
import {
  getNotifications, markAsRead, markAllAsRead, deleteNotification,
} from '../controllers/notificationController.js';

const router = Router();

router.get('/', protect, verifiedOnly, getNotifications);
router.put('/read-all', protect, verifiedOnly, markAllAsRead);
router.put('/:id/read', protect, verifiedOnly, markAsRead);
router.delete('/:id', protect, verifiedOnly, deleteNotification);

export default router;
