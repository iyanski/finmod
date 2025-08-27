import { TemplateEngine } from '../template-engine';
import { FinancialModel } from '@/types';

describe('TemplateEngine', () => {
  let templateEngine: TemplateEngine;

  beforeEach(() => {
    templateEngine = TemplateEngine.getInstance();
  });

  describe('getTemplate', () => {
    it('should return SaaS template for saas business type', () => {
      const template = templateEngine.getTemplate('saas');
      
      expect(template).toBeDefined();
      expect(template.id).toBe('saas');
      expect(template.name).toBe('SaaS Financial Model');
      expect(template.businessTypes).toContain('saas');
      expect(template.schema.inputs).toBeDefined();
      expect(template.schema.inputs.length).toBeGreaterThan(0);
    });

    it('should return default template for unknown business type', () => {
      const template = templateEngine.getTemplate('unknown_type');
      
      expect(template).toBeDefined();
      expect(template.id).toBe('default');
      expect(template.name).toBe('Default Financial Model');
    });
  });

  describe('applyTemplate', () => {
    it('should apply SaaS template and generate financial model', () => {
      const inputs = {
        initial_mrr: 50000,
        revenue_growth_rate: 0.05,
        churn_rate: 0.02,
        gross_margin: 0.8,
        sales_marketing_budget: 0.3,
        research_development_budget: 0.15,
        tax_rate: 0.25
      };

      const model = templateEngine.applyTemplate(
        templateEngine.getTemplate('saas'),
        inputs
      );

      expect(model).toBeDefined();
      expect(model.id).toBeDefined();
      expect(model.financialInputsId).toBe('temp');
      expect(model.incomeStatement).toBeDefined();
      expect(model.balanceSheet).toBeDefined();
      expect(model.cashFlowStatement).toBeDefined();
      expect(model.schedules).toBeDefined();
      expect(model.scenarios).toBeDefined();
      expect(model.auditChecks).toBeDefined();
    });

    it('should apply default template and generate financial model', () => {
      const inputs = {
        initial_revenue: 100000,
        revenue_growth_rate: 0.05
      };

      const model = templateEngine.applyTemplate(
        templateEngine.getTemplate('default'),
        inputs
      );

      expect(model).toBeDefined();
      expect(model.incomeStatement).toBeDefined();
      expect(model.balanceSheet).toBeDefined();
      expect(model.cashFlowStatement).toBeDefined();
    });

    it('should validate inputs and throw error for invalid data', () => {
      const inputs = {
        // Missing required fields
      };

      expect(() => {
        templateEngine.applyTemplate(
          templateEngine.getTemplate('saas'),
          inputs
        );
      }).toThrow();
    });

    it('should use default values when inputs are not provided', () => {
      const inputs = {
        initial_mrr: 50000
        // Other fields will use defaults
      };

      const model = templateEngine.applyTemplate(
        templateEngine.getTemplate('saas'),
        inputs
      );

      expect(model).toBeDefined();
      expect(model.incomeStatement).toBeDefined();
    });
  });

  describe('template validation', () => {
    it('should validate SaaS template inputs correctly', () => {
      const template = templateEngine.getTemplate('saas');
      
      // Test valid inputs
      const validInputs = {
        initial_mrr: 50000,
        revenue_growth_rate: 0.05,
        churn_rate: 0.02,
        gross_margin: 0.8,
        sales_marketing_budget: 0.3,
        research_development_budget: 0.15,
        tax_rate: 0.25
      };

      expect(() => {
        templateEngine.applyTemplate(template, validInputs);
      }).not.toThrow();

      // Test invalid inputs (growth rate too high)
      const invalidInputs = {
        ...validInputs,
        revenue_growth_rate: 0.8 // Should be > 0.5
      };

      expect(() => {
        templateEngine.applyTemplate(template, invalidInputs);
      }).toThrow();
    });

    it('should validate required fields', () => {
      const template = templateEngine.getTemplate('saas');
      
      const inputs = {
        // Missing required fields
        revenue_growth_rate: 0.05
      };

      expect(() => {
        templateEngine.applyTemplate(template, inputs);
      }).toThrow();
    });
  });

  describe('template structure', () => {
    it('should have proper template structure for SaaS', () => {
      const template = templateEngine.getTemplate('saas');
      
      expect(template.schema.inputs).toBeDefined();
      expect(template.schema.outputs).toBeDefined();
      expect(template.schema.schedules).toBeDefined();
      expect(template.formulas).toBeDefined();
      expect(template.sheets).toBeDefined();
      expect(template.validation).toBeDefined();

      // Check input definitions
      const mrrInput = template.schema.inputs.find(input => input.id === 'initial_mrr');
      expect(mrrInput).toBeDefined();
      expect(mrrInput?.type).toBe('currency');
      expect(mrrInput?.required).toBe(true);
      expect(mrrInput?.category).toBe('revenue');

      // Check validation rules
      const growthRateInput = template.schema.inputs.find(input => input.id === 'revenue_growth_rate');
      expect(growthRateInput?.validation).toBeDefined();
      expect(growthRateInput?.validation?.length).toBeGreaterThan(0);
    });

    it('should have proper template structure for default', () => {
      const template = templateEngine.getTemplate('default');
      
      expect(template.schema.inputs).toBeDefined();
      expect(template.schema.inputs.length).toBeGreaterThan(0);
      expect(template.schema.outputs).toBeDefined();
      expect(template.schema.schedules).toBeDefined();
    });
  });

  describe('formula evaluation', () => {
    it('should evaluate revenue formulas correctly', () => {
      const template = templateEngine.getTemplate('saas');
      const inputs = {
        initial_mrr: 50000,
        revenue_growth_rate: 0.05,
        churn_rate: 0.02
      };

      const model = templateEngine.applyTemplate(template, inputs);

      // Check that revenue grows over time
      const revenue = model.incomeStatement.revenue;
      expect(revenue[0]).toBeGreaterThan(0);
      
      // Revenue should generally increase (accounting for churn)
      const firstYearAvg = revenue.slice(0, 12).reduce((sum, r) => sum + r, 0) / 12;
      const secondYearAvg = revenue.slice(12, 24).reduce((sum, r) => sum + r, 0) / 12;
      expect(secondYearAvg).toBeGreaterThan(firstYearAvg * 0.9); // Allow for some churn
    });

    it('should evaluate cost formulas correctly', () => {
      const template = templateEngine.getTemplate('saas');
      const inputs = {
        initial_mrr: 50000,
        revenue_growth_rate: 0.05,
        churn_rate: 0.02,
        gross_margin: 0.8,
        sales_marketing_budget: 0.3,
        research_development_budget: 0.15,
        tax_rate: 0.25
      };

      const model = templateEngine.applyTemplate(template, inputs);

      // Check that COGS is calculated correctly
      const revenue = model.incomeStatement.revenue;
      const cogs = model.incomeStatement.costOfGoodsSold;
      const grossProfit = model.incomeStatement.grossProfit;

      for (let i = 0; i < revenue.length; i++) {
        expect(grossProfit[i]).toBeCloseTo(revenue[i] - cogs[i], 2);
      }
    });
  });

  describe('scenario generation', () => {
    it('should generate scenarios with template', () => {
      const template = templateEngine.getTemplate('saas');
      const inputs = {
        initial_mrr: 50000,
        revenue_growth_rate: 0.05,
        churn_rate: 0.02,
        gross_margin: 0.8,
        sales_marketing_budget: 0.3,
        research_development_budget: 0.15,
        tax_rate: 0.25
      };

      const model = templateEngine.applyTemplate(template, inputs);

      expect(model.scenarios).toBeDefined();
      expect(model.scenarios.length).toBeGreaterThan(0);

      // Should have base scenario
      const baseScenario = model.scenarios.find(s => s.type === 'base');
      expect(baseScenario).toBeDefined();
      expect(baseScenario?.results).toBeDefined();
    });
  });

  describe('audit checks', () => {
    it('should generate audit checks with template', () => {
      const template = templateEngine.getTemplate('saas');
      const inputs = {
        initial_mrr: 50000,
        revenue_growth_rate: 0.05,
        churn_rate: 0.02,
        gross_margin: 0.8,
        sales_marketing_budget: 0.3,
        research_development_budget: 0.15,
        tax_rate: 0.25
      };

      const model = templateEngine.applyTemplate(template, inputs);

      expect(model.auditChecks).toBeDefined();
      expect(model.auditChecks.length).toBeGreaterThan(0);

      // All audit checks should have valid status
      model.auditChecks.forEach(check => {
        expect(['pass', 'fail', 'warning']).toContain(check.status);
        expect(check.name).toBeDefined();
        expect(check.description).toBeDefined();
        expect(check.message).toBeDefined();
      });
    });
  });
});
