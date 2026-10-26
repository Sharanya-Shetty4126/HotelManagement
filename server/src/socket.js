// server/src/socket.js
// Centralized Socket.io management for real-time notifications

function initSocket(io) {
  io.on('connection', (socket) => {
    console.log('🟢 Socket connected:', socket.id);

    // Join room for a specific table session (customer phone)
    socket.on('join-session', (sessionId) => {
      if (sessionId) {
        socket.join(`session:${sessionId}`);
        console.log(`Socket ${socket.id} joined session:${sessionId}`);
      }
    });

    // Join room for admin staff (admin dashboard, orders page)
    socket.on('join-admin', () => {
      socket.join('admin');
      console.log(`Socket ${socket.id} joined admin room`);
    });

    // Customer places order -> notify admin
    socket.on('order-notification', (data) => {
      io.to('admin').emit('order-notification', data);
    });

    // Customer requests bill -> notify admin
    socket.on('bill-notification', (data) => {
      io.to('admin').emit('bill-notification', data);
    });

    // Customer calls waiter -> notify admin
    socket.on('customer-request', (data) => {
      io.to('admin').emit('customer-request', data);
    });

    socket.on('disconnect', () => {
      console.log('🔴 Socket disconnected:', socket.id);
    });
  });
}

function notifyAdmin(io, event, payload) {
  if (io) {
    io.to('admin').emit(event, payload);
  }
}

function notifySession(io, sessionId, event, payload) {
  if (io && sessionId) {
    io.to(`session:${sessionId}`).emit(event, payload);
  }
}

function broadcast(io, event, payload) {
  if (io) {
    io.emit(event, payload);
  }
}

module.exports = { initSocket, notifyAdmin, notifySession, broadcast };