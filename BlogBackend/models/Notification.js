const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipientUsername: {
      type: String,
      required: true,
      index: true,
    },
    senderUsername: {
      type: String,
      required: true,
    },
    blogId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Blog',
      required: true,
    },
    blogTitle: {
      type: String,
      default: '',
    },
    message: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
