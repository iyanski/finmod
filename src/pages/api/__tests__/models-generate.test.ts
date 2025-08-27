import { createMocks } from 'node-mocks-http';
import handler from '../models/generate';

describe('/api/models/generate', () => {
  describe('SaaS Business Models', () => {
    it('should generate SaaS model with subscription metrics', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          businessType: 'saas',
          inputs: {
            initial_mrr: 50000,
            revenue_growth_rate: 0.15,
            churn_rate: 0.05,
            total_customers: 500,
            arpu: 100,
            initial_assets: 100000,
            depreciation_rate: 0.1,
            initial_debt: 0,
            interest_rate: 0.05,
            businessDescription: 'B2B SaaS project management platform',
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
            }
          }
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(data.data.incomeStatement).toBeDefined();
      expect(data.data.balanceSheet).toBeDefined();
      expect(data.data.cashFlowStatement).toBeDefined();
    });

    it('should handle SaaS model with high growth rate', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          businessType: 'saas',
          inputs: {
            initial_mrr: 10000,
            revenue_growth_rate: 0.25,
            churn_rate: 0.03,
            total_customers: 100,
            arpu: 100,
            initial_assets: 50000,
            depreciation_rate: 0.1,
            initial_debt: 0,
            interest_rate: 0.05,
            businessDescription: 'AI-powered analytics SaaS',
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
            }
          }
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
    });
  });

  describe('E-commerce Business Models', () => {
    it('should generate e-commerce subscription box model', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          businessType: 'ecommerce',
          inputs: {
            starting_customers: 200,
            new_customers_per_month: 40,
            churn_rate: 0.05,
            price_per_customer: 30,
            cogs_per_customer: 12,
            opex_per_month: 5000,
            initial_cash: 100000,
            initial_assets: 10000,
            depreciation_rate: 0.1,
            initial_debt: 0,
            interest_rate: 0.05,
            businessDescription: 'Subscription box service for healthy snacks',
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
            }
          }
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data.schedules).toBeDefined();
      expect(data.data.schedules.customer_schedule).toBeDefined();
    });

    it('should generate e-commerce marketplace model', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          businessType: 'ecommerce',
          inputs: {
            starting_customers: 1000,
            new_customers_per_month: 100,
            churn_rate: 0.08,
            price_per_customer: 50,
            cogs_per_customer: 35,
            opex_per_month: 15000,
            initial_cash: 200000,
            initial_assets: 50000,
            depreciation_rate: 0.1,
            initial_debt: 0,
            interest_rate: 0.05,
            businessDescription: 'Online marketplace for handmade crafts',
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
            }
          }
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
    });
  });

  describe('Services Business Models', () => {
    it('should generate consulting services model', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          businessType: 'services',
          inputs: {
            billable_hours: 160,
            hourly_rate: 150,
            utilization_rate: 0.75,
            team_size: 10,
            average_salary: 80000,
            other_expenses: 10000,
            initial_assets: 50000,
            depreciation_rate: 0.1,
            initial_debt: 0,
            interest_rate: 0.05,
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
            }
          }
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
    });

    it('should generate agency services model', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          businessType: 'services',
          inputs: {
            billable_hours: 120,
            hourly_rate: 200,
            utilization_rate: 0.8,
            team_size: 5,
            average_salary: 70000,
            other_expenses: 8000,
            initial_assets: 30000,
            depreciation_rate: 0.1,
            initial_debt: 0,
            interest_rate: 0.05,
            businessDescription: 'Digital marketing agency',
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
            }
          }
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
    });
  });

  describe('Marketplace Business Models', () => {
    it('should generate marketplace platform model', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          businessType: 'marketplace',
          inputs: {
            gmv: 500000,
            take_rate: 0.15,
            transaction_volume: 5000,
            average_order_value: 100,
            customer_acquisition_cost: 50,
            operating_expenses: 20000,
            initial_assets: 100000,
            depreciation_rate: 0.1,
            initial_debt: 0,
            interest_rate: 0.05,
            businessDescription: 'Peer-to-peer car sharing marketplace',
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
            }
          }
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
    });
  });

  describe('Hardware Business Models', () => {
    it('should generate hardware product model', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          businessType: 'hardware',
          inputs: {
            units_sold: 500,
            unit_price: 299,
            unit_cost: 150,
            inventory_turnover: 4,
            manufacturing_capacity: 1000,
            fixed_costs: 25000,
            initial_assets: 200000,
            depreciation_rate: 0.15,
            initial_debt: 0,
            interest_rate: 0.05,
            businessDescription: 'Smart home IoT device manufacturer',
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
            }
          }
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
    });
  });

  describe('Manufacturing Business Models', () => {
    it('should generate manufacturing model', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          businessType: 'manufacturing',
          inputs: {
            production_capacity: 10000,
            capacity_utilization: 0.8,
            unit_price: 50,
            variable_cost_per_unit: 30,
            fixed_manufacturing_costs: 100000,
            equipment_depreciation: 15000,
            initial_assets: 500000,
            depreciation_rate: 0.1,
            initial_debt: 0,
            interest_rate: 0.05,
            businessDescription: 'Automotive parts manufacturer',
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
            }
          }
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
    });
  });

  describe('Real Estate Business Models', () => {
    it('should generate real estate investment model', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          businessType: 'real_estate',
          inputs: {
            property_value: 2000000,
            rental_income: 15000,
            occupancy_rate: 0.95,
            operating_expenses: 5000,
            mortgage_payment: 8000,
            property_taxes: 24000,
            appreciation_rate: 0.03,
            initial_assets: 500000,
            depreciation_rate: 0.05,
            initial_debt: 1500000,
            interest_rate: 0.04,
            businessDescription: 'Multi-family residential property investment',
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
            }
          }
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
    });
  });

  describe('Financial Business Models', () => {
    it('should generate fintech model', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          businessType: 'financial',
          inputs: {
            assets_under_management: 50000000,
            management_fee: 0.01,
            transaction_volume: 10000000,
            transaction_fee: 0.0025,
            operating_expenses: 100000,
            regulatory_capital: 2000000,
            initial_assets: 1000000,
            depreciation_rate: 0.1,
            initial_debt: 0,
            interest_rate: 0.05,
            businessDescription: 'Digital wealth management platform',
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
            }
          }
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should return 400 for missing business type', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          inputs: {}
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
    });

    it('should return 400 for invalid business type', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          businessType: 'invalid_type',
          inputs: {}
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
    });

    it('should return 400 for missing required inputs', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          businessType: 'saas',
          inputs: {
            // Missing required fields
          }
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
