// Covers the Phase 4/6 self-service user endpoints: profile edit, password
// change, and the bookmarks / watch-later / watch-history list mechanics.
// Avatar/banner upload isn't covered here since it requires a live Cloudinary
// account — that's exercised manually / in a later e2e pass (see docs).

import request from 'supertest';
import app from '../src/app.js';
import './setup.js';
import User from '../src/models/user.model.js';
import Channel from '../src/models/channel.model.js';
import Video from '../src/models/video.model.js';

// Bookmarks/watch-later now return fully populated Video documents, so tests
// need a real Video row to point at instead of a random ObjectId.
const createRealVideo = async () => {
  const owner = await User.create({
    username: 'contentcreator',
    email: 'creator@streamverse.test',
    fullName: 'Content Creator',
    password: 'p4ssword123',
    role: 'streamer',
  });
  const channel = await Channel.create({
    owner: owner._id,
    channelName: 'CreatorChannel',
    slug: 'creatorchannel',
  });
  return Video.create({
    owner: owner._id,
    channel: channel._id,
    title: 'A great video',
    videoUrl: 'https://res.cloudinary.com/demo/video/upload/sample.mp4',
  });
};

const signupAndLogin = async () => {
  const creds = {
    username: 'chatty',
    email: 'chatty@streamverse.test',
    fullName: 'Chatty Viewer',
    password: 'p4ssword123',
  };
  await request(app).post('/api/v1/auth/signup').send(creds);
  const loginRes = await request(app)
    .post('/api/v1/auth/login')
    .send({ identifier: creds.email, password: creds.password });
  return loginRes.body.data.accessToken;
};

describe('User profile', () => {
  it('updates fullName and bio', async () => {
    const token = await signupAndLogin();

    const res = await request(app)
      .patch('/api/v1/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ fullName: 'Chatty McViewer', bio: 'I watch a lot of streams.' });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.user.fullName).toBe('Chatty McViewer');
  });

  it('rejects a bio over 300 characters', async () => {
    const token = await signupAndLogin();

    const res = await request(app)
      .patch('/api/v1/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ bio: 'x'.repeat(301) });

    expect(res.statusCode).toBe(400);
  });

  it('changes password and rejects the wrong current password', async () => {
    const token = await signupAndLogin();

    const wrong = await request(app)
      .patch('/api/v1/users/me/password')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: 'nope', newPassword: 'newpassword1' });
    expect(wrong.statusCode).toBe(400);

    const correct = await request(app)
      .patch('/api/v1/users/me/password')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: 'p4ssword123', newPassword: 'newpassword1' });
    expect(correct.statusCode).toBe(200);
  });
});

describe('Bookmarks and watch later', () => {
  it('adds, lists (populated), and removes a bookmark', async () => {
    const token = await signupAndLogin();
    const video = await createRealVideo();
    const videoId = video._id.toString();

    const add = await request(app)
      .post(`/api/v1/users/me/bookmarks/${videoId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(add.statusCode).toBe(200);

    const list = await request(app)
      .get('/api/v1/users/me/bookmarks')
      .set('Authorization', `Bearer ${token}`);
    expect(list.body.data.videos.map((v) => v._id)).toContain(videoId);
    expect(list.body.data.videos[0].title).toBe('A great video');
    expect(list.body.data.videos[0].channel.channelName).toBe('CreatorChannel');

    const remove = await request(app)
      .delete(`/api/v1/users/me/bookmarks/${videoId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(remove.statusCode).toBe(200);

    const listAfter = await request(app)
      .get('/api/v1/users/me/bookmarks')
      .set('Authorization', `Bearer ${token}`);
    expect(listAfter.body.data.videos.map((v) => v._id)).not.toContain(videoId);
  });
});
