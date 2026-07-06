const express = require('express');
const router = express.Router();
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

// GET /api/chats - Fetch user conversation list
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query; // Assume passed via query for simplicity
    // Filter out chats hidden for this user
    const conversations = await Conversation.find({ 
      participants: userId,
      hiddenFor: { $ne: userId }
    })
      .populate('participants', '-password')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });

    // Calculate unread count for each conversation
    const conversationsWithUnread = await Promise.all(conversations.map(async (conv) => {
      const unreadCount = await Message.countDocuments({
        conversationId: conv._id,
        senderId: { $ne: userId },
        status: { $ne: 'read' }
      });
      return {
        ...conv.toObject(),
        unreadCount
      };
    }));

    res.json(conversationsWithUnread);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/chats - Create a new chat or get existing
router.post('/', async (req, res) => {
  try {
    const { participants } = req.body;
    if (!participants || participants.length < 2) {
      return res.status(400).json({ error: 'At least 2 participants required' });
    }

    // Check if chat already exists
    const existingChat = await Conversation.findOne({
      participants: { $all: participants, $size: participants.length }
    }).populate('participants', '-password').populate('lastMessage');

    if (existingChat) {
      return res.json(existingChat);
    }

    // Create new chat
    const newChat = new Conversation({
      participants
    });
    await newChat.save();
    
    const populatedChat = await Conversation.findById(newChat._id)
      .populate('participants', '-password');
      
    res.status(201).json(populatedChat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/chats/:conversationId/messages - Fetch active conversation history
router.get('/:conversationId/messages', async (req, res) => {
  try {
    const messages = await Message.find({ conversationId: req.params.conversationId })
      .sort({ createdAt: 1 });
    
    // Mask deleted messages
    const processedMessages = messages.map(msg => {
      if (msg.isDeleted) {
        return {
          ...msg.toObject(),
          content: 'This message was deleted',
          mediaUrl: ''
        };
      }
      return msg;
    });

    res.json(processedMessages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/chats/:conversationId/clear - Clear message history for a specific conversation
router.delete('/:conversationId/clear', async (req, res) => {
  try {
    await Message.deleteMany({ conversationId: req.params.conversationId });
    // Also remove the lastMessage reference in Conversation
    await Conversation.findByIdAndUpdate(req.params.conversationId, {
      $unset: { lastMessage: "" }
    });
    res.json({ success: true, message: 'Chat history cleared' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/chats/:conversationId - Hide chat for user
router.delete('/:conversationId', async (req, res) => {
  try {
    const { userId } = req.query; // Send userId via query param
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    const conversation = await Conversation.findById(req.params.conversationId);
    if (!conversation) return res.status(404).json({ error: 'Conversation not found' });

    if (!conversation.hiddenFor.includes(userId)) {
      conversation.hiddenFor.push(userId);
      await conversation.save();
    }

    res.json({ success: true, message: 'Chat deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
