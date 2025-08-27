import { createMocks } from 'node-mocks-http';
import handler from '../questions/generate';

describe('/api/questions/generate', () => {
  describe('SaaS Business Questions', () => {
    it('should generate SaaS-specific questions', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          businessDescription: 'B2B SaaS project management platform with $50k MRR and 500 users',
          businessModel: {
            type: 'saas',
            subtype: 'project management',
            confidence: 0.95,
            characteristics: ['subscription based', 'b2b', 'software']
          },
          businessIntent: {
            currency: 'USD',
            startDate: '2025-01-01',
            timeGranularity: 'monthly',
            units: 'users',
            taxRegime: 'US corporate',
            geographicScope: 'national',
            planningHorizon: 60,
            keyDrivers: ['user growth', 'churn rate', 'pricing']
          },
          answeredQuestions: {},
          previousQuestions: []
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data).toBeInstanceOf(Array);
      expect(data.data.length).toBeGreaterThan(0);
      
      // Check for SaaS-specific questions
      const questionIds = data.data.map((q: any) => q.id);
      expect(questionIds).toContain('revenue_model');
      expect(questionIds).toContain('monthly_revenue');
      expect(questionIds).toContain('growth_rate');
      expect(questionIds).toContain('customer_count');
      expect(questionIds).toContain('average_revenue_per_customer');
    });

    it('should generate questions for high-growth SaaS', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          businessDescription: 'AI-powered analytics SaaS with 25% monthly growth',
          businessModel: {
            type: 'saas',
            subtype: 'analytics',
            confidence: 0.9,
            characteristics: ['ai', 'analytics', 'subscription']
          },
          businessIntent: {
            currency: 'USD',
            startDate: '2025-01-01',
            timeGranularity: 'monthly',
            units: 'seats',
            taxRegime: 'US corporate',
            geographicScope: 'global',
            planningHorizon: 60,
            keyDrivers: ['ai adoption', 'data volume', 'enterprise sales']
          },
          answeredQuestions: {
            revenue_model: 'SaaS Subscription',
            monthly_revenue: 10000
          },
          previousQuestions: []
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
    });
  });

  describe('E-commerce Business Questions', () => {
    it('should generate e-commerce subscription questions', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          businessDescription: 'Subscription box service for healthy snacks with 200 subscribers',
          businessModel: {
            type: 'ecommerce',
            subtype: 'subscription box',
            confidence: 0.95,
            characteristics: ['subscription based', 'physical goods', 'recurring revenue']
          },
          businessIntent: {
            currency: 'USD',
            startDate: '2025-01-01',
            timeGranularity: 'monthly',
            units: 'subscribers',
            taxRegime: 'US corporate',
            geographicScope: 'national',
            planningHorizon: 60,
            keyDrivers: ['customer acquisition', 'churn rate', 'cost of goods']
          },
          answeredQuestions: {},
          previousQuestions: []
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data).toBeInstanceOf(Array);
      expect(data.data.length).toBeGreaterThan(0);
    });

    it('should generate marketplace questions', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          businessDescription: 'Online marketplace for handmade crafts with $500k GMV',
          businessModel: {
            type: 'ecommerce',
            subtype: 'marketplace',
            confidence: 0.9,
            characteristics: ['marketplace', 'handmade', 'commission based']
          },
          businessIntent: {
            currency: 'USD',
            startDate: '2025-01-01',
            timeGranularity: 'monthly',
            units: 'transactions',
            taxRegime: 'US corporate',
            geographicScope: 'national',
            planningHorizon: 60,
            keyDrivers: ['seller acquisition', 'buyer retention', 'commission rates']
          },
          answeredQuestions: {
            revenue_model: 'Marketplace Commission'
          },
          previousQuestions: []
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
    });
  });

  describe('Services Business Questions', () => {
    it('should generate consulting services questions', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          businessDescription: 'Management consulting firm specializing in digital transformation',
          businessModel: {
            type: 'services',
            subtype: 'consulting',
            confidence: 0.95,
            characteristics: ['professional services', 'hourly billing', 'expertise based']
          },
          businessIntent: {
            currency: 'USD',
            startDate: '2025-01-01',
            timeGranularity: 'monthly',
            units: 'hours',
            taxRegime: 'US corporate',
            geographicScope: 'national',
            planningHorizon: 60,
            keyDrivers: ['utilization rate', 'hourly rates', 'team growth']
          },
          answeredQuestions: {},
          previousQuestions: []
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data).toBeInstanceOf(Array);
      expect(data.data.length).toBeGreaterThan(0);
    });

    it('should generate agency questions', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          businessDescription: 'Digital marketing agency with 5 team members',
          businessModel: {
            type: 'services',
            subtype: 'agency',
            confidence: 0.9,
            characteristics: ['marketing', 'project based', 'creative services']
          },
          businessIntent: {
            currency: 'USD',
            startDate: '2025-01-01',
            timeGranularity: 'monthly',
            units: 'projects',
            taxRegime: 'US corporate',
            geographicScope: 'regional',
            planningHorizon: 60,
            keyDrivers: ['client retention', 'project margins', 'team efficiency']
          },
          answeredQuestions: {
            revenue_model: 'Consulting/Services'
          },
          previousQuestions: []
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
    });
  });

  describe('Marketplace Business Questions', () => {
    it('should generate marketplace platform questions', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          businessDescription: 'Peer-to-peer car sharing marketplace with $500k GMV',
          businessModel: {
            type: 'marketplace',
            subtype: 'sharing economy',
            confidence: 0.95,
            characteristics: ['peer to peer', 'asset sharing', 'commission based']
          },
          businessIntent: {
            currency: 'USD',
            startDate: '2025-01-01',
            timeGranularity: 'monthly',
            units: 'bookings',
            taxRegime: 'US corporate',
            geographicScope: 'national',
            planningHorizon: 60,
            keyDrivers: ['supply growth', 'demand growth', 'take rate']
          },
          answeredQuestions: {},
          previousQuestions: []
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data).toBeInstanceOf(Array);
      expect(data.data.length).toBeGreaterThan(0);
    });
  });

  describe('Hardware Business Questions', () => {
    it('should generate hardware product questions', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          businessDescription: 'Smart home IoT device manufacturer selling 500 units per month',
          businessModel: {
            type: 'hardware',
            subtype: 'iot devices',
            confidence: 0.9,
            characteristics: ['hardware', 'iot', 'consumer electronics']
          },
          businessIntent: {
            currency: 'USD',
            startDate: '2025-01-01',
            timeGranularity: 'monthly',
            units: 'devices',
            taxRegime: 'US corporate',
            geographicScope: 'global',
            planningHorizon: 60,
            keyDrivers: ['production capacity', 'component costs', 'market adoption']
          },
          answeredQuestions: {},
          previousQuestions: []
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data).toBeInstanceOf(Array);
      expect(data.data.length).toBeGreaterThan(0);
    });
  });

  describe('Manufacturing Business Questions', () => {
    it('should generate manufacturing questions', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          businessDescription: 'Automotive parts manufacturer with 80% capacity utilization',
          businessModel: {
            type: 'manufacturing',
            subtype: 'automotive',
            confidence: 0.95,
            characteristics: ['manufacturing', 'b2b', 'automotive']
          },
          businessIntent: {
            currency: 'USD',
            startDate: '2025-01-01',
            timeGranularity: 'monthly',
            units: 'parts',
            taxRegime: 'US corporate',
            geographicScope: 'national',
            planningHorizon: 60,
            keyDrivers: ['capacity utilization', 'raw material costs', 'automotive demand']
          },
          answeredQuestions: {},
          previousQuestions: []
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data).toBeInstanceOf(Array);
      expect(data.data.length).toBeGreaterThan(0);
    });
  });

  describe('Real Estate Business Questions', () => {
    it('should generate real estate investment questions', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          businessDescription: 'Multi-family residential property investment with $2M property value',
          businessModel: {
            type: 'real_estate',
            subtype: 'residential rental',
            confidence: 0.95,
            characteristics: ['real estate', 'rental income', 'property investment']
          },
          businessIntent: {
            currency: 'USD',
            startDate: '2025-01-01',
            timeGranularity: 'monthly',
            units: 'units',
            taxRegime: 'US corporate',
            geographicScope: 'local',
            planningHorizon: 60,
            keyDrivers: ['occupancy rates', 'rental rates', 'property appreciation']
          },
          answeredQuestions: {},
          previousQuestions: []
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data).toBeInstanceOf(Array);
      expect(data.data.length).toBeGreaterThan(0);
    });
  });

  describe('Financial Business Questions', () => {
    it('should generate fintech questions', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          businessDescription: 'Digital wealth management platform with $50M AUM',
          businessModel: {
            type: 'financial',
            subtype: 'wealth management',
            confidence: 0.95,
            characteristics: ['fintech', 'wealth management', 'digital platform']
          },
          businessIntent: {
            currency: 'USD',
            startDate: '2025-01-01',
            timeGranularity: 'monthly',
            units: 'accounts',
            taxRegime: 'US corporate',
            geographicScope: 'national',
            planningHorizon: 60,
            keyDrivers: ['aum growth', 'fee rates', 'regulatory compliance']
          },
          answeredQuestions: {},
          previousQuestions: []
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data).toBeInstanceOf(Array);
      expect(data.data.length).toBeGreaterThan(0);
    });
  });

  describe('Question Flow and Dependencies', () => {
    it('should generate follow-up questions based on previous answers', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          businessDescription: 'B2B SaaS company',
          businessModel: {
            type: 'saas',
            subtype: 'project management',
            confidence: 0.95,
            characteristics: ['subscription based', 'b2b', 'software']
          },
          businessIntent: {
            currency: 'USD',
            startDate: '2025-01-01',
            timeGranularity: 'monthly',
            units: 'users',
            taxRegime: 'US corporate',
            geographicScope: 'national',
            planningHorizon: 60,
            keyDrivers: ['user growth', 'churn rate', 'pricing']
          },
          answeredQuestions: {
            revenue_model: 'SaaS Subscription',
            monthly_revenue: 50000,
            growth_rate: 15,
            customer_count: 500
          },
          previousQuestions: [
            { id: 'revenue_model', question: 'What is your primary revenue model?' },
            { id: 'monthly_revenue', question: 'What is your current monthly revenue?' },
            { id: 'growth_rate', question: 'What is your expected monthly growth rate (%)?' },
            { id: 'customer_count', question: 'How many customers do you currently have?' }
          ]
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data).toBeInstanceOf(Array);
    });

    it('should handle empty previous questions', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          businessDescription: 'E-commerce startup',
          businessModel: {
            type: 'ecommerce',
            subtype: 'direct sales',
            confidence: 0.9,
            characteristics: ['ecommerce', 'direct sales', 'retail']
          },
          businessIntent: {
            currency: 'USD',
            startDate: '2025-01-01',
            timeGranularity: 'monthly',
            units: 'orders',
            taxRegime: 'US corporate',
            geographicScope: 'national',
            planningHorizon: 60,
            keyDrivers: ['conversion rate', 'average order value', 'customer acquisition']
          },
          answeredQuestions: {},
          previousQuestions: []
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data).toBeInstanceOf(Array);
      expect(data.data.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should return 400 for missing business description', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          businessModel: {
            type: 'saas',
            subtype: 'project management',
            confidence: 0.95,
            characteristics: ['subscription based', 'b2b', 'software']
          },
          businessIntent: {
            currency: 'USD',
            startDate: '2025-01-01',
            timeGranularity: 'monthly',
            units: 'users',
            taxRegime: 'US corporate',
            geographicScope: 'national',
            planningHorizon: 60,
            keyDrivers: ['user growth', 'churn rate', 'pricing']
          },
          answeredQuestions: {},
          previousQuestions: []
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
    });

    it('should return 400 for missing business model', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          businessDescription: 'B2B SaaS company',
          businessIntent: {
            currency: 'USD',
            startDate: '2025-01-01',
            timeGranularity: 'monthly',
            units: 'users',
            taxRegime: 'US corporate',
            geographicScope: 'national',
            planningHorizon: 60,
            keyDrivers: ['user growth', 'churn rate', 'pricing']
          },
          answeredQuestions: {},
          previousQuestions: []
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
    });

    it('should return 400 for missing business intent', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          businessDescription: 'B2B SaaS company',
          businessModel: {
            type: 'saas',
            subtype: 'project management',
            confidence: 0.95,
            characteristics: ['subscription based', 'b2b', 'software']
          },
          answeredQuestions: {},
          previousQuestions: []
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
    });

    it('should return 405 for non-POST method', async () => {
      const { req, res } = createMocks({
        method: 'GET'
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(405);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
    });
  });
});
