// End-to-end Socket.io test: boots a real HTTP + Socket.io server on an
// ephemeral port for the duration of this file, connects two real
// socket.io-client sockets against it (one per user), and exercises the
// actual wire protocol -- join, message broadcast, typing broadcast, and
// viewer-count updates on join/leave. This is the one place in the test
// suite that talks to a real socket transport instead of calling a service
// function directly.

import http from 'http';
import { io as ioClient } from 'socket.io-client';
import request from 'supertest';
import app from '../src/app.js';
import { initSocket } from '../src/sockets/index.js';
import './setup.js';
import User from '../src/models/user.model.js';
import Channel from '../src/models/channel.model.js';
import Stream from '../src/models/stream.model.js';

let httpServer;
let port;

beforeAll((done) => {
  httpServer = http.createServer(app);
  initSocket(httpServer);
  httpServer.listen(0, () => {
    port = httpServer.address().port;
    done();
  });
});

afterAll((done) => {
  httpServer.close(done);
});

const setupStreamerAndStream = async () => {
  const streamer = await User.create({
    username: 'liveowner',
    email: 'liveowner@streamverse.test',
    fullName: 'Live Owner',
    password: 'p4ssword123',
    role: 'streamer',
  });
  const channel = await Channel.create({ owner: streamer._id, channelName: 'LiveChannel', slug: 'livechannel' });
  const stream = await Stream.create({ channel: channel._id, title: 'Socket test stream', status: 'live' });
  return { streamer, stream };
};

const signupAndLogin = async (username, email) => {
  const creds = { username, email, fullName: username, password: 'p4ssword123' };
  await request(app).post('/api/v1/auth/signup').send(creds);
  const res = await request(app).post('/api/v1/auth/login').send({ identifier: email, password: creds.password });
  return res.body.data.accessToken;
};

const connectClient = (token) =>
  new Promise((resolve, reject) => {
    const socket = ioClient(`http://localhost:${port}`, {
      auth: token ? { token } : {},
      transports: ['websocket'],
      forceNew: true,
    });
    socket.on('connect', () => resolve(socket));
    socket.on('connect_error', reject);
  });

describe('Realtime chat over a live Socket.io connection', () => {
  it('broadcasts a chat message from one client to another in the same stream room', async () => {
    const { stream } = await setupStreamerAndStream();
    const tokenA = await signupAndLogin('sockuserA', 'sockA@streamverse.test');
    const tokenB = await signupAndLogin('sockuserB', 'sockB@streamverse.test');

    const clientA = await connectClient(tokenA);
    const clientB = await connectClient(tokenB);

    await new Promise((resolve) => {
      clientA.emit('chat:join', { streamId: stream._id.toString() });
      clientA.on('chat:history', resolve); // confirms join completed server-side
    });
    await new Promise((resolve) => {
      clientB.emit('chat:join', { streamId: stream._id.toString() });
      clientB.on('chat:history', resolve);
    });

    const receivedOnB = new Promise((resolve) => clientB.on('chat:message', resolve));
    clientA.emit('chat:message', { streamId: stream._id.toString(), content: 'Hello from A' });

    const payload = await receivedOnB;
    expect(payload.message.content).toBe('Hello from A');
    expect(payload.message.sender.username).toBe('sockuserA');

    clientA.close();
    clientB.close();
  });

  it('broadcasts a typing indicator to other clients but not the sender', async () => {
    const { stream } = await setupStreamerAndStream();
    const tokenA = await signupAndLogin('typerA', 'typerA@streamverse.test');
    const tokenB = await signupAndLogin('typerB', 'typerB@streamverse.test');

    const clientA = await connectClient(tokenA);
    const clientB = await connectClient(tokenB);

    await Promise.all([
      new Promise((resolve) => {
        clientA.emit('chat:join', { streamId: stream._id.toString() });
        clientA.on('chat:history', resolve);
      }),
      new Promise((resolve) => {
        clientB.emit('chat:join', { streamId: stream._id.toString() });
        clientB.on('chat:history', resolve);
      }),
    ]);

    let sawTypingOnA = false;
    clientA.on('chat:typing', () => {
      sawTypingOnA = true;
    });
    const typingOnB = new Promise((resolve) => clientB.on('chat:typing', resolve));

    clientA.emit('chat:typing', { streamId: stream._id.toString() });
    const typingPayload = await typingOnB;

    expect(typingPayload.username).toBe('typerA');
    expect(sawTypingOnA).toBe(false); // sender never receives its own typing event

    clientA.close();
    clientB.close();
  });

  it('updates and broadcasts the viewer count as clients join and leave', async () => {
    const { stream } = await setupStreamerAndStream();
    const tokenA = await signupAndLogin('viewerA', 'viewerA@streamverse.test');
    const tokenB = await signupAndLogin('viewerB', 'viewerB@streamverse.test');

    const clientA = await connectClient(tokenA);
    const clientB = await connectClient(tokenB);

    const countAfterA = new Promise((resolve) => clientA.on('stream:viewerCount', resolve));
    clientA.emit('chat:join', { streamId: stream._id.toString() });
    expect((await countAfterA).count).toBe(1);

    const countAfterB = new Promise((resolve) => clientA.on('stream:viewerCount', resolve));
    clientB.emit('chat:join', { streamId: stream._id.toString() });
    expect((await countAfterB).count).toBe(2);

    const countAfterLeave = new Promise((resolve) => clientA.on('stream:viewerCount', resolve));
    clientB.close();
    expect((await countAfterLeave).count).toBe(1);

    clientA.close();
  });

  it('rejects chat:message from an unauthenticated (anonymous) socket', async () => {
    const { stream } = await setupStreamerAndStream();
    const anonClient = await connectClient(null);

    await new Promise((resolve) => {
      anonClient.emit('chat:join', { streamId: stream._id.toString() });
      anonClient.on('chat:history', resolve);
    });

    const errorPayload = new Promise((resolve) => anonClient.on('chat:error', resolve));
    anonClient.emit('chat:message', { streamId: stream._id.toString(), content: 'I should not be able to do this' });

    const error = await errorPayload;
    expect(error.message).toMatch(/logged in/i);

    anonClient.close();
  });
});
