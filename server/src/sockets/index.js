// Socket.io bootstrap. `ioInstance` is a module-level singleton so plain
// service functions (follow.service.js, stream.service.js) can reach it via
// `getIO()` to push a realtime event right after writing to the database,
// without every service needing `req`/`res` threaded through it. In test
// environments (which only import app.js, never server.js) sockets are never
// initialized, so `getIO()` returns null -- every call site guards for that.

import { Server } from 'socket.io';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { socketAuthMiddleware } from './socketAuth.js';
import { registerChatHandlers } from './chat.socket.js';
import { userRoom } from './stream.socket.js';

let ioInstance = null;

export const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: env.CLIENT_URL,
      credentials: true,
    },
  });

  io.use(socketAuthMiddleware);

  io.on('connection', (socket) => {
    logger.debug(`Socket connected: ${socket.id}${socket.user ? ` (user ${socket.user._id})` : ' (anonymous)'}`);

    // Authenticated sockets get a private room for direct pushes -- realtime
    // notifications and "a channel you follow just went live" events.
    if (socket.user) socket.join(userRoom(socket.user._id));

    registerChatHandlers(io, socket);

    socket.on('disconnect', (reason) => {
      logger.debug(`Socket disconnected: ${socket.id} (${reason})`);
    });
  });

  ioInstance = io;
  return io;
};

export const getIO = () => ioInstance;
