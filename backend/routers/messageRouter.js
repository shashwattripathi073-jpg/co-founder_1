const express = require('express');
const Message = require('../models/messageModel');
const User = require('../models/userModel');
const { verifyToken } = require('../middlewares/auth');

const router = express.Router();

/* ==================== MODULE 10: COMMUNICATION & CHAT ==================== */

// Send message
router.post('/send', verifyToken, async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const conversationId = Message.getConversationId(req.user._id, receiverId);

    const message = new Message({
      senderId: req.user._id,
      receiverId,
      conversationId,
      content
    });

    const saved = await message.save();
    const populated = await saved.populate('senderId', 'name avatar');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to send message.', error: err.message });
  }
});

// Get conversations list
router.get('/conversations', verifyToken, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get all unique conversation IDs for this user
    const messages = await Message.aggregate([
      { $match: { $or: [{ senderId: userId }, { receiverId: userId }] } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$conversationId',
          lastMessage: { $first: '$content' },
          lastMessageAt: { $first: '$createdAt' },
          senderId: { $first: '$senderId' },
          receiverId: { $first: '$receiverId' },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$receiverId', userId] }, { $eq: ['$readAt', null] }] },
                1, 0
              ]
            }
          }
        }
      },
      { $sort: { lastMessageAt: -1 } }
    ]);

    // Get the other user's info for each conversation
    const conversations = await Promise.all(messages.map(async (msg) => {
      const otherUserId = msg.senderId.toString() === userId.toString()
        ? msg.receiverId : msg.senderId;
      const otherUser = await User.findById(otherUserId).select('name avatar headline');
      return {
        conversationId: msg._id,
        otherUser,
        lastMessage: msg.lastMessage,
        lastMessageAt: msg.lastMessageAt,
        unreadCount: msg.unreadCount
      };
    }));

    res.status(200).json(conversations);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch conversations.', error: err.message });
  }
});

// Get messages for a conversation
router.get('/:conversationId', verifyToken, async (req, res) => {
  try {
    const messages = await Message.find({ conversationId: req.params.conversationId })
      .populate('senderId', 'name avatar')
      .sort({ createdAt: 1 });

    // Mark messages as read
    await Message.updateMany(
      { conversationId: req.params.conversationId, receiverId: req.user._id, readAt: null },
      { readAt: new Date() }
    );

    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch messages.', error: err.message });
  }
});

module.exports = router;
