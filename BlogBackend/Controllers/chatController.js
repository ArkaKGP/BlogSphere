const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/usermodel');

// 1. Get all registered users except currently logged-in user
exports.getUsers = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const users = await User.find({ _id: { $ne: currentUserId } }).select('-password');
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// 2. Fetch all conversations for the logged-in user
exports.getConversations = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const conversations = await Conversation.find({
      participants: currentUserId,
    })
      .populate('participants', 'username email')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });

    res.status(200).json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
};

// 3. Get or Create a 1-on-1 Conversation with a target user
exports.getOrCreateConversation = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const { targetUserId } = req.params;

    if (!targetUserId) {
      return res.status(400).json({ error: 'Target user ID is required' });
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [currentUserId, targetUserId] },
    })
      .populate('participants', 'username email')
      .populate('lastMessage');

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [currentUserId, targetUserId],
      });
      conversation = await conversation.populate('participants', 'username email');
    }

    res.status(200).json(conversation);
  } catch (error) {
    console.error('Error getting/creating conversation:', error);
    res.status(500).json({ error: 'Failed to access conversation' });
  }
};

// 4. Fetch all messages for a specific conversation ID
exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });
    res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};
