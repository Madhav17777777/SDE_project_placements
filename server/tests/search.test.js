// Covers the unified search endpoint: `type=all` fan-out and single-type
// paginated search, using each model's own $text index.

import request from 'supertest';
import app from '../src/app.js';
import './setup.js';
import User from '../src/models/user.model.js';
import Channel from '../src/models/channel.model.js';
import Video from '../src/models/video.model.js';
import Category from '../src/models/category.model.js';

const seed = async () => {
  const owner = await User.create({
    username: 'speedrunner',
    email: 'speedrunner@streamverse.test',
    fullName: 'Speed Runner',
    password: 'p4ssword123',
    role: 'streamer',
  });
  const channel = await Channel.create({ owner: owner._id, channelName: 'SpeedrunCentral', slug: 'speedruncentral' });
  await Video.create({
    owner: owner._id,
    channel: channel._id,
    title: 'Speedrunning Hollow Knight in 90 minutes',
    videoUrl: 'https://res.cloudinary.com/demo/video/upload/sample.mp4',
  });
  await Category.create({ name: 'Speedrunning', slug: 'speedrunning' });
};

describe('Unified search', () => {
  it('returns a small fan-out across every entity for type=all', async () => {
    await seed();

    const res = await request(app).get('/api/v1/search').query({ q: 'speedrun', type: 'all' });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.videos.length).toBeGreaterThan(0);
    expect(res.body.data.categories.length).toBeGreaterThan(0);
  });

  it('returns paginated results for a single type', async () => {
    await seed();

    const res = await request(app).get('/api/v1/search').query({ q: 'speedrun', type: 'videos', limit: 5 });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.results.length).toBeGreaterThan(0);
    expect(res.body.data.meta).toHaveProperty('totalCount');
  });

  it('returns empty results for a blank query instead of erroring', async () => {
    const res = await request(app).get('/api/v1/search').query({ q: '' });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.videos).toEqual([]);
  });
});
