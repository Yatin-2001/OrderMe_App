import { Server } from 'socket.io';

export let io;
export const userSockets = {}; // userId -> socket.id

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*',
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId) userSockets[userId] = socket.id;

    socket.on('disconnect', () => {
      if (userId && userSockets[userId] === socket.id) {
        delete userSockets[userId];
      }
    });
  });
};
