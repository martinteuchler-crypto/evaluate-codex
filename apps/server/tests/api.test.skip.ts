import request from 'supertest';
import { createApp } from '../src/index';

describe('server API', () => {
  const { app, httpServer } = createApp();
  afterAll((done) => {
    httpServer.close(done);
  });

  it('creates a match', async () => {
    const res = await request(app).post('/api/matches');
    expect(res.status).toBe(200);
    expect(res.body.id).toBeDefined();
  });
});
