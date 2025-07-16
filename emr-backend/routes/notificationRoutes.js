const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { protect } = require('../middlewares/authMiddleware');

router.route('/')
  .get(protect, notificationController.getNotifications)
  .post(protect, notificationController.createNotification);

router.route('/:id/read')
  .patch(protect, notificationController.markAsRead);

module.exports = router;

