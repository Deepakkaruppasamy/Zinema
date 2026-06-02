import express from 'express';
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  createNotification,
  getAllNotifications,
  updateNotification,
  deleteNotification,
  getNotificationStats
} from '../controllers/notificationController.js';

const notificationRouter = express.Router();

notificationRouter.get('/', getUserNotifications);
notificationRouter.put('/:notificationId/read', markNotificationAsRead);
notificationRouter.put('/read-all', markAllNotificationsAsRead);

notificationRouter.post('/', createNotification);
notificationRouter.get('/admin/all', getAllNotifications);
notificationRouter.put('/admin/:notificationId', updateNotification);
notificationRouter.delete('/admin/:notificationId', deleteNotification);
notificationRouter.get('/admin/stats', getNotificationStats);

export default notificationRouter;
