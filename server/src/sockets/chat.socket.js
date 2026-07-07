// Chat transport layer: translates socket events into calls on
// chat.service.js and broadcasts the result to the room. All moderation
// rules (bans, slow mode, follower-only) live in the service, not here.

import * as chatService from '../services/chat.service.js';
import { streamRoom, broadcastViewerCount } from './stream.socket.js';
import { logger } from '../config/logger.js';

export const registerChatHandlers = (io, socket) => {
  socket.data.joinedStreams = socket.data.joinedStreams || new Set();

  socket.on('chat:join', async ({ streamId }) => {
    if (!streamId) return;
    const room = streamRoom(streamId);
    socket.join(room);
    socket.data.joinedStreams.add(streamId);

    try {
      const history = await chatService.getRecentMessages(streamId);
      socket.emit('chat:history', { streamId, messages: history });
    } catch (error) {
      logger.warn(`chat:join history fetch failed for stream ${streamId}: ${error.message}`);
    }

    await broadcastViewerCount(io, streamId);
  });

  socket.on('chat:leave', async ({ streamId }) => {
    if (!streamId) return;
    socket.leave(streamRoom(streamId));
    socket.data.joinedStreams.delete(streamId);
    await broadcastViewerCount(io, streamId);
  });

  socket.on('chat:message', async ({ streamId, content }) => {
    if (!streamId) return;
    if (!socket.user) {
      return socket.emit('chat:error', { message: 'You must be logged in to chat' });
    }

    try {
      const message = await chatService.postMessage(streamId, socket.user, content);
      io.to(streamRoom(streamId)).emit('chat:message', { streamId, message });
    } catch (error) {
      socket.emit('chat:error', { message: error.message });
    }
  });

  socket.on('chat:typing', ({ streamId }) => {
    if (!streamId || !socket.user) return;
    socket.to(streamRoom(streamId)).emit('chat:typing', {
      streamId,
      userId: socket.user._id,
      username: socket.user.username,
    });
  });

  socket.on('disconnect', async () => {
    const streamIds = Array.from(socket.data.joinedStreams || []);
    await Promise.all(streamIds.map((streamId) => broadcastViewerCount(io, streamId)));
  });
};
