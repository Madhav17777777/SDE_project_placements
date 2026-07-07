// Integration tests for the full auth flow against an in-memory MongoDB
// (see tests/globalSetup.js). Covers signup, login, protected /me, and the
// refresh/rotate/logout token lifecycle end to end.

import request from 'supertest';
import app from '../src/app.js';
import './setup.js';
import User from '../src/models/user.model.js';

const testUser = {
  username: 'streamqueen',
  email: 'queen@streamverse.test',
  fullName: 'Stream Queen',
  password: 'p4ssword123',
};

describe('Auth flow', () => {
  it('signs up a new user and does not return the password hash', async () => {
    const res = await request(app).post('/api/v1/auth/signup').send(testUser);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.username).toBe(testUser.username);
    expect(res.body.data.user.password).toBeUndefined();

    const stored = await User.findOne({ email: testUser.email }).select('+password');
    expect(stored.password).not.toBe(testUser.password); // must be hashed
  });

  it('rejects duplicate signup with 409', async () => {
    await request(app).post('/api/v1/auth/signup').send(testUser);
    const res = await request(app).post('/api/v1/auth/signup').send(testUser);

    expect(res.statusCode).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('rejects login with wrong password', async () => {
    await request(app).post('/api/v1/auth/signup').send(testUser);

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ identifier: testUser.email, password: 'wrongpassword' });

    expect(res.statusCode).toBe(401);
  });

  it('logs in, sets a refresh cookie, and returns an access token', async () => {
    await request(app).post('/api/v1/auth/signup').send(testUser);

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ identifier: testUser.email, password: testUser.password });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.headers['set-cookie'].some((c) => c.startsWith('refreshToken='))).toBe(true);
  });

  it('rejects /me without a token, accepts it with a valid one', async () => {
    const unauth = await request(app).get('/api/v1/auth/me');
    expect(unauth.statusCode).toBe(401);

    await request(app).post('/api/v1/auth/signup').send(testUser);
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ identifier: testUser.email, password: testUser.password });

    const me = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${loginRes.body.data.accessToken}`);

    expect(me.statusCode).toBe(200);
    expect(me.body.data.user.email).toBe(testUser.email);
  });

  it('rotates the refresh token on /refresh-token and rejects reuse of the old one', async () => {
    await request(app).post('/api/v1/auth/signup').send(testUser);
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ identifier: testUser.email, password: testUser.password });

    const cookie = loginRes.headers['set-cookie'].find((c) => c.startsWith('refreshToken='));

    const refreshRes = await request(app).post('/api/v1/auth/refresh-token').set('Cookie', cookie);
    expect(refreshRes.statusCode).toBe(200);
    expect(refreshRes.body.data.accessToken).toBeDefined();

    // Reusing the now-revoked original refresh cookie must fail.
    const reuse = await request(app).post('/api/v1/auth/refresh-token').set('Cookie', cookie);
    expect(reuse.statusCode).toBe(401);
  });

  it('logs out and revokes the refresh token', async () => {
    await request(app).post('/api/v1/auth/signup').send(testUser);
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ identifier: testUser.email, password: testUser.password });

    const cookie = loginRes.headers['set-cookie'].find((c) => c.startsWith('refreshToken='));
    const accessToken = loginRes.body.data.accessToken;

    const logoutRes = await request(app)
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Cookie', cookie);
    expect(logoutRes.statusCode).toBe(200);

    const refreshAfterLogout = await request(app)
      .post('/api/v1/auth/refresh-token')
      .set('Cookie', cookie);
    expect(refreshAfterLogout.statusCode).toBe(401);
  });
});
