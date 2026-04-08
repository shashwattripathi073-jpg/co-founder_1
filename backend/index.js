const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

// Import routers
const UserRouter = require('./routers/userRouter');
const StartupRouter = require('./routers/startupRouter');
const CollaborationRouter = require('./routers/collaborationRouter');
const MessageRouter = require('./routers/messageRouter');
const MatchRouter = require('./routers/matchRouter');
const FeedbackRouter = require('./routers/feedbackRouter');
const AdminRouter = require('./routers/adminRouter');
const ReportRouter = require('./routers/reportRouter');

// Import message model for socket
const Message = require('./models/messageModel');

const app = express();
const server = http.createServer(app);
const port = 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' })); // Increased for base64 avatars

/* ==================== API ROUTES ==================== */

// Module 1 & 2: Registration & Authentication
// Module 3: User Profile
// Module 8: Search & Filter
// Module 12: Verification
app.use('/user', UserRouter);

// Module 4: Startup Idea Management
// Module 5: Role & Requirement Definition
app.use('/startup', StartupRouter);

// Module 9: Collaboration Requests
app.use('/collab', CollaborationRouter);

// Module 10: Communication & Chat
app.use('/messages', MessageRouter);

// Module 6: Skill Matching
// Module 7: Co-Founder Recommendations
// Module 11: Compatibility Analysis
app.use('/match', MatchRouter);

// Module 13: Feedback & Rating
app.use('/feedback', FeedbackRouter);

// Module 14: Admin Control
app.use('/admin', AdminRouter);

// Reports (user-facing)
app.use('/report', ReportRouter);

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'CoFounder API is running', version: '2.0' });
});

/* ==================== MODULE 10: SOCKET.IO REAL-TIME CHAT ==================== */

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Track online users
const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  // User comes online
  socket.on('user-online', (userId) => {
    onlineUsers.set(userId, socket.id);
    io.emit('online-users', Array.from(onlineUsers.keys()));
  });

  // Send message
  socket.on('send-message', async (data) => {
    try {
      const { senderId, receiverId, content } = data;
      const conversationId = Message.getConversationId(senderId, receiverId);

      const message = new Message({ senderId, receiverId, conversationId, content });
      const saved = await message.save();
      const populated = await saved.populate('senderId', 'name avatar');

      // Send to receiver if online
      const receiverSocket = onlineUsers.get(receiverId);
      if (receiverSocket) {
        io.to(receiverSocket).emit('new-message', populated);
      }

      // Send back to sender
      socket.emit('message-sent', populated);
    } catch (err) {
      socket.emit('message-error', { error: err.message });
    }
  });

  // Typing indicator
  socket.on('typing', ({ senderId, receiverId }) => {
    const receiverSocket = onlineUsers.get(receiverId);
    if (receiverSocket) {
      io.to(receiverSocket).emit('user-typing', { senderId });
    }
  });

  socket.on('stop-typing', ({ senderId, receiverId }) => {
    const receiverSocket = onlineUsers.get(receiverId);
    if (receiverSocket) {
      io.to(receiverSocket).emit('user-stop-typing', { senderId });
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
    io.emit('online-users', Array.from(onlineUsers.keys()));
  });
});

/* ==================== MODULE 15: DATABASE CONNECTION ==================== */

// Connection is handled in connection.js which is imported by all models
require('./connection');

server.listen(port, () => {
  console.log(`CoFounder API server running on port ${port}`);
  console.log(`Socket.IO enabled for real-time chat`);
});