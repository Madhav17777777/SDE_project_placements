// Pure business logic for chat, deliberately decoupled from Socket.io itself
// -- sockets/chat.socket.js is a thin transport layer that calls into this
// file and broadcasts the result. Keeping it this way means every rule below
// (slow mode, bans, follower-only) is unit-testable without a live socket.

import Chat from '../models/chat.model.js';
import Message from '../models/message.model.js';
import Stream from '../models/stream.model.js';
import Channel from '../models/channel.model.js';
import Follow from '../models/follow.model.js';
import ApiError from '../utils/ApiError.js';

const RECENT_MESSAGE_LIMIT = 50;

export const getOrCreateChatForStream = async (streamId) => {
  let chat = await Chat.findOne({ stream: streamId });
  if (!chat) chat = await Chat.create({ stream: streamId });
  return chat;
};

export const getRecentMessages = async (streamId) => {
  const chat = await getOrCreateChatForStream(streamId);
  const messages = await Message.find({ chat: chat._id, isDeleted: false })
    .sort({ createdAt: -1 })
    .limit(RECENT_MESSAGE_LIMIT)
    .populate('sender', 'username avatar');
  return messages.reverse(); // oldest-first for rendering
};

const assertCanPost = async (chat, user) => {
  if (chat.bannedUsers.some((id) => id.toString() === user._id.toString())) {
    throw ApiError.forbidden('You have been banned from this chat');
  }

  if (chat.isFollowerOnly) {
    const stream = await Stream.findById(chat.stream);
    const channel = await Channel.findById(stream.channel);
    const isOwner = channel.owner.toString() === user._id.toString();
    const follows = isOwner || (await Follow.exists({ follower: user._id, channel: channel._id }));
    if (!follows) throw ApiError.forbidden('This chat is followers-only');
  }

  if (chat.isSlowMode && chat.slowModeDelaySec > 0) {
    const lastMessage = await Message.findOne({ chat: chat._id, sender: user._id }).sort({ createdAt: -1 });
    if (lastMessage) {
      const secondsSinceLast = (Date.now() - lastMessage.createdAt.getTime()) / 1000;
      if (secondsSinceLast < chat.slowModeDelaySec) {
        throw ApiError.badRequest(
          `Slow mode is on — wait ${Math.ceil(chat.slowModeDelaySec - secondsSinceLast)}s before sending again`
        );
      }
    }
  }
};

export const postMessage = async (streamId, user, content) => {
  const trimmed = (content || '').trim();
  if (!trimmed) throw ApiError.badRequest('Message cannot be empty');
  if (trimmed.length > 500) throw ApiError.badRequest('Message is too long (max 500 characters)');

  const chat = await getOrCreateChatForStream(streamId);
  await assertCanPost(chat, user);

  const message = await Message.create({ chat: chat._id, sender: user._id, content: trimmed });
  await Stream.updateOne({ _id: streamId }, { $inc: { totalChatMessages: 1 } });

  return message.populate('sender', 'username avatar');
};

export const setSlowMode = async (userId, streamId, { enabled, delaySec }) => {
  const stream = await Stream.findById(streamId);
  if (!stream) throw ApiError.notFound('Stream not found');
  const channel = await Channel.findById(stream.channel);
  if (!channel || channel.owner.toString() !== userId.toString()) {
    throw ApiError.forbidden('Only the streamer can change chat settings');
  }

  const chat = await getOrCreateChatForStream(streamId);
  chat.isSlowMode = Boolean(enabled);
  chat.slowModeDelaySec = Math.max(0, Number(delaySec) || 0);
  await chat.save();
  return chat;
};

export const banUserFromChat = async (streamerId, streamId, targetUserId) => {
  const stream = await Stream.findById(streamId);
  if (!stream) throw ApiError.notFound('Stream not found');
  const channel = await Channel.findById(stream.channel);
  if (!channel || channel.owner.toString() !== streamerId.toString()) {
    throw ApiError.forbidden('Only the streamer can ban chat users');
  }

  const chat = await getOrCreateChatForStream(streamId);
  await Chat.updateOne({ _id: chat._id }, { $addToSet: { bannedUsers: targetUserId } });
};
