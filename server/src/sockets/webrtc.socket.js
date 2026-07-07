// Lightweight WebRTC signaling relay so "Go Live" can show *real* camera
// video to viewers, without building actual RTMP/HLS ingest (see
// stream.service.js and docs/README Known Limitations for why that's out of
// scope). This module never touches media itself -- it only relays SDP
// offers/answers and ICE candidates between a stream's broadcaster and each
// connected viewer, addressed by socket id. A stream has at most one
// broadcaster at a time (whoever most recently clicked "Start Camera"),
// tracked in an in-memory Map -- fine for a single-instance portfolio deploy.

import { streamRoom } from './stream.socket.js';
import { logger } from '../config/logger.js';

const broadcasterSockets = new Map(); // streamId -> broadcaster's socket.id

export const registerWebrtcHandlers = (io, socket) => {
  socket.data.broadcastingStreams = socket.data.broadcastingStreams || new Set();
  socket.data.viewingStreams = socket.data.viewingStreams || new Set();

  socket.on('webrtc:broadcaster-ready', ({ streamId }) => {
    if (!streamId) return;
    broadcasterSockets.set(streamId, socket.id);
    socket.data.broadcastingStreams.add(streamId);
    logger.debug(`WebRTC broadcaster ready for stream ${streamId} (${socket.id})`);
  });

  socket.on('webrtc:broadcaster-stop', ({ streamId }) => {
    if (!streamId) return;
    if (broadcasterSockets.get(streamId) === socket.id) broadcasterSockets.delete(streamId);
    socket.data.broadcastingStreams.delete(streamId);
    io.to(streamRoom(streamId)).emit('webrtc:broadcaster-offline', { streamId });
  });

  socket.on('webrtc:viewer-ready', ({ streamId }) => {
    if (!streamId) return;
    socket.data.viewingStreams.add(streamId);
    const broadcasterId = broadcasterSockets.get(streamId);
    if (broadcasterId) {
      io.to(broadcasterId).emit('webrtc:viewer-joined', { streamId, viewerId: socket.id });
    } else {
      socket.emit('webrtc:no-broadcaster', { streamId });
    }
  });

  socket.on('webrtc:viewer-left', ({ streamId }) => {
    if (!streamId) return;
    socket.data.viewingStreams.delete(streamId);
    const broadcasterId = broadcasterSockets.get(streamId);
    if (broadcasterId) io.to(broadcasterId).emit('webrtc:viewer-left', { streamId, viewerId: socket.id });
  });

  // Pure relay -- the sender already knows which socket id to address
  // (the broadcaster learned viewer ids from webrtc:viewer-joined, and the
  // viewer learned the broadcaster's id from the incoming offer's `from`).
  socket.on('webrtc:offer', ({ streamId, targetId, sdp }) => {
    if (!targetId) return;
    io.to(targetId).emit('webrtc:offer', { streamId, from: socket.id, sdp });
  });

  socket.on('webrtc:answer', ({ streamId, targetId, sdp }) => {
    if (!targetId) return;
    io.to(targetId).emit('webrtc:answer', { streamId, from: socket.id, sdp });
  });

  socket.on('webrtc:ice-candidate', ({ streamId, targetId, candidate }) => {
    if (!targetId) return;
    io.to(targetId).emit('webrtc:ice-candidate', { streamId, from: socket.id, candidate });
  });

  socket.on('disconnect', () => {
    for (const streamId of socket.data.broadcastingStreams) {
      if (broadcasterSockets.get(streamId) === socket.id) broadcasterSockets.delete(streamId);
      io.to(streamRoom(streamId)).emit('webrtc:broadcaster-offline', { streamId });
    }
    for (const streamId of socket.data.viewingStreams) {
      const broadcasterId = broadcasterSockets.get(streamId);
      if (broadcasterId) io.to(broadcasterId).emit('webrtc:viewer-left', { streamId, viewerId: socket.id });
    }
  });
};
