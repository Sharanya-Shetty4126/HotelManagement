const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');

dotenv.config();

// Define app
const app = express();
const server = http.createServer(app);

// Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

// Make io available inside route handlers
app.set('io', io);

app.use(cors({
  origin: ['http://localhost:5173', 'http://192.168.1.6:5173'],
  credentials: true,
}));
app.use(express.json());

// Import ALL routes
const authRoutes = require('./routes/auth');
const sessionRoutes = require('./routes/session');
const orderRoutes = require('./routes/order');
const tableRoutes = require('./routes/tables');
const menuRoutes = require('./routes/menu');

// Mount ALL routes
app.use('/api/auth', authRoutes);
app.use('/api/session', sessionRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/menu', menuRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running!' });
});

// Socket.io
io.on('connection', (socket) => {
  console.log('🟢 Client connected:', socket.id);

  socket.on('join-session', (sessionId) => {
    socket.join(`session:${sessionId}`);
    console.log(`Socket ${socket.id} joined session ${sessionId}`);
  });

  socket.on('join-admin', () => {
    socket.join('admin');
    console.log(`Socket ${socket.id} joined admin room`);
  });

  socket.on('order-notification', (data) => {
    io.to('admin').emit('order-notification', data);
  });

  socket.on('bill-notification', (data) => {
    io.to('admin').emit('bill-notification', data);
  });

  socket.on('disconnect', () => {
    console.log('🔴 Client disconnected:', socket.id);
  });
});
app.use(cors({
  origin: '*',  // ✅ Allow all origins (for testing)
  credentials: true,
}));

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Something went wrong!' });
});
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
 console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Test: http://localhost:${PORT}/api/health`);
  console.log(`📡 Menu: http://localhost:${PORT}/api/menu`);});

// const PORT = process.env.PORT || 5000;
// server.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
//   console.log(`📡 Test: http://localhost:${PORT}/api/health`);
//   console.log(`📡 Menu: http://localhost:${PORT}/api/menu`);
// });