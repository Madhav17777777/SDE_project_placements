// Covers the admin module added while starting Phase 8 (it was scoped for
// an earlier phase but never actually implemented until now): dashboard
// stats, role-gated access, ban/unban, and user deletion with cascade cleanup.

import request from 'supertest';
import app from '../src/app.js';
import './setup.js';
import User from '../src/models/user.model.js';
import Channel from '../src/models/channel.model.js';
import Video from '../src/models/video.model.js';

const createAdmin = async () => {
  const admin = await User.create({
    username: 'siteadmin',
    email: 'admin@streamverse.test',
    fullName: 'Site Admin',
    password: 'p4ssword123',
    role: 'admin',
  });
  const res = await request(app)
    .post('/api/v1/auth/login')
    .send({ identifier: admin.email, password: 'p4ssword123' });
  return res.body.data.accessToken;
};

describe('Admin access control', () => {
  it('rejects a regular user from admin routes', async () => {
    await request(app).post('/api/v1/auth/signup').send({
      username: 'regularjoe',
      email: 'joe@streamverse.test',
      fullName: 'Regular Joe',
      password: 'p4ssword123',
    });
    const login = await request(app)
      .post('/api/v1/auth/login')
      .send({ identifier: 'joe@streamverse.test', password: 'p4ssword123' });

    const res = await request(app)
      .get('/api/v1/admin/dashboard')
      .set('Authorization', `Bearer ${login.body.data.accessToken}`);
    expect(res.statusCode).toBe(403);
  });

  it('returns dashboard stats for an admin', async () => {
    const token = await createAdmin();
    const res = await request(app).get('/api/v1/admin/dashboard').set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveProperty('totalUsers');
    expect(res.body.data).toHaveProperty('liveStreamsCount');
  });
});

describe('Admin user moderation', () => {
  it('bans and unbans a user', async () => {
    const token = await createAdmin();
    const target = await User.create({
      username: 'troublemaker',
      email: 'trouble@streamverse.test',
      fullName: 'Trouble Maker',
      password: 'p4ssword123',
    });

    const ban = await request(app)
      .patch(`/api/v1/admin/users/${target._id}/ban`)
      .set('Authorization', `Bearer ${token}`)
      .send({ isBanned: true });
    expect(ban.statusCode).toBe(200);
    expect((await User.findById(target._id)).isBanned).toBe(true);

    const unban = await request(app)
      .patch(`/api/v1/admin/users/${target._id}/ban`)
      .set('Authorization', `Bearer ${token}`)
      .send({ isBanned: false });
    expect(unban.statusCode).toBe(200);
    expect((await User.findById(target._id)).isBanned).toBe(false);
  });

  it('deletes a user and cascades their channel and videos', async () => {
    const token = await createAdmin();
    const streamer = await User.create({
      username: 'todelete',
      email: 'todelete@streamverse.test',
      fullName: 'To Delete',
      password: 'p4ssword123',
      role: 'streamer',
    });
    const channel = await Channel.create({ owner: streamer._id, channelName: 'ToDeleteChannel', slug: 'todeletechannel' });
    await Video.create({
      owner: streamer._id,
      channel: channel._id,
      title: 'Orphan video',
      videoUrl: 'https://res.cloudinary.com/demo/video/upload/sample.mp4',
    });

    const res = await request(app)
      .delete(`/api/v1/admin/users/${streamer._id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);

    expect(await User.findById(streamer._id)).toBeNull();
    expect(await Channel.findById(channel._id)).toBeNull();
    expect(await Video.countDocuments({ channel: channel._id })).toBe(0);
  });
});
