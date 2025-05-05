const request = require('supertest');
const app = require('../server');
const User = require('../models/user.model');

describe('Response Compression', () => {
  let token;
  let testUser;

  beforeEach(async () => {
    // Create an admin user
    testUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin'
    });

    // Login to get token
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'password123'
      });

    token = response.body.token;
  });

  it('should return gzip compressed response for GET requests', async () => {
    const response = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${token}`)
      .set('Accept-Encoding', 'gzip');

    expect(response.status).toBe(200);
    expect(response.headers['content-encoding']).toBe('gzip');
  });

  it('should return deflate compressed response when specified', async () => {
    const response = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${token}`)
      .set('Accept-Encoding', 'deflate');

    expect(response.status).toBe(200);
    expect(response.headers['content-encoding']).toBe('deflate');
  });

  it('should not compress response when no compression is requested', async () => {
    const response = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${token}`)
      .set('Accept-Encoding', '');

    expect(response.status).toBe(200);
    expect(response.headers['content-encoding']).toBeUndefined();
  });

  it('should compress large responses', async () => {
    // Create multiple users to generate a larger response
    const users = [];
    for (let i = 0; i < 100; i++) {
      users.push({
        name: `Test User ${i}`,
        email: `test${i}@example.com`,
        password: 'password123'
      });
    }
    await User.insertMany(users);

    const response = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${token}`)
      .set('Accept-Encoding', 'gzip');

    expect(response.status).toBe(200);
    expect(response.headers['content-encoding']).toBe('gzip');
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(100);
  });

  it('should compress single user response', async () => {
    const response = await request(app)
      .get(`/api/users/${testUser._id}`)
      .set('Authorization', `Bearer ${token}`)
      .set('Accept-Encoding', 'gzip');

    expect(response.status).toBe(200);
    expect(response.headers['content-encoding']).toBe('gzip');
    expect(response.body.email).toBe('admin@example.com');
    expect(response.headers['content-type']).toMatch(/application\/json/);
  });
});
