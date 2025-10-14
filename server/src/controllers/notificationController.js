const Notification = require('../models/Notification');
const User = require('../models/user');

// Create notification
const createNotification = async (userId, title, message, type = 'system', orderId = null) => {
  try {
    const notification = await Notification.create({
      user: userId,
      title,
      message,
      type,
      orderId
    });
    return notification;
  } catch (err) {
    console.error('Create Notification Error:', err);
    throw err;
  }
};

// Get user's notifications
const getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort('-createdAt')
      .limit(50);

    res.json({
      message: 'Notifications fetched successfully',
      notifications
    });
  } catch (err) {
    console.error('Get Notifications Error:', err);
    res.status(500).json({ message: 'Error fetching notifications' });
  }
};

// Mark notification as read
const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findOne({
      _id: notificationId,
      user: req.user._id
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.isRead = true;
    await notification.save();

    res.json({
      message: 'Notification marked as read',
      notification
    });
  } catch (err) {
    console.error('Mark Notification Read Error:', err);
    res.status(500).json({ message: 'Error marking notification as read' });
  }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { isRead: true }
    );

    res.json({
      message: 'All notifications marked as read'
    });
  } catch (err) {
    console.error('Mark All Notifications Read Error:', err);
    res.status(500).json({ message: 'Error marking notifications as read' });
  }
};

// Delete notification
const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findOne({
      _id: notificationId,
      user: req.user._id
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    await notification.deleteOne();

    res.json({
      message: 'Notification deleted successfully'
    });
  } catch (err) {
    console.error('Delete Notification Error:', err);
    res.status(500).json({ message: 'Error deleting notification' });
  }
};

// Clear all notifications
const clearAllNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({ user: req.user._id });

    res.json({
      message: 'All notifications cleared'
    });
  } catch (err) {
    console.error('Clear Notifications Error:', err);
    res.status(500).json({ message: 'Error clearing notifications' });
  }
};

// Get unread count
const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      user: req.user._id,
      isRead: false
    });

    res.json({
      message: 'Unread count fetched successfully',
      count
    });
  } catch (err) {
    console.error('Get Unread Count Error:', err);
    res.status(500).json({ message: 'Error getting unread count' });
  }
};

module.exports = {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
  getUnreadCount
}; 