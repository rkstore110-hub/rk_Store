const express = require('express');
const notificationRouter = express.Router();
const {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
  getUnreadCount
} = require('../controllers/notificationController');
const userMiddleware = require('../middleware/userMiddleware');

// All routes require user authentication
notificationRouter.use(userMiddleware);

// Get user's notifications
notificationRouter.get('/', getUserNotifications);

// Get unread count
notificationRouter.get('/unread-count', getUnreadCount);

// Mark notification as read
notificationRouter.patch('/:notificationId/read', markAsRead);

// Mark all notifications as read
notificationRouter.patch('/mark-all-read', markAllAsRead);

// Delete notification
notificationRouter.delete('/:notificationId', deleteNotification);

// Clear all notifications
notificationRouter.delete('/clear-all', clearAllNotifications);

module.exports = notificationRouter; 