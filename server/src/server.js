// server/src/server.js
const express = require('express');
const cors = require('cors');
const http = require('http');
const path = require('path');
const fs = require('fs');
const { Server } = require('socket.io');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const server = http.createServer(app);

// Allowed origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  process.env.CLIENT_URL,
].filter(Boolean);

// Socket.io configuration
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or same-origin)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || origin.startsWith('http://192.168.') || origin.startsWith('http://10.')) {
        return callback(null, true);
      }
      return callback(null, true); // Dev-friendly permissive CORS
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

// Attach socket io instance to app
app.set('io', io);

// Initialize socket listeners
const { initSocket } = require('./socket');
initSocket(io);

// Express CORS Middleware
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || origin.startsWith('http://192.168.') || origin.startsWith('http://10.')) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
}));

app.use(express.json());

// Import all routes
const authRoutes = require('./routes/auth');
const sessionRoutes = require('./routes/session');
const orderRoutes = require('./routes/order');
const tableRoutes = require('./routes/tables');
const menuRoutes = require('./routes/menu');
const dashboardRoutes = require('./routes/dashboard');
const requestRoutes = require('./routes/requests');
const ttsRoutes = require('./routes/tts');

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/session', sessionRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/tts', ttsRoutes);

// Health check endpoint with live DB diagnostic
app.get('/api/health', async (req, res) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'ok',
      database: 'connected',
      message: 'Hotel Management API & Database are running smoothly',
      hasDbUrl: Boolean(process.env.DATABASE_URL),
      hasDirectUrl: Boolean(process.env.DIRECT_URL),
      timestamp: new Date().toISOString()
    });
  } catch (dbErr) {
    console.error('Health check DB error:', dbErr.message);
    res.status(500).json({
      status: 'database_error',
      message: dbErr.message,
      code: dbErr.code,
      hasDbUrl: Boolean(process.env.DATABASE_URL),
      hasDirectUrl: Boolean(process.env.DIRECT_URL),
      timestamp: new Date().toISOString()
    });
  }
});

// 404 handler for undefined API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: `API route ${req.originalUrl} not found` });
});

// Serve frontend SPA (built React app from server/public or client/dist)
const serverPublicPath = path.join(__dirname, '../public');
const clientDistPath = path.join(__dirname, '../../client/dist');
const staticPath = fs.existsSync(serverPublicPath)
  ? serverPublicPath
  : (fs.existsSync(clientDistPath) ? clientDistPath : null);

if (staticPath) {
  app.use(express.static(staticPath));
  // Any non-API route serves index.html for client-side routing
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api') || req.originalUrl.startsWith('/socket.io')) {
      return next();
    }
    res.sendFile(path.join(staticPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.json({
      status: 'ok',
      message: 'Julius Hotel Management API is running. Open /admin or /api/health.',
      healthCheck: '/api/health',
      tables: '/api/tables'
    });
  });
}

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Hotel Management Server running on port ${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
});

module.exports = { app, server, io };