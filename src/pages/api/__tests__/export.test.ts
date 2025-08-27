import { createMocks } from 'node-mocks-http';
import excelHandler from '../export/excel';
import csvHandler from '../export/csv';

describe('/api/export', () => {
  describe('Excel Export', () => {
    describe('SaaS Business Export', () => {
      it('should export SaaS model to Excel', async () => {
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

        await excelHandler(req, res);

        expect(res._getStatusCode()).toBe(200);
        expect(res._getHeaders()['content-type']).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        expect(res._getHeaders()['content-disposition']).toContain('attachment');
        expect(res._getHeaders()['content-disposition']).toContain('.xlsx');
      });
    });

    describe('E-commerce Business Export', () => {
      it('should export e-commerce subscription model to Excel', async () => {
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

        await excelHandler(req, res);

        expect(res._getStatusCode()).toBe(200);
        expect(res._getHeaders()['content-type']).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        expect(res._getHeaders()['content-disposition']).toContain('attachment');
        expect(res._getHeaders()['content-disposition']).toContain('.xlsx');
      });
    });

    describe('Services Business Export', () => {
      it('should export consulting services model to Excel', async () => {
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
              businessDescription: 'Management consulting firm',
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

        await excelHandler(req, res);

        expect(res._getStatusCode()).toBe(200);
        expect(res._getHeaders()['content-type']).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        expect(res._getHeaders()['content-disposition']).toContain('attachment');
        expect(res._getHeaders()['content-disposition']).toContain('.xlsx');
      });
    });

    describe('Marketplace Business Export', () => {
      it('should export marketplace model to Excel', async () => {
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

        await excelHandler(req, res);

        expect(res._getStatusCode()).toBe(200);
        expect(res._getHeaders()['content-type']).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        expect(res._getHeaders()['content-disposition']).toContain('attachment');
        expect(res._getHeaders()['content-disposition']).toContain('.xlsx');
      });
    });

    describe('Hardware Business Export', () => {
      it('should export hardware model to Excel', async () => {
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

        await excelHandler(req, res);

        expect(res._getStatusCode()).toBe(200);
        expect(res._getHeaders()['content-type']).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        expect(res._getHeaders()['content-disposition']).toContain('attachment');
        expect(res._getHeaders()['content-disposition']).toContain('.xlsx');
      });
    });

    describe('Manufacturing Business Export', () => {
      it('should export manufacturing model to Excel', async () => {
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

        await excelHandler(req, res);

        expect(res._getStatusCode()).toBe(200);
        expect(res._getHeaders()['content-type']).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        expect(res._getHeaders()['content-disposition']).toContain('attachment');
        expect(res._getHeaders()['content-disposition']).toContain('.xlsx');
      });
    });

    describe('Real Estate Business Export', () => {
      it('should export real estate model to Excel', async () => {
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

        await excelHandler(req, res);

        expect(res._getStatusCode()).toBe(200);
        expect(res._getHeaders()['content-type']).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        expect(res._getHeaders()['content-disposition']).toContain('attachment');
        expect(res._getHeaders()['content-disposition']).toContain('.xlsx');
      });
    });

    describe('Financial Business Export', () => {
      it('should export fintech model to Excel', async () => {
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

        await excelHandler(req, res);

        expect(res._getStatusCode()).toBe(200);
        expect(res._getHeaders()['content-type']).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        expect(res._getHeaders()['content-disposition']).toContain('attachment');
        expect(res._getHeaders()['content-disposition']).toContain('.xlsx');
      });
    });
  });

  describe('CSV Export', () => {
    describe('SaaS Business Export', () => {
      it('should export SaaS model to CSV', async () => {
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

        await csvHandler(req, res);

        expect(res._getStatusCode()).toBe(200);
        expect(res._getHeaders()['content-type']).toBe('application/zip');
        expect(res._getHeaders()['content-disposition']).toContain('attachment');
        expect(res._getHeaders()['content-disposition']).toContain('.zip');
      });
    });

    describe('E-commerce Business Export', () => {
      it('should export e-commerce model to CSV', async () => {
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

        await csvHandler(req, res);

        expect(res._getStatusCode()).toBe(200);
        expect(res._getHeaders()['content-type']).toBe('application/zip');
        expect(res._getHeaders()['content-disposition']).toContain('attachment');
        expect(res._getHeaders()['content-disposition']).toContain('.zip');
      });
    });
  });

  describe('Error Handling', () => {
    it('should return 400 for missing business type in Excel export', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          inputs: {}
        }
      });

      await excelHandler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
    });

    it('should return 400 for missing business type in CSV export', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          inputs: {}
        }
      });

      await csvHandler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
    });

    it('should return 400 for invalid business type in Excel export', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          businessType: 'invalid_type',
          inputs: {}
        }
      });

      await excelHandler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
    });

    it('should return 400 for invalid business type in CSV export', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          businessType: 'invalid_type',
          inputs: {}
        }
      });

      await csvHandler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
    });

    it('should return 405 for non-POST method in Excel export', async () => {
      const { req, res } = createMocks({
        method: 'GET'
      });

      await excelHandler(req, res);

      expect(res._getStatusCode()).toBe(405);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
    });

    it('should return 405 for non-POST method in CSV export', async () => {
      const { req, res } = createMocks({
        method: 'GET'
      });

      await csvHandler(req, res);

      expect(res._getStatusCode()).toBe(405);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
    });
  });
});
