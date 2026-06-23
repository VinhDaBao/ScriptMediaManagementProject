let io = null;

const init = (socketIoInstance) => {
  io = socketIoInstance;
  io.on("connection", (socket) => {
    console.log(`[Socket] User connected: ${socket.id}`);

    socket.on("register-user", (userId) => {
      if (userId) {
        console.log(`[Socket] User ${userId} joined room user_${userId}`);
        socket.join(`user_${userId}`);
      }
    });

    socket.on("disconnect", () => {
      console.log(`[Socket] User disconnected: ${socket.id}`);
    });
  });
};

const getIo = () => io;

const sendToUser = (userId, event, data) => {
  if (io) {
    io.to(`user_${userId}`).emit(event, data);
  }
};

const broadcast = (event, data) => {
  if (io) {
    io.emit(event, data);
  }
};

export default {
  init,
  getIo,
  sendToUser,
  broadcast,
};
