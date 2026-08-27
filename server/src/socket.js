function initSocket(io) {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('join-session', (sessionId) => {
      socket.join(`session:${sessionId}`);
      console.log(`Socket ${socket.id} joined session ${sessionId}`);
    });

    socket.on('join-admin', () => {
      socket.join('admin');
      console.log(`Socket ${socket.id} joined admin room`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
}

function notifyAdmin(io, event, payload) {
  if (io) {
    io.to('admin').emit(event, payload);
  }
}

function notifySession(io, sessionId, event, payload) {
  if (io) {
    io.to(`session:${sessionId}`).emit(event, payload);
  }
}

module.exports = { initSocket, notifyAdmin, notifySession };