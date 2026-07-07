// REST endpoints for streamer-side chat moderation (slow mode, bans). The
// chat itself -- joining, sending, typing -- is entirely Socket.io-driven
// (see sockets/chat.socket.js); these are the two settings a streamer
// reasonably wants a normal HTTP form/button for rather than a socket event.

import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import * as chatService from '../services/chat.service.js';

export const setSlowMode = asyncHandler(async (req, res) => {
  const chat = await chatService.setSlowMode(req.user._id, req.params.id, req.body);
  new ApiResponse(200, { chat }, 'Chat slow mode updated').send(res);
});

export const banUser = asyncHandler(async (req, res) => {
  await chatService.banUserFromChat(req.user._id, req.params.id, req.params.userId);
  new ApiResponse(200, null, 'User banned from chat').send(res);
});
