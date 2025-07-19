const asyncHandler = require('express-async-handler');
const { Notification } = require('../models');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, type, isRead } = req.query;
  const userId = req.user.id;

  // Build query
  const query = { user: userId };

  if (type) {
    query.type = type;
  }

  if (isRead !== undefined) {
    query.isRead = isRead === 'true';
  }

  // Get notifications with pagination
  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Notification.countDocuments(query);
  const unreadCount = await Notification.countDocuments({
    user: userId,
    isRead: false
  });

  res.json({
    success: true,
    data: {
      notifications,
      unreadCount,
      pagination: {
        current: parseInt(page, 10),
        pages: Math.ceil(total / limit),
        total
      }
    }
  });
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    user: req.user.id
  });

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notifikasi tidak ditemukan'
    });
  }

  await notification.markAsRead();

  res.json({
    success: true,
    message: 'Notifikasi berhasil ditandai telah dibaca',
    data: { notification }
  });
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/mark-all-read
// @access  Private
exports.markAllAsRead = asyncHandler(async (req, res) => {
  const result = await Notification.markAllAsRead(req.user.id);

  res.json({
    success: true,
    message: `${result.modifiedCount} notifikasi berhasil ditandai telah dibaca`
  });
});

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    user: req.user.id
  });

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notifikasi tidak ditemukan'
    });
  }

  await Notification.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Notifikasi berhasil dihapus'
  });
});

// @desc    Delete all read notifications
// @route   DELETE /api/notifications/clear-read
// @access  Private
exports.clearReadNotifications = asyncHandler(async (req, res) => {
  const result = await Notification.deleteMany({
    user: req.user.id,
    isRead: true
  });

  res.json({
    success: true,
    message: `${result.deletedCount} notifikasi yang telah dibaca berhasil dihapus`
  });
});

// @desc    Get notification statistics
// @route   GET /api/notifications/stats
// @access  Private
exports.getNotificationStats = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const [totalNotifications, unreadCount, typeStats] = await Promise.all([
    Notification.countDocuments({ user: userId }),
    Notification.countDocuments({ user: userId, isRead: false }),
    Notification.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ])
  ]);

  const stats = {
    total: totalNotifications,
    unread: unreadCount,
    read: totalNotifications - unreadCount,
    byType: typeStats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {})
  };

  res.json({
    success: true,
    data: { stats }
  });
});

// @desc    Create notification (Admin only)
// @route   POST /api/notifications/broadcast
// @access  Private (Admin)
exports.broadcastNotification = asyncHandler(async (req, res) => {
  const {
    title,
    message,
    type = 'info',
    priority = 'medium',
    userIds
  } = req.body;
  const { User } = require('../models');

  let targetUsers = [];

  if (userIds && userIds.length > 0) {
    // Send to specific users
    targetUsers = userIds;
  } else {
    // Send to all users
    const allUsers = await User.find({ role: 'karyawan' }).select('_id');
    targetUsers = allUsers.map((user) => user._id);
  }

  // Create notifications for all target users
  const notifications = targetUsers.map((userId) => ({
    user: userId,
    title,
    message,
    type,
    priority,
    data: {
      broadcast: true,
      sentBy: req.user.id,
      sentAt: new Date()
    }
  }));

  await Notification.insertMany(notifications);

  res.status(201).json({
    success: true,
    message: `Notifikasi berhasil dikirim ke ${targetUsers.length} pengguna`,
    data: {
      recipientCount: targetUsers.length
    }
  });
});
