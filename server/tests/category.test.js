// Covers category CRUD (admin-only) and the public list/detail endpoints --
// the last backend module that had no dedicated test file yet.

import request from 'supertest';
import app from '../src/app.js';
import './setup.js';
import User from '../src/models/user.model.js';
import Category from '../src/models/category.model.js';

const loginAsAdmin = async () => {
  const admin = await User.create({
    username: 'catadmin',
    email: 'catadmin@streamverse.test',
    fullName: 'Cat Admin',
    password: 'p4ssword123',
    role: 'admin',
  });
  const res = await request(app).post('/api/v1/auth/login').send({ identifier: admin.email, password: 'p4ssword123' });
  return res.body.data.accessToken;
};

describe('Categories', () => {
  it('creates a category as admin and derives a slug', async () => {
    const token = await loginAsAdmin();

    const res = await request(app)
      .post('/api/v1/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Just Chatting' });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.category.slug).toBe('just-chatting');
  });

  it('rejects category creation from a non-admin', async () => {
    await request(app).post('/api/v1/auth/signup').send({
      username: 'notadmin',
      email: 'notadmin@streamverse.test',
      fullName: 'Not Admin',
      password: 'p4ssword123',
    });
    const login = await request(app)
      .post('/api/v1/auth/login')
      .send({ identifier: 'notadmin@streamverse.test', password: 'p4ssword123' });

    const res = await request(app)
      .post('/api/v1/categories')
      .set('Authorization', `Bearer ${login.body.data.accessToken}`)
      .send({ name: 'Should Fail' });

    expect(res.statusCode).toBe(403);
  });

  it('lists categories publicly and fetches one by slug', async () => {
    await Category.create({ name: 'Music', slug: 'music' });
    await Category.create({ name: 'Art', slug: 'art' });

    const list = await request(app).get('/api/v1/categories');
    expect(list.statusCode).toBe(200);
    expect(list.body.data.categories.length).toBeGreaterThanOrEqual(2);

    const detail = await request(app).get('/api/v1/categories/music');
    expect(detail.statusCode).toBe(200);
    expect(detail.body.data.category.name).toBe('Music');
  });

  it('rejects a duplicate category name', async () => {
    const token = await loginAsAdmin();
    await Category.create({ name: 'Sports', slug: 'sports' });

    const res = await request(app)
      .post('/api/v1/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Sports' });

    expect(res.statusCode).toBe(409);
  });

  it('deletes a category as admin', async () => {
    const token = await loginAsAdmin();
    const category = await Category.create({ name: 'Retro Gaming', slug: 'retro-gaming' });

    const res = await request(app)
      .delete(`/api/v1/categories/${category._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(await Category.findById(category._id)).toBeNull();
  });
});
