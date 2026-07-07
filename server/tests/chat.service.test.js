// Unit-level coverage of chat moderation rules (slow mode, bans,
// follower-only), exercised directly against chat.service.js so they're
// verified independent of the Socket.io transport. See chat.socket.test.js
// for the real end-to-end socket behavior (join/message/typing/viewer count).

import './setup.js';
import User from '../src/models/user.model.js';
import Channel from '../src/models/channel.model.js';
import Stream from '../src/models/stream.model.js';
import Follow from '../src/models/follow.model.js';
import * as chatService from '../src/services/chat.service.js';

const setup = async () => {
  const streamer = await User.create({
    username: 'chatstreamer',
    email: 'chatstreamer@streamverse.test',
    fullName: 'Chat Streamer',
    password: 'p4ssword123',
    role: 'streamer',
  });
  const channel = await Channel.create({ owner: streamer._id, channelName: 'ChatChannel', slug: 'chatchannel' });
  const stream = await Stream.create({ channel: channel._id, title: 'Live now', status: 'live' });
  const viewer = await User.create({
    username: 'chatviewer',
    email: 'chatviewer@streamverse.test',
    fullName: 'Chat Viewer',
    password: 'p4ssword123',
  });
  return { streamer, channel, stream, viewer };
};

describe('chat.service', () => {
  it('posts a message and increments the stream chat counter', async () => {
    const { stream, viewer } = await setup();

    const message = await chatService.postMessage(stream._id, viewer, 'Hello chat!');
    expect(message.content).toBe('Hello chat!');

    const updatedStream = await Stream.findById(stream._id);
    expect(updatedStream.totalChatMessages).toBe(1);
  });

  it('rejects an empty message', async () => {
    const { stream, viewer } = await setup();
    await expect(chatService.postMessage(stream._id, viewer, '   ')).rejects.toThrow();
  });

  it('rejects a message from a banned user', async () => {
    const { streamer, stream, viewer } = await setup();
    await chatService.banUserFromChat(streamer._id, stream._id, viewer._id);

    await expect(chatService.postMessage(stream._id, viewer, 'Let me in')).rejects.toThrow(/banned/i);
  });

  it('enforces slow mode per user', async () => {
    const { streamer, stream, viewer } = await setup();
    await chatService.setSlowMode(streamer._id, stream._id, { enabled: true, delaySec: 30 });

    await chatService.postMessage(stream._id, viewer, 'First message');
    await expect(chatService.postMessage(stream._id, viewer, 'Too soon')).rejects.toThrow(/slow mode/i);
  });

  it('enforces follower-only mode', async () => {
    const { streamer, channel, stream, viewer } = await setup();

    const chat = await chatService.getOrCreateChatForStream(stream._id);
    chat.isFollowerOnly = true;
    await chat.save();

    await expect(chatService.postMessage(stream._id, viewer, 'Hi')).rejects.toThrow(/followers-only/i);

    await Follow.create({ follower: viewer._id, channel: channel._id });
    const message = await chatService.postMessage(stream._id, viewer, 'Now I can chat');
    expect(message.content).toBe('Now I can chat');
  });

  it('only lets the streamer change chat settings', async () => {
    const { stream, viewer } = await setup();
    await expect(chatService.setSlowMode(viewer._id, stream._id, { enabled: true, delaySec: 10 })).rejects.toThrow(
      /only the streamer/i
    );
  });
});
