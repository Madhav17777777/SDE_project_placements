// Covers Phase 5: channel creation (which promotes a user to "streamer"),
// and the full stream lifecycle (create -> go-live -> appears in /live feed
// -> end -> disappears from /live feed).

import request from 'supertest';
import app from '../src/app.js';
import './setup.js';

const signupAndLogin = async (overrides = {}) => {
  const creds = {
    username: 'gamerfox',
    email: 'gamerfox@streamverse.test',
    fullName: 'Gamer Fox',
    password: 'p4ssword123',
    ...overrides,
  };
  await request(app).post('/api/v1/auth/signup').send(creds);
  const loginRes = await request(app)
    .post('/api/v1/auth/login')
    .send({ identifier: creds.email, password: creds.password });
  return loginRes.body.data.accessToken;
};

describe('Channel creation', () => {
  it('creates a channel and promotes the user to streamer', async () => {
    const token = await signupAndLogin();

    const res = await request(app)
      .post('/api/v1/channels')
      .set('Authorization', `Bearer ${token}`)
      .send({ channelName: 'GamerFoxLive', description: 'Speedrunning and chill' });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.channel.slug).toBe('gamerfoxlive');

    const me = await request(app).get('/api/v1/auth/me').set('Authorization', `Bearer ${token}`);
    expect(me.body.data.user.role).toBe('streamer');
  });

  it('rejects creating a second channel for the same user', async () => {
    const token = await signupAndLogin();

    await request(app)
      .post('/api/v1/channels')
      .set('Authorization', `Bearer ${token}`)
      .send({ channelName: 'GamerFoxLive' });

    const second = await request(app)
      .post('/api/v1/channels')
      .set('Authorization', `Bearer ${token}`)
      .send({ channelName: 'GamerFoxLiveAgain' });

    expect(second.statusCode).toBe(409);
  });
});

describe('Stream lifecycle', () => {
  const createChannel = async (token) => {
    const res = await request(app)
      .post('/api/v1/channels')
      .set('Authorization', `Bearer ${token}`)
      .send({ channelName: 'GamerFoxLive' });
    return res.body.data.channel;
  };

  it('creates a scheduled stream, then goes live and appears in /live', async () => {
    const token = await signupAndLogin();
    await createChannel(token);

    const createRes = await request(app)
      .post('/api/v1/streams')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Speedrunning Hollow Knight' });
    expect(createRes.statusCode).toBe(201);
    expect(createRes.body.data.stream.status).toBe('scheduled');

    const streamId = createRes.body.data.stream._id;

    const goLiveRes = await request(app)
      .post(`/api/v1/streams/${streamId}/go-live`)
      .set('Authorization', `Bearer ${token}`);
    expect(goLiveRes.statusCode).toBe(200);
    expect(goLiveRes.body.data.stream.status).toBe('live');
    expect(goLiveRes.body.data.stream.playbackUrl).toContain(streamId);

    const liveFeed = await request(app).get('/api/v1/streams/live');
    expect(liveFeed.body.data.streams.some((s) => s._id === streamId)).toBe(true);
  });

  it('rejects going live twice and rejects ending a non-live stream', async () => {
    const token = await signupAndLogin();
    await createChannel(token);

    const createRes = await request(app)
      .post('/api/v1/streams')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Chill stream' });
    const streamId = createRes.body.data.stream._id;

    const endBeforeLive = await request(app)
      .post(`/api/v1/streams/${streamId}/end`)
      .set('Authorization', `Bearer ${token}`);
    expect(endBeforeLive.statusCode).toBe(400);

    await request(app).post(`/api/v1/streams/${streamId}/go-live`).set('Authorization', `Bearer ${token}`);

    const secondGoLive = await request(app)
      .post(`/api/v1/streams/${streamId}/go-live`)
      .set('Authorization', `Bearer ${token}`);
    expect(secondGoLive.statusCode).toBe(400);
  });

  it('ends a live stream and removes it from the /live feed', async () => {
    const token = await signupAndLogin();
    await createChannel(token);

    const createRes = await request(app)
      .post('/api/v1/streams')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'One more game' });
    const streamId = createRes.body.data.stream._id;

    await request(app).post(`/api/v1/streams/${streamId}/go-live`).set('Authorization', `Bearer ${token}`);
    const endRes = await request(app)
      .post(`/api/v1/streams/${streamId}/end`)
      .set('Authorization', `Bearer ${token}`);

    expect(endRes.statusCode).toBe(200);
    expect(endRes.body.data.stream.status).toBe('ended');

    const liveFeed = await request(app).get('/api/v1/streams/live');
    expect(liveFeed.body.data.streams.some((s) => s._id === streamId)).toBe(false);
  });

  it('rejects a non-streamer from creating a stream', async () => {
    const token = await signupAndLogin({ username: 'plainviewer', email: 'plain@streamverse.test' });

    const res = await request(app)
      .post('/api/v1/streams')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Should fail' });

    expect(res.statusCode).toBe(403);
  });
});
