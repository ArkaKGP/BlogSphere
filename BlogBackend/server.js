require('dotenv').config();

const dns = require('dns');
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');

// Models
const Conversation = require('./models/Conversation');
const Message = require('./models/Message');

// Import routes
const blogroute = require('./routes/Blogs');
const authroute = require('./routes/auth');
const mailRoutes = require('./routes/mail');
const chatRoutes = require('./routes/chat');
const notificationRoutes = require('./routes/notifications');

// Import Yjs WebSocket server service
const { initYWebSocketServer } = require('./services/yWebSocketServer');

// Initialize express app
const app = express();
const server = http.createServer(app);

// Dynamic CORS origin handler supporting credentials across Vercel, localhost, and custom domains
const allowedOrigins = (origin, callback) => {
  // Allow requests with no origin (like mobile apps, curl, postman)
  if (!origin) return callback(null, true);
  return callback(null, true);
};

// Initialize Socket.io with dynamic CORS
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    credentials: true,
  },
});

app.set('io', io);

// Initialize Yjs WebSocket server for real-time document editing
initYWebSocketServer(server);

// Middleware
app.use(express.json());

// CORS config for Express HTTP API routes
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// Logging middleware
app.use((req, res, next) => {
  console.log(req.method, req.path);
  next();
});

// Routes
app.use('/api/blogs', blogroute);
app.use('/api/auth', authroute);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api', mailRoutes);

// Socket.io Online User Tracking Mechanism
// Map userId (string) -> socketId (string)
const userSocketMap = {};

const getReceiverSocketId = (receiverId) => {
  if (!receiverId) return null;
  return userSocketMap[String(receiverId)];
};

io.on('connection', (socket) => {
  const rawUserId = socket.handshake.query.userId;
  const userId = rawUserId && rawUserId !== 'undefined' && rawUserId !== 'null' ? String(rawUserId) : null;

  console.log(`⚡ Client connected: Socket ID ${socket.id}, User ID: ${userId}`);

  if (userId) {
    userSocketMap[userId] = socket.id;
  }

  // Broadcast list of online user IDs to all connected clients
  io.emit('getOnlineUsers', Object.keys(userSocketMap));

  // Listener for sending a message
  socket.on('sendMessage', async ({ senderId, receiverId, text, conversationId }) => {
    try {
      if (!senderId || !text || !conversationId) return;

      // 1. Save new message to MongoDB
      const newMessage = await Message.create({
        conversationId,
        senderId,
        text,
      });

      // 2. Update conversation's lastMessage reference
      await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: newMessage._id,
        updatedAt: new Date(),
      });

      // 3. Emit message to receiver in real-time if online
      const receiverSocketId = getReceiverSocketId(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('newMessage', newMessage);
      }

      // 4. Emit back to sender socket so sender UI updates instantaneously
      socket.emit('newMessage', newMessage);
    } catch (error) {
      console.error('Error handling sendMessage event:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Handle socket disconnect
  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: Socket ID ${socket.id}`);
    
    // Purge socket ID entry from userSocketMap
    for (const [uid, sid] of Object.entries(userSocketMap)) {
      if (sid === socket.id) {
        delete userSocketMap[uid];
      }
    }

    io.emit('getOnlineUsers', Object.keys(userSocketMap));
  });
});

// Helper function to start server
const startServer = () => {
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`🚀 Server running with WebSockets on port ${PORT}`);
  });
};

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONG_URI);
    console.log('✅ Connected to MongoDB Atlas');
    startServer();
  } catch (err) {
    console.warn('⚠️ Standard SRV connection failed, attempting Direct Seedlist connection...');

    let fallbackUri = process.env.MONG_URI;
    if (fallbackUri.includes('mongodb+srv://') && fallbackUri.includes('.mongodb.net')) {
      const match = fallbackUri.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@([^.\/]+)\.pehdsy7\.mongodb\.net\/?([^?]*)\??(.*)/);
      if (match) {
        const [, user, pass, cluster, db, opts] = match;
        fallbackUri = `mongodb://${user}:${pass}@${cluster}-shard-00-00.pehdsy7.mongodb.net:27017,${cluster}-shard-00-01.pehdsy7.mongodb.net:27017,${cluster}-shard-00-02.pehdsy7.mongodb.net:27017/${db || 'blogsphere'}?ssl=true&authSource=admin&retryWrites=true&w=majority${opts ? '&' + opts : ''}`;
      }
    }

    try {
      await mongoose.connect(fallbackUri);
      console.log('✅ Connected to MongoDB Atlas via Direct Shard Nodes!');
      startServer();
    } catch (fallbackErr) {
      console.error('❌ Failed to connect to MongoDB Atlas:', err.message);
      console.error('💡 Cause: Your local Wi-Fi / Router DNS or Firewall is blocking outbound MongoDB Atlas traffic.');
      console.error('👉 Solution: Switch to Mobile Hotspot or change Windows DNS to 8.8.8.8 / 8.8.4.4.');
    }
  }
};

connectDB();
