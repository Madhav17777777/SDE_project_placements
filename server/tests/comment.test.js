// Covers Phase 6 comments: top-level + nested replies (flattened to one
// level), pin/unpin (single pinned comment per video), and permission-gated
// delete (author, video owner, or admin).

import request from 'supertest';
import app from '../src/app.js';
import './setup.js';
import User from '../src/models/user.model.js';
import Channel from '../src/models/channel.model.js';
import Video from '../src/models/video.model.js';
import Comment from '../src/models/comment.model.js';

const setup = async () => {
  const owner = await User.create({
    username: 'streamerowner',
    email: 'owner@streamverse.test',
    fullName: 'Streamer Owner',
    password: 'p4ssword123',
    role: 'streamer',
  });
  const channel = await Channel.create({ owner: owner._id, channelName: 'OwnerChannel', slug: 'ownerchannel' });
  const video = await Video.create({
    owner: owner._id,
    channel: channel._id,
    title: 'A commentable video',
    videoUrl: 'https://res.cloudinary.com/demo/video/upload/sample.mp4',
  });

  const viewer = await User.create({
    username: 'commenter',
    email: 'commenter@streamverse.test',
    fullName: 'Commenter',
    password: 'p4ssword123',
  });

  const login = async (user) =>
    (
      await request(app)
        .post('/api/v1/auth/login')
        .send({ identifier: user.email, password: 'p4ssword123' })
    ).body.data.accessToken;

  return { owner, viewer, video, ownerToken: await login(owner), viewerToken: await login(viewer) };
};

describe('Comments and replies', () => {
  it('adds a top-level comment and a reply, flattening reply-to-reply', async () => {
    const { video, viewerToken } = await setup();

    const topRes = await request(app)
      .post(`/api/v1/comments/video/${video._id}`)
      .set('Authorization', `Bearer ${viewerToken}`)
      .send({ content: 'First!' });
    expect(topRes.statusCode).toBe(201);
    const topId = topRes.body.data.comment._id;

    const replyRes = await request(app)
      .post(`/api/v1/comments/${topId}/reply`)
      .set('Authorization', `Bearer ${viewerToken}`)
      .send({ content: 'Totally agree' });
    expect(replyRes.statusCode).toBe(201);
    const replyId = replyRes.body.data.comment._id;

    // Replying to the reply should still attach to the original top-level comment.
    const nestedReplyRes = await request(app)
      .post(`/api/v1/comments/${replyId}/reply`)
      .set('Authorization', `Bearer ${viewerToken}`)
      .send({ content: 'Me too' });
    expect(nestedReplyRes.statusCode).toBe(201);

    const nestedReplyDoc = await Comment.findById(nestedReplyRes.body.data.comment._id);
    expect(nestedReplyDoc.parentComment.toString()).toBe(topId);

    const list = await request(app).get(`/api/v1/comments/video/${video._id}`);
    expect(list.body.data.comments).toHaveLength(1);
    expect(list.body.data.comments[0].replyCount).toBe(2);

    const updatedVideo = await Video.findById(video._id);
    expect(updatedVideo.commentsCount).toBe(3);
  });

  it('lets only the video owner pin a comment, and enforces a single pinned comment', async () => {
    const { video, viewer, ownerToken, viewerToken } = await setup();

    const c1 = await Comment.create({ video: video._id, author: viewer._id, content: 'Comment 1' });
    const c2 = await Comment.create({ video: video._id, author: viewer._id, content: 'Comment 2' });

    const forbidden = await request(app)
      .post(`/api/v1/comments/${c1._id}/pin`)
      .set('Authorization', `Bearer ${viewerToken}`);
    expect(forbidden.statusCode).toBe(403);

    await request(app).post(`/api/v1/comments/${c1._id}/pin`).set('Authorization', `Bearer ${ownerToken}`);
    await request(app).post(`/api/v1/comments/${c2._id}/pin`).set('Authorization', `Bearer ${ownerToken}`);

    const refreshedC1 = await Comment.findById(c1._id);
    const refreshedC2 = await Comment.findById(c2._id);
    expect(refreshedC1.isPinned).toBe(false); // unpinned when c2 was pinned
    expect(refreshedC2.isPinned).toBe(true);
  });

  it('allows the video owner to delete someone else\'s comment (moderation)', async () => {
    const { video, viewer, ownerToken } = await setup();
    const comment = await Comment.create({ video: video._id, author: viewer._id, content: 'Spam' });

    const res = await request(app)
      .delete(`/api/v1/comments/${comment._id}`)
      .set('Authorization', `Bearer ${ownerToken}`);
    expect(res.statusCode).toBe(200);
    expect(await Comment.findById(comment._id)).toBeNull();
  });

  it('rejects a random user deleting someone else\'s comment', async () => {
    const { video, ownerToken } = await setup();

    const randomUser = await User.create({
      username: 'randomuser',
      email: 'random@streamverse.test',
      fullName: 'Random User',
      password: 'p4ssword123',
    });
    const randomLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ identifier: randomUser.email, password: 'p4ssword123' });

    const ownerComment = await request(app)
      .post(`/api/v1/comments/video/${video._id}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ content: 'Owner comment' });

    const res = await request(app)
      .delete(`/api/v1/comments/${ownerComment.body.data.comment._id}`)
      .set('Authorization', `Bearer ${randomLogin.body.data.accessToken}`);
    expect(res.statusCode).toBe(403);
  });
});
