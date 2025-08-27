import { createMocks } from 'node-mocks-http';
import handler from '../business/classify';

describe('/api/business/classify', () => {
  it('should classify a SaaS business correctly', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        description: 'We are a SaaS company that provides project management software to small businesses. We charge $29/month per user and currently have 500 active users.'
      }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.success).toBe(true);
    expect(data.data).toBeDefined();
    expect(data.data.models).toBeDefined();
    expect(data.data.intents).toBeDefined();
    expect(data.data.drivers).toBeDefined();
  });

  it('should classify an e-commerce business correctly', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        description: 'We run an online store selling handmade jewelry. We have an average order value of $75 and a conversion rate of 2.5%.'
      }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.success).toBe(true);
    expect(data.data).toBeDefined();
  });

  it('should return 400 for missing description', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {}
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.success).toBe(false);
    expect(data.error).toBe('Business description is required');
  });

  it('should return 400 for invalid description type', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        description: 123 // Should be string
      }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.success).toBe(false);
    expect(data.error).toBe('Business description is required');
  });

  it('should return 405 for non-POST method', async () => {
    const { req, res } = createMocks({
      method: 'GET'
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
    const data = JSON.parse(res._getData());
    expect(data.success).toBe(false);
    expect(data.error).toBe('Method not allowed');
  });

  it('should handle empty description', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        description: ''
      }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.success).toBe(false);
    expect(data.error).toBe('Business description is required');
  });
});
