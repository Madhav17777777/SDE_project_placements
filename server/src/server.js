// Entry point: connects to MongoDB, creates the raw HTTP server around the
// Express app, attaches Socket.io to that same server, and starts listening.
// Kept separate from app.js so tests can import the Express app alone
// without opening a real network port or a Socket.io instance.

import http from 'http';
import app from './app.js';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { initSocket } from './sockets/index.js';

const httpServer = http.createServer(app);

// Socket.io attaches to the same HTTP server so both REST and WebSocket
// traffic are served from one Render web service / one port.
const io = initSocket(httpServer);

// Make `io` reachable from Express request handlers (e.g. a controller that
// needs to emit a notification after saving to the DB) via req.app.get('io').
app.set('io', io);

const startServer = async () => {
  await connectDB();

  httpServer.listen(env.PORT, () => {
    logger.info(`StreamVerse API listening on port ${env.PORT} [${env.NODE_ENV}]`);
  });
};

startServer();

// --- Process-level safety nets ---
// Log and exit cleanly on truly unexpected failures instead of leaving the
// process in a half-broken state (Render will restart the container).
process.on('unhandledRejection', (reason) => {
  logger.error(`Unhandled Rejection: ${reason}`);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}`, { stack: err.stack });
  process.exit(1);
});
