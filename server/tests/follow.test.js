// Covers the Phase 4 follow system. Channel creation itself is a Phase 5
// feature, so this test constructs a Channel document directly via the model
// rather than through an API endpoint.

import request from 'supertest';
import app from '../src/app.js';
import './setup.js';
import User from '../src/models/user.model.js';
import Channel from '../src/models/channel.model.js';
import Notification from '../src/models/notification.model.js';

const createStreamerWithChannel = async () => {
  const streamer = await User.create({
    username: 'pixelqueen',
    email: 'pixelqueen@streamverse.test',
    fullName: 'Pixel Queen',
    password: 'p4ssword123',
    role: 'streamer',
  });
  const channel = await Channel.create({
    owner: streamer._id,
    channelName: 'PixelQueenLive',
    slug: 'pixelqueenlive',
  });
  streamer.channel = channel._id;
  await streamer.save();
  return { streamer, channel };
};

const signupAndLoginViewer = async () => {
  const creds = {
    username: 'viewer1',
    email: 'viewer1@streamverse.test',
    fullName: 'Viewer One',
    password: 'p4ssword123',
  };
  await request(app).post('/api/v1/auth/signup').send(creds);
  const loginRes = await request(app)
    .post('/api/v1/auth/login')
    .send({ identifier: creds.email, password: creds.password });
  return loginRes.body.data.accessToken;
};

describe('Follow system', () => {
  it('follows a channel, increments followersCount, and notifies the owner', async () => {
    const { channel } = await createStreamerWithChannel();
    const token = await signupAndLoginViewer();

    const followRes = await request(app)
      .post(`/api/v1/follow/${channel._id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(followRes.statusCode).toBe(200);

    const updatedChannel = await Channel.findById(channel._id);
    expect(updatedChannel.followersCount).toBe(1);

    const notifications = await Notification.find({ recipient: updatedChannel.owner });
    expect(notifications).toHaveLength(1);
    expect(notifications[0].type).toBe('follow');
  });

  it('is idempotent when following twice', async () => {
    const { channel } = await createStreamerWithChannel();
    const token = await signupAndLoginViewer();

    await request(app).post(`/api/v1/follow/${channel._id}`).set('Authorization', `Bearer ${token}`);
    await request(app).post(`/api/v1/follow/${channel._id}`).set('Authorization', `Bearer ${token}`);

    const updatedChannel = await Channel.findById(channel._id);
    expect(updatedChannel.followersCount).toBe(1);
  });

  it('rejects following your own channel', async () => {
    const { streamer, channel } = await createStreamerWithChannel();

    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ identifier: streamer.email, password: 'p4ssword123' });

    const res = await request(app)
      .post(`/api/v1/follow/${channel._id}`)
      .set('Authorization', `Bearer ${loginRes.body.data.accessToken}`);

    expect(res.statusCode).toBe(400);
  });

  it('unfollows and decrements followersCount', async () => {
    const { channel } = await createStreamerWithChannel();
    const token = await signupAndLoginViewer();

    await request(app).post(`/api/v1/follow/${channel._id}`).set('Authorization', `Bearer ${token}`);
    const unfollowRes = await request(app)
      .delete(`/api/v1/follow/${channel._id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(unfollowRes.statusCode).toBe(200);

    const updatedChannel = await Channel.findById(channel._id);
    expect(updatedChannel.followersCount).toBe(0);
  });
});
