require('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

const User = require('./models/User');
const Conversation = require('./models/Conversation');
const Message = require('./models/Message');

const usersRoutes = require('./routes/users');
const chatsRoutes = require('./routes/chats');
const messagesRoutes = require('./routes/messages');
const storiesRoutes = require('./routes/stories');
const mediaRoutes = require('./routes/media');
const authRoutes = require('./routes/auth');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Adjust for production
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

const path = require('path');

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/chats', chatsRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/stories', storiesRoutes);
app.use('/api/media', mediaRoutes);

// Database Connection
const PORT = process.env.PORT || 6000;
connectDB();

// Socket.io Event Pipeline
io.on('connection', async (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // Connection/Status: Mark user online
  const userId = socket.handshake.query.userId;
  if (userId) {
    socket.userId = userId;
    socket.join(userId); // Join personal room for direct events
    try {
      await User.findByIdAndUpdate(userId, { isOnline: true });
      socket.broadcast.emit('user_status_changed', { userId, isOnline: true });
    } catch (err) {
      console.error('Error updating user status:', err);
    }
  }

  // Core Chat
  socket.on('join_chat', (conversationId) => {
    socket.join(conversationId);
    console.log(`Socket ${socket.id} joined room ${conversationId}`);
  });

  socket.on('send_message', async (data) => {
    try {
      const { conversationId, senderId, content, messageType, mediaUrl } = data;

      const conversation = await Conversation.findById(conversationId).populate('participants');
      if (!conversation) return;

      // Check for blocked users
      const sender = await User.findById(senderId);
      const recipient = conversation.participants.find(p => p._id.toString() !== senderId);
      
      if (recipient) {
        if (sender.blockedUsers?.includes(recipient._id)) {
          return io.to(senderId).emit('message_error', { error: 'You have blocked this user' });
        }
        const recipientUser = await User.findById(recipient._id);
        if (recipientUser.blockedUsers?.includes(senderId)) {
          return io.to(senderId).emit('message_error', { error: 'This user has blocked you' });
        }
      }

      const newMessage = new Message({
        conversationId,
        senderId,
        content,
        messageType,
        mediaUrl
      });
      await newMessage.save();

      await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: newMessage._id,
        updatedAt: Date.now(),
        $set: { hiddenFor: [] }
      });

      if (conversation) {
        const participantRooms = conversation.participants.map(p => p._id.toString());
        // Emit to the conversation room AND all participant personal rooms
        io.to([...participantRooms, conversationId]).emit('message_received', newMessage);
      } else {
        io.to(conversationId).emit('message_received', newMessage);
      }
    } catch (err) {
      console.error('Error sending message:', err);
    }
  });

  socket.on('typing_start', (data) => {
    const { conversationId, userId } = data;
    socket.to(conversationId).emit('typing_status', { conversationId, userId, isTyping: true });
  });

  socket.on('typing_stop', (data) => {
    const { conversationId, userId } = data;
    socket.to(conversationId).emit('typing_status', { conversationId, userId, isTyping: false });
  });

  socket.on('mark_read', async (data) => {
    try {
      const { messageIds, conversationId } = data;
      await Message.updateMany(
        { _id: { $in: messageIds } },
        { status: 'read' }
      );
      
      const conversation = await Conversation.findById(conversationId);
      if (conversation) {
        const participantRooms = conversation.participants.map(p => p.toString());
        io.to([...participantRooms, conversationId]).emit('chat_updated', { messageIds, status: 'read' });
      } else {
        io.to(conversationId).emit('chat_updated', { messageIds, status: 'read' });
      }
    } catch (err) {
      console.error('Error marking read:', err);
    }
  });

  socket.on('delete_message', async (data) => {
    try {
      const { messageId, conversationId } = data;
      const message = await Message.findById(messageId);
      if (message) {
        message.isDeleted = true;
        message.content = '';
        message.mediaUrl = '';
        await message.save();
        io.to(conversationId).emit('message_deleted', { messageId });
      }
    } catch (err) {
      console.error('Error deleting message:', err);
    }
  });

  // WebRTC Video Calling Signaling
  socket.on('initiate_call', (data) => {
    const { room, callerData, recipientId } = data;
    socket.join(room);
    // Notify the recipient
    io.to(recipientId).emit('incoming_call', { room, callerData });
  });

  socket.on('call_response', (data) => {
    const { callerId, accepted, room } = data;
    if (accepted && room) {
      socket.join(room);
    }
    io.to(callerId).emit('call_response', { accepted });
  });

  socket.on('webrtc_signaling', (data) => {
    const { room, signalData } = data;
    socket.to(room).emit('webrtc_signaling', { signalData });
  });

  socket.on('end_call', (data) => {
    const { room } = data;
    io.to(room).emit('call_ended');
  });

  // Disconnect
  socket.on('disconnect', async () => {
    console.log(`Socket disconnected: ${socket.id}`);
    if (socket.userId) {
      try {
        await User.findByIdAndUpdate(socket.userId, {
          isOnline: false,
          lastSeen: Date.now()
        });
        socket.broadcast.emit('user_status_changed', {
          userId: socket.userId,
          isOnline: false,
          lastSeen: Date.now()
        });
      } catch (err) {
        console.error('Error updating user status on disconnect:', err);
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
