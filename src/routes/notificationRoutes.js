const express = require('express');
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearReadNotifications,
  getNotificationStats,
  broadcastNotification
} = require('../controllers/notificationController');
const { authenticate, adminOnly } = require('../middlewares/auth');
const {
  validate,
  broadcastNotificationSchema
} = require('../middlewares/validation');

const router = express.Router();

// All routes are protected
router.use(authenticate);

// User notification routes
router.get('/', getNotifications);
router.get('/stats', getNotificationStats);
router.put('/:id/read', markAsRead);
router.put('/mark-all-read', markAllAsRead);
router.delete('/:id', deleteNotification);
router.delete('/clear-read', clearReadNotifications);

// Admin only routes
router.post(
  '/broadcast',
  adminOnly,
  validate(broadcastNotificationSchema),
  broadcastNotification
);

module.exports = router;
