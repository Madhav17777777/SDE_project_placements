// Covers Phase 6 video business logic. The upload endpoints themselves
// require a live Cloudinary account to stream a real file to (like
// avatar/banner in Phase 4), so these tests construct Video documents
// directly via the model and exercise everything downstream of that: listing,
// trending ranking, view counting, ownership-gated edit/delete, and cascade
// cleanup of comments/likes when a video is deleted.

import request from 'supertest';
import app from '../src/app.js';
import './setup.js';
import User from '../src/models/user.model.js';
import Channel from '../src/models/channel.model.js';
import Video from '../src/models/video.model.js';
import Comment from '../src/models/comment.model.js';
import Like from '../src/models/like.model.js';

const createStreamerWithVideo = async (overrides = {}) => {
  const owner = await User.create({
    username: 'videomaker',
    email: 'videomaker@streamverse.test',
    fullName: 'Video Maker',
    password: 'p4ssword123',
    role: 'streamer',
  });
  const channel = await Channel.create({
    owner: owner._id,
    channelName: 'VideoMakerChannel',
    slug: 'videomakerchannel',
  });
  const video = await Video.create({
    owner: owner._id,
    channel: channel._id,
    title: 'How to build a MERN app',
    videoUrl: 'https://res.cloudinary.com/demo/video/upload/sample.mp4',
    ...overrides,
  });
  return { owner, channel, video };
};

const loginAs = async (user) =>
  (
    await request(app)
      .post('/api/v1/auth/login')
      .send({ identifier: user.email, password: 'p4ssword123' })
  ).body.data.accessToken;

describe('Video listing and viewing', () => {
  it('lists public videos and hides private ones', async () => {
    await createStreamerWithVideo({ visibility: 'public' });
    await createStreamerWithVideo({
      title: 'A private video',
      visibility: 'private',
      videoUrl: 'https://res.cloudinary.com/demo/video/upload/private.mp4',
    });

    const res = await request(app).get('/api/v1/videos');
    expect(res.statusCode).toBe(200);
    expect(res.body.data.videos).toHaveLength(1);
    expect(res.body.data.videos[0].visibility).toBe('public');
  });

  it('increments the view count on fetch', async () => {
    const { video } = await createStreamerWithVideo();

    await request(app).get(`/api/v1/videos/${video._id}`);
    // View increment is fire-and-forget; give the event loop a tick.
    await new Promise((resolve) => setTimeout(resolve, 50));

    const updated = await Video.findById(video._id);
    expect(updated.views).toBe(1);
  });

  it('ranks trending videos by a recency-weighted score, not raw views', async () => {
    const { channel, owner } = await createStreamerWithVideo({ title: 'Old but popular' });
    const oldVideo = await Video.findOne({ title: 'Old but popular' });
    oldVideo.views = 1000;
    oldVideo.createdAt = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days old
    await oldVideo.save();

    const freshVideo = await Video.create({
      owner: owner._id,
      channel: channel._id,
      title: 'New and rising',
      videoUrl: 'https://res.cloudinary.com/demo/video/upload/fresh.mp4',
      views: 50,
    });

    const res = await request(app).get('/api/v1/videos/trending');
    const titles = res.body.data.videos.map((v) => v.title);
    expect(titles[0]).toBe(freshVideo.title); // recency decay should outrank the stale video
  });
});

describe('Video ownership', () => {
  it('rejects edit/delete from a non-owner', async () => {
    const { video } = await createStreamerWithVideo();

    const otherStreamer = await User.create({
      username: 'intruder',
      email: 'intruder@streamverse.test',
      fullName: 'Intruder',
      password: 'p4ssword123',
      role: 'streamer',
    });
    await Channel.create({ owner: otherStreamer._id, channelName: 'IntruderChannel', slug: 'intruderchannel' });

    const token = await loginAs(otherStreamer);

    const editRes = await request(app)
      .patch(`/api/v1/videos/${video._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Hijacked' });
    expect(editRes.statusCode).toBe(403);

    const deleteRes = await request(app)
      .delete(`/api/v1/videos/${video._id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(deleteRes.statusCode).toBe(403);
  });

  it('cascades deletes to comments and likes', async () => {
    const { owner, video } = await createStreamerWithVideo();
    const token = await loginAs(owner);

    await Comment.create({ video: video._id, author: owner._id, content: 'Nice video!' });
    await Like.create({ user: owner._id, target: video._id, targetType: 'Video', type: 'like' });

    const res = await request(app).delete(`/api/v1/videos/${video._id}`).set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);

    expect(await Comment.countDocuments({ video: video._id })).toBe(0);
    expect(await Like.countDocuments({ target: video._id })).toBe(0);
    expect(await Video.findById(video._id)).toBeNull();
  });
});

describe('Video reactions', () => {
  it('likes, switches to dislike, and toggles off', async () => {
    const { owner, video } = await createStreamerWithVideo();
    const token = await loginAs(owner);

    const like = await request(app)
      .post(`/api/v1/likes/video/${video._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ type: 'like' });
    expect(like.body.data.reaction).toBe('like');
    expect((await Video.findById(video._id)).likesCount).toBe(1);

    const dislike = await request(app)
      .post(`/api/v1/likes/video/${video._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ type: 'dislike' });
    expect(dislike.body.data.reaction).toBe('dislike');
    const afterSwitch = await Video.findById(video._id);
    expect(afterSwitch.likesCount).toBe(0);
    expect(afterSwitch.dislikesCount).toBe(1);

    const toggleOff = await request(app)
      .post(`/api/v1/likes/video/${video._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ type: 'dislike' });
    expect(toggleOff.body.data.reaction).toBeNull();
    expect((await Video.findById(video._id)).dislikesCount).toBe(0);
  });
});
