const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/authMiddleware');
const {
  getUsers,
  getConversations,
  getOrCreateConversation,
  getMessages,
} = require('../Controllers/chatController');

// All chat routes are protected by JWT authentication middleware
router.use(requireAuth);

// Get list of all users to start a conversation
router.get('/users', getUsers);

// Get all conversations for current user
router.get('/conversations', getConversations);

// Get or create conversation with a specific user
router.get('/conversations/with/:targetUserId', getOrCreateConversation);

// Get messages for a specific conversation
router.get('/messages/:conversationId', getMessages);

module.exports = router;
