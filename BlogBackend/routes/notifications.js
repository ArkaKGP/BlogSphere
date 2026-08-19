const express = require('express');
const {
  getNotifications,
  markAsRead,
  deleteNotification,
} = require('../Controllers/notificationController');

const router = express.Router();

router.get('/:username', getNotifications);
router.patch('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);

module.exports = router;
