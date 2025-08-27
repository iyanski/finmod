import { BusinessClassifier } from '../business-classifier';

describe('BusinessClassifier', () => {
  let classifier: BusinessClassifier;

  beforeEach(() => {
    classifier = BusinessClassifier.getInstance();
  });

  describe('classifyBusiness', () => {
    it('should classify a SaaS business correctly', async () => {
      const description = 'We are a SaaS company that provides project management software to small businesses. We charge $29/month per user and currently have 500 active users.';
      
      const result = await classifier.classifyBusiness(description);
      
      expect(result).toBeDefined();
      expect(result.models).toBeDefined();
      expect(result.models.length).toBeGreaterThan(0);
      expect(result.intents).toBeDefined();
      expect(result.drivers).toBeDefined();
      expect(result.confidence).toBeGreaterThan(0);
    });

    it('should classify an e-commerce business correctly', async () => {
      const description = 'We run an online store selling handmade jewelry. We have an average order value of $75 and a conversion rate of 2.5%.';
      
      const result = await classifier.classifyBusiness(description);
      
      expect(result).toBeDefined();
      expect(result.models).toBeDefined();
      expect(result.models.length).toBeGreaterThan(0);
    });
  });

  describe('extractKeyMetrics', () => {
    it('should extract relevant metrics for SaaS business', async () => {
      const description = 'SaaS project management tool';
      const businessModel = {
        type: 'saas',
        subtype: 'b2b',
        confidence: 0.95,
        characteristics: ['subscription', 'software', 'b2b']
      };
      
      const metrics = await classifier.extractKeyMetrics(description, businessModel);
      
      expect(metrics).toBeDefined();
      expect(Array.isArray(metrics)).toBe(true);
      expect(metrics.length).toBeGreaterThan(0);
      expect(metrics).toContain('monthly_recurring_revenue');
      expect(metrics).toContain('customer_acquisition_cost');
    });
  });
});
