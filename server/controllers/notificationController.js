const asyncHandler = require('express-async-handler');
const Notification = require('../models/Notification');

// @desc    Get notifications for user
// @route   GET /api/notifications
// @access  Private
const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.json(notifications);
});

// @desc    Mark notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
const markRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  if (!notification) {
    res.status(404); throw new Error('Notification not found');
  }
  if (notification.user.toString() !== req.user.id) {
    res.status(401); throw new Error('Not authorized');
  }
  notification.read = true;
  await notification.save();
  res.json(notification);
});

module.exports = { getNotifications, markRead };
