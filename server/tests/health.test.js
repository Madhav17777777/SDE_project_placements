// Smoke test for Phase 2: confirms the Express app boots, the middleware
// stack doesn't throw, and both the /health check and the 404 handler
// respond with the correct envelope shape.

import request from 'supertest';
import app from '../src/app.js';

describe('GET /health', () => {
  it('returns 200 with a healthy status envelope', async () => {
    const res = await request(app).get('/health');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/healthy/i);
  });
});

describe('GET /api/v1', () => {
  it('returns the v1 API welcome payload', async () => {
    const res = await request(app).get('/api/v1');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('Unknown route', () => {
  it('returns a 404 in the standard error envelope', async () => {
    const res = await request(app).get('/api/v1/does-not-exist');

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/route not found/i);
  });
});
