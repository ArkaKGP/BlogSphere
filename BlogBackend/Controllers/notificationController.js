const Notification = require('../models/Notification');

// Get all notifications for a recipient user
const getNotifications = async (req, res) => {
  const { username } = req.params;
  try {
    const notifications = await Notification.find({ recipientUsername: username })
      .sort({ createdAt: -1 })
      .limit(30);
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mark a single notification as read
const markAsRead = async (req, res) => {
  const { id } = req.params;
  try {
    const updated = await Notification.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true }
    );
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete notification
const deleteNotification = async (req, res) => {
  const { id } = req.params;
  try {
    await Notification.findByIdAndDelete(id);
    res.status(200).json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  deleteNotification,
};
