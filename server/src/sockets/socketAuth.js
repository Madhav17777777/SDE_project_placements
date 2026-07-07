// Optional Socket.io authentication middleware. A connection without a valid
// token is still allowed through (anonymous viewers can watch a stream and
// see the live chat), but `socket.user` will be undefined, and
// chat.socket.js rejects `chat:message` from any socket without one.

import { verifyAccessToken } from '../utils/generateTokens.js';
import User from '../models/user.model.js';

export const socketAuthMiddleware = async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next();

    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.id);
    if (user && !user.isBanned) socket.user = user;
  } catch {
    // Invalid/expired token on a socket connection just means "anonymous" --
    // we don't reject the handshake over it, matching the REST
    // `attachUserIfPresent` middleware's philosophy for optional-auth routes.
  }
  next();
};
