import express from 'express';
import {
  getUserNotifications,
  markNotificationRead
} from '../controllers/notificationControllers.js';

const router = express.Router();

router.get('/:userId', getUserNotifications);
router.put('/read/:id', markNotificationRead);

export default router;
