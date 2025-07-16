const mongoose = require('mongoose');
const User = require('../models/User');
const Notification = require('../models/Notification');
const asyncHandler = require('express-async-handler');

// @desc    Get all notifications for user
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({
    recipient: req.user._id,
    recipientModel: req.user.role // 'Doctor', 'LabAssistant', etc.
  })
    .sort({ createdAt: -1 })
    .limit(50)
    .populate('sender', 'firstName lastName')
    .populate('recipient', 'firstName lastName');

  res.json({ notifications });
});

// @desc    Mark notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
exports.markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    {
      _id: req.params.id,
      recipient: req.user._id
    },
    {
      status: 'read',
      readAt: Date.now()
    },
    { new: true }
  );

  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }

  res.json({ notification });
});

// @desc    Create notification (used internally)
// @route   POST /api/notifications
// @access  Private/System
// @desc    Create notification (used internally)
// @route   POST /api/notifications
// @access  Private/System

exports.createNotification = asyncHandler(async (req, res) => {
  const { recipient, recipientModel, sender, senderModel, type, message, relatedEntity, relatedEntityId } = req.body;

  // Validate recipient exists
  const Model = mongoose.model(recipientModel);
  const recipientExists = await Model.exists({ _id: recipient });
  if (!recipientExists) {
    return res.status(400).json({ error: 'Recipient not found' });
  }

  const notification = await Notification.create({
    recipient,
    recipientModel,
    sender,
    senderModel,
    type,
    message,
    relatedEntity,
    relatedEntityId,
    status: 'unread'
  });

  // Emit to specific recipient
  const io = req.app.get('socketio');
  io.to(recipient.toString()).emit('new-notification', notification);

  res.status(201).json({ notification });
});

// Add this new endpoint for broadcasting to roles
exports.broadcastToRole = asyncHandler(async (req, res) => {
  const { role, sender, senderModel, type, message, relatedEntity, relatedEntityId } = req.body;

  // Get all users with this role
  const users = await User.find({ role }).select('_id');
  if (users.length === 0) {
    return res.status(400).json({ error: 'No users with this role found' });
  }

  // Create notifications for each user
  const notifications = await Promise.all(users.map(user => 
    Notification.create({
      recipient: user._id,
      recipientModel: 'User',
      sender,
      senderModel,
      type,
      message,
      relatedEntity,
      relatedEntityId,
      status: 'unread'
    })
  ));

  // Emit to each user
  const io = req.app.get('socketio');
  notifications.forEach(notification => {
    io.to(notification.recipient.toString()).emit('new-notification', notification);
  });

  res.status(201).json({ notifications });
});