import request from 'supertest';
import { createTestApp } from './helpers/testApp';
import { config } from '../src/config';

describe('Basic Authentication Middleware', () => {
  let app: any;
  let context: any;

  beforeAll(() => {
    // Enable authentication for this test suite
    config.auth.enabled = true;
    config.auth.username = 'admin';
    config.auth.password = 'admin123';
  });

  afterAll(() => {
    // Restore default
    config.auth.enabled = false;
  });

  beforeEach(() => {
    const testSetup = createTestApp(true);
    app = testSetup.app;
    context = testSetup.context;
  });

  afterEach(() => {
    context.cleanup();
  });

  it('should return 401 Unauthorized when credentials are not supplied', async () => {
    const res = await request(app)
      .get('/api/leads')
      .expect(401);

    expect(res.headers['www-authenticate']).toContain('Basic realm="Lead Management Portal"');
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('Authentication required');
  });

  it('should return 401 Unauthorized with invalid credentials', async () => {
    const credentials = Buffer.from('admin:wrongpassword').toString('base64');

    const res = await request(app)
      .get('/api/leads')
      .set('Authorization', `Basic ${credentials}`)
      .expect(401);

    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('Invalid username or password');
  });

  it('should grant access and return 200 with valid credentials', async () => {
    const credentials = Buffer.from('admin:admin123').toString('base64');

    const res = await request(app)
      .get('/api/leads')
      .set('Authorization', `Basic ${credentials}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
  });
});
