// Viewer-count presence tracking and the small helpers used to push
// realtime notifications/live-events to a specific user's private room.
// Every authenticated socket joins `user:<id>` on connect (see sockets/
// index.js), which is what these emit* helpers target. Room-naming itself
// lives in utils/constants.js (socketRooms) so plain service functions can
// build the same room name without importing anything from sockets/ --
// stream.service.js is already a dependency of this file, so the reverse
// import would create a circular module graph.

import { setViewerCount } from '../services/stream.service.js';
import { socketRooms } from '../utils/constants.js';

export const streamRoom = socketRooms.stream;
export const userRoom = socketRooms.user;

export const currentViewerCount = (io, streamId) => {
  const room = io.sockets.adapter.rooms.get(streamRoom(streamId));
  return room ? room.size : 0;
};

export const broadcastViewerCount = async (io, streamId) => {
  const count = currentViewerCount(io, streamId);
  await setViewerCount(streamId, count);
  io.to(streamRoom(streamId)).emit('stream:viewerCount', { streamId, count });
};

export const emitToUser = (io, userId, event, payload) => {
  io.to(userRoom(userId)).emit(event, payload);
};
