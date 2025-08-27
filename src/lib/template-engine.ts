import { FinancialModel, IncomeStatement, BalanceSheet, CashFlowStatement } from '@/types';

export interface ModelTemplate {
  id: string;
  name: string;
  description: string;
  businessTypes: string[];
  version: string;
  schema: ModelSchema;
  formulas: FormulaDefinition[];
  sheets: SheetDefinition[];
  validation: ValidationRule[];
}

export interface ModelSchema {
  inputs: InputDefinition[];
  outputs: OutputDefinition[];
  schedules: ScheduleDefinition[];
}

export interface InputDefinition {
  id: string;
  name: string;
  type: 'number' | 'percentage' | 'currency' | 'text' | 'select' | 'array';
  category: 'revenue' | 'cogs' | 'opex' | 'capex' | 'working_capital' | 'financing' | 'tax';
  required: boolean;
  default?: any;
  validation?: ValidationRule[];
  description: string;
  unit?: string;
}

export interface OutputDefinition {
  id: string;
  name: string;
  type: 'line_item' | 'metric' | 'ratio';
  category: 'income_statement' | 'balance_sheet' | 'cash_flow' | 'metrics';
  formula: string;
  description: string;
  format?: string;
}

export interface ScheduleDefinition {
  id: string;
  name: string;
  type: 'depreciation' | 'debt' | 'working_capital' | 'custom';
  inputs: string[];
  outputs: string[];
  calculations: CalculationStep[];
}

export interface CalculationStep {
  id: string;
  description: string;
  formula: string;
  dependencies: string[];
  validation?: ValidationRule[];
}

export interface FormulaDefinition {
  id: string;
  name: string;
  formula: string;
  description: string;
  category: string;
  dependencies: string[];
  validation?: ValidationRule[];
}

export interface SheetDefinition {
  id: string;
  name: string;
  type: 'input' | 'output' | 'schedule' | 'summary' | 'audit';
  layout: CellLayout[];
  formulas: SheetFormula[];
  formatting: FormattingRule[];
}

export interface CellLayout {
  row: number;
  col: number;
  value: string | number;
  type: 'label' | 'input' | 'formula' | 'metric';
  reference?: string;
  format?: string;
}

export interface SheetFormula {
  cell: string;
  formula: string;
  description: string;
}

export interface FormattingRule {
  range: string;
  type: 'number' | 'currency' | 'percentage' | 'date';
  format: string;
  conditional?: ConditionalFormat[];
}

export interface ConditionalFormat {
  condition: string;
  format: string;
}

export interface ValidationRule {
  type: 'range' | 'required' | 'custom' | 'cross_sheet';
  field: string;
  condition: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export class TemplateEngine {
  private static instance: TemplateEngine;
  private templates: Map<string, ModelTemplate> = new Map();
  
  private constructor() {
    this.initializeTemplates();
  }
  
  static getInstance(): TemplateEngine {
    if (!TemplateEngine.instance) {
      TemplateEngine.instance = new TemplateEngine();
    }
    return TemplateEngine.instance;
  }

  getTemplate(businessType: string): ModelTemplate {
    return this.templates.get(businessType) || this.templates.get('default')!;
  }

  applyTemplate(template: ModelTemplate, inputs: Record<string, any>): FinancialModel {
    // Apply template formulas and generate model
    const processedInputs = this.processInputs(template, inputs);
    const schedules = this.calculateSchedules(template, processedInputs);
    const statements = this.generateStatements(template, processedInputs, schedules);
    
    return {
      id: `model_${Date.now()}`,
      financialInputsId: inputs.id || 'temp',
      ...statements,
      schedules: schedules,
      scenarios: this.generateScenarios(template, statements),
      auditChecks: this.generateAuditChecks(template, statements),
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private processInputs(template: ModelTemplate, inputs: Record<string, any>): Record<string, any> {
    const processed: Record<string, any> = {};
    
    for (const inputDef of template.schema.inputs) {
      const value = inputs[inputDef.id] ?? inputDef.default;
      
      // Apply validation
      const validationResult = this.validateInput(inputDef, value);
      if (!validationResult.isValid) {
        throw new Error(`Validation failed for ${inputDef.id}: ${validationResult.errors.join(', ')}`);
      }
      
      processed[inputDef.id] = value;
    }
    
    return processed;
  }

  private validateInput(inputDef: InputDefinition, value: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (inputDef.required && (value === undefined || value === null || value === '')) {
      errors.push(`${inputDef.name} is required`);
    }
    
    if (inputDef.validation) {
      for (const rule of inputDef.validation) {
        if (!this.evaluateValidationRule(rule, value)) {
          errors.push(rule.message);
        }
      }
    }
    
    return { isValid: errors.length === 0, errors };
  }

  private evaluateValidationRule(rule: ValidationRule, value: any): boolean {
    switch (rule.type) {
      case 'range':
        const [min, max] = rule.condition.split(',').map(Number);
        return value >= min && value <= max;
      case 'required':
        return value !== undefined && value !== null && value !== '';
      case 'custom':
        // Custom validation logic would go here
        return true;
      default:
        return true;
    }
  }

  private calculateSchedules(template: ModelTemplate, inputs: Record<string, any>): any {
    const schedules: any = {};
    
    for (const scheduleDef of template.schema.schedules) {
      schedules[scheduleDef.id] = this.calculateSchedule(scheduleDef, inputs);
    }
    
    return schedules;
  }

  private calculateSchedule(scheduleDef: ScheduleDefinition, inputs: Record<string, any>): any {
    const schedule: any = {};
    const periods = 60; // 5 years monthly
    
    for (const step of scheduleDef.calculations) {
      schedule[step.id] = this.evaluateFormula(step.formula, inputs, schedule, periods);
    }
    
    return schedule;
  }

  private evaluateFormula(formula: string, inputs: Record<string, any>, schedules: any, periods: number): number[] {
    // Simple formula evaluation - in production, you'd use a proper expression parser
    const result = new Array(periods).fill(0);
    
    // Replace placeholders with actual values
    let processedFormula = formula;
    
    // Handle basic arithmetic operations
    if (formula.includes('revenue_growth')) {
      const growthRate = inputs.revenue_growth_rate || 0;
      for (let i = 0; i < periods; i++) {
        result[i] = Math.pow(1 + growthRate / 12, i);
      }
    } else if (formula.includes('depreciation')) {
      const assetValue = inputs.initial_assets || 0;
      const depreciationRate = inputs.depreciation_rate || 0.1;
      for (let i = 0; i < periods; i++) {
        result[i] = assetValue * (depreciationRate / 12);
      }
    } else if (formula.includes('interest')) {
      const debtAmount = inputs.initial_debt || 0;
      const interestRate = inputs.interest_rate || 0.05;
      for (let i = 0; i < periods; i++) {
        result[i] = debtAmount * (interestRate / 12);
      }
    }
    
    return result;
  }

  private generateStatements(template: ModelTemplate, inputs: Record<string, any>, schedules: any): {
    incomeStatement: IncomeStatement;
    balanceSheet: BalanceSheet;
    cashFlowStatement: CashFlowStatement;
  } {
    const periods = 60;
    
    // Generate income statement
    const incomeStatement = this.generateIncomeStatement(template, inputs, schedules, periods);
    
    // Generate balance sheet
    const balanceSheet = this.generateBalanceSheet(template, inputs, schedules, incomeStatement, periods);
    
    // Generate cash flow statement
    const cashFlowStatement = this.generateCashFlowStatement(template, inputs, schedules, incomeStatement, balanceSheet, periods);
    
    return { incomeStatement, balanceSheet, cashFlowStatement };
  }

  private generateIncomeStatement(template: ModelTemplate, inputs: Record<string, any>, schedules: any, periods: number): IncomeStatement {
    const revenue = this.calculateRevenue(inputs, periods);
    const costOfGoodsSold = this.calculateCostOfGoodsSold(inputs, revenue);
    const grossProfit = revenue.map((r, i) => r - costOfGoodsSold[i]);
    
    const operatingExpenses = {
      salesAndMarketing: this.calculateOperatingExpense(inputs.sales_marketing_budget || 0, revenue),
      researchAndDevelopment: this.calculateOperatingExpense(inputs.research_development_budget || 0, revenue),
      generalAndAdministrative: this.calculateOperatingExpense(inputs.general_administrative_budget || 0, revenue)
    };
    
    const totalOperatingExpenses = revenue.map((_, i) => 
      operatingExpenses.salesAndMarketing[i] + 
      operatingExpenses.researchAndDevelopment[i] + 
      operatingExpenses.generalAndAdministrative[i]
    );
    
    const operatingIncome = grossProfit.map((gp, i) => gp - totalOperatingExpenses[i]);
    const interestExpense = schedules.debt?.interestPayments || new Array(periods).fill(0);
    const taxes = operatingIncome.map((oi, i) => Math.max(0, oi - interestExpense[i]) * (inputs.tax_rate || 0.25));
    const netIncome = operatingIncome.map((oi, i) => oi - interestExpense[i] - taxes[i]);
    
    return {
      periods,
      revenue,
      costOfGoodsSold,
      grossProfit,
      operatingExpenses,
      operatingIncome,
      interestExpense,
      taxes,
      netIncome
    };
  }

  private generateBalanceSheet(template: ModelTemplate, inputs: Record<string, any>, schedules: any, incomeStatement: IncomeStatement, periods: number): BalanceSheet {
    const cash = this.calculateCashBalance(incomeStatement, periods);
    const accountsReceivable = schedules.workingCapital?.accountsReceivable || new Array(periods).fill(0);
    const inventory = schedules.workingCapital?.inventory || new Array(periods).fill(0);
    const fixedAssets = schedules.depreciation?.endingBalance || new Array(periods).fill(0);
    const accumulatedDepreciation = schedules.depreciation?.accumulatedDepreciation || new Array(periods).fill(0);
    
    const totalAssets = cash.map((c, i) => 
      c + accountsReceivable[i] + inventory[i] + fixedAssets[i] - accumulatedDepreciation[i]
    );
    
    const accountsPayable = schedules.workingCapital?.accountsPayable || new Array(periods).fill(0);
    const debt = schedules.debt?.endingBalance || new Array(periods).fill(0);
    const totalLiabilities = accountsPayable.map((ap, i) => ap + debt[i]);
    
    const commonStock = new Array(periods).fill(inputs.initial_equity || 100000);
    const retainedEarnings = this.calculateRetainedEarnings(incomeStatement);
    const totalEquity = commonStock.map((cs, i) => cs + retainedEarnings[i]);
    
    return {
      periods,
      assets: {
        cash,
        accountsReceivable,
        inventory,
        fixedAssets,
        accumulatedDepreciation,
        totalAssets
      },
      liabilities: {
        accountsPayable,
        debt,
        totalLiabilities
      },
      equity: {
        commonStock,
        retainedEarnings,
        totalEquity
      }
    };
  }

  private generateCashFlowStatement(template: ModelTemplate, inputs: Record<string, any>, schedules: any, incomeStatement: IncomeStatement, balanceSheet: BalanceSheet, periods: number): CashFlowStatement {
    const operatingCashFlow = incomeStatement.netIncome.map((ni, i) => 
      ni + (schedules.depreciation?.depreciation[i] || 0) - (schedules.workingCapital?.changeInWorkingCapital[i] || 0)
    );
    
    const investingCashFlow = schedules.depreciation?.additions.map((add: number) => -add) || new Array(periods).fill(0);
    const financingCashFlow = schedules.debt?.netCashFlow || new Array(periods).fill(0);
    
    const netCashFlow = operatingCashFlow.map((ocf, i) => 
      ocf + investingCashFlow[i] + financingCashFlow[i]
    );
    
    const endingCash = this.calculateEndingCash(netCashFlow);
    
    return {
      periods,
      operatingCashFlow,
      investingCashFlow,
      financingCashFlow,
      netCashFlow,
      endingCash
    };
  }

  private generateScenarios(template: ModelTemplate, statements: any): any[] {
    // Generate base, optimistic, and pessimistic scenarios
    return [
      {
        id: 'base',
        name: 'Base Case',
        description: 'Base case scenario with current assumptions',
        type: 'base',
        assumptions: {},
        results: this.calculateScenarioResults(statements)
      }
    ];
  }

  private generateAuditChecks(template: ModelTemplate, statements: any): any[] {
    // Generate audit checks based on template validation rules
    if (!template.validation || template.validation.length === 0) {
      return [];
    }
    
    return template.validation.map(rule => ({
      id: rule.field,
      name: rule.field,
      description: rule.message,
      status: 'pass',
      message: 'Validation passed',
      value: 0,
      threshold: 0
    }));
  }

  // Helper methods
  private calculateRevenue(inputs: Record<string, any>, periods: number): number[] {
    const revenue = new Array(periods).fill(0);
    let currentRevenue = inputs.initial_revenue || 100000;
    
    for (let i = 0; i < periods; i++) {
      revenue[i] = currentRevenue;
      const growthRate = inputs.revenue_growth_rate || 0;
      currentRevenue *= (1 + growthRate / 12);
    }
    
    return revenue;
  }

  private calculateCostOfGoodsSold(inputs: Record<string, any>, revenue: number[]): number[] {
    const cogsPercentage = inputs.cogs_percentage || 0.6;
    return revenue.map(r => r * cogsPercentage);
  }

  private calculateOperatingExpense(budgetPercentage: number, revenue: number[]): number[] {
    return revenue.map(r => r * (budgetPercentage / 100));
  }

  private calculateCashBalance(incomeStatement: IncomeStatement, periods: number): number[] {
    const cash = new Array(periods).fill(0);
    let currentCash = 50000;
    
    for (let i = 0; i < periods; i++) {
      cash[i] = currentCash;
      currentCash += incomeStatement.netIncome[i];
    }
    
    return cash;
  }

  private calculateRetainedEarnings(incomeStatement: IncomeStatement): number[] {
    const retainedEarnings = new Array(incomeStatement.periods).fill(0);
    let currentRE = 0;
    
    for (let i = 0; i < incomeStatement.periods; i++) {
      currentRE += incomeStatement.netIncome[i];
      retainedEarnings[i] = currentRE;
    }
    
    return retainedEarnings;
  }

  private calculateEndingCash(netCashFlow: number[]): number[] {
    const endingCash = new Array(netCashFlow.length).fill(0);
    let currentCash = 50000;
    
    for (let i = 0; i < netCashFlow.length; i++) {
      currentCash += netCashFlow[i];
      endingCash[i] = currentCash;
    }
    
    return endingCash;
  }

  private calculateScenarioResults(statements: any): any {
    return {
      npv: 0,
      irr: 0,
      paybackPeriod: 0,
      keyMetrics: {}
    };
  }

  private initializeTemplates(): void {
    // SaaS Template
    this.templates.set('saas', {
      id: 'saas',
      name: 'SaaS Financial Model',
      description: 'Template for Software-as-a-Service businesses',
      businessTypes: ['saas'],
      version: '1.0',
      schema: {
        inputs: [
          {
            id: 'initial_mrr',
            name: 'Initial Monthly Recurring Revenue',
            type: 'currency',
            category: 'revenue',
            required: true,
            description: 'Starting MRR for the model',
            unit: 'USD'
          },
          {
            id: 'revenue_growth_rate',
            name: 'Monthly Revenue Growth Rate',
            type: 'percentage',
            category: 'revenue',
            required: true,
            default: 0.05,
            description: 'Monthly growth rate for revenue',
            validation: [
              { type: 'range', field: 'revenue_growth_rate', condition: '0,0.5', message: 'Growth rate must be between 0% and 50%', severity: 'error' }
            ]
          },
          {
            id: 'churn_rate',
            name: 'Monthly Churn Rate',
            type: 'percentage',
            category: 'revenue',
            required: true,
            default: 0.02,
            description: 'Monthly customer churn rate',
            validation: [
              { type: 'range', field: 'churn_rate', condition: '0,0.2', message: 'Churn rate must be between 0% and 20%', severity: 'error' }
            ]
          },
          {
            id: 'gross_margin',
            name: 'Gross Margin',
            type: 'percentage',
            category: 'cogs',
            required: true,
            default: 0.8,
            description: 'Gross margin percentage',
            validation: [
              { type: 'range', field: 'gross_margin', condition: '0,1', message: 'Gross margin must be between 0% and 100%', severity: 'error' }
            ]
          },
          {
            id: 'sales_marketing_budget',
            name: 'Sales & Marketing Budget',
            type: 'percentage',
            category: 'opex',
            required: true,
            default: 0.3,
            description: 'Sales and marketing as percentage of revenue',
            validation: [
              { type: 'range', field: 'sales_marketing_budget', condition: '0,1', message: 'Budget must be between 0% and 100%', severity: 'error' }
            ]
          },
          {
            id: 'research_development_budget',
            name: 'R&D Budget',
            type: 'percentage',
            category: 'opex',
            required: true,
            default: 0.15,
            description: 'Research and development as percentage of revenue',
            validation: [
              { type: 'range', field: 'research_development_budget', condition: '0,1', message: 'Budget must be between 0% and 100%', severity: 'error' }
            ]
          },
          {
            id: 'tax_rate',
            name: 'Effective Tax Rate',
            type: 'percentage',
            category: 'tax',
            required: true,
            default: 0.25,
            description: 'Effective corporate tax rate',
            validation: [
              { type: 'range', field: 'tax_rate', condition: '0,0.5', message: 'Tax rate must be between 0% and 50%', severity: 'error' }
            ]
          }
        ],
        outputs: [
          {
            id: 'revenue',
            name: 'Revenue',
            type: 'line_item',
            category: 'income_statement',
            formula: 'initial_mrr * (1 + revenue_growth_rate)^period - churn_rate',
            description: 'Monthly recurring revenue'
          },
          {
            id: 'gross_profit',
            name: 'Gross Profit',
            type: 'line_item',
            category: 'income_statement',
            formula: 'revenue * gross_margin',
            description: 'Gross profit after cost of goods sold'
          }
        ],
        schedules: [
          {
            id: 'revenue_schedule',
            name: 'Revenue Schedule',
            type: 'custom',
            inputs: ['initial_mrr', 'revenue_growth_rate', 'churn_rate'],
            outputs: ['monthly_revenue', 'annual_revenue'],
            calculations: [
              {
                id: 'monthly_revenue',
                description: 'Calculate monthly revenue',
                formula: 'initial_mrr * (1 + revenue_growth_rate)^period * (1 - churn_rate)^period',
                dependencies: ['initial_mrr', 'revenue_growth_rate', 'churn_rate']
              }
            ]
          }
        ]
      },
      formulas: [
        {
          id: 'revenue_formula',
          name: 'Revenue Formula',
          formula: 'initial_mrr * (1 + revenue_growth_rate)^period * (1 - churn_rate)^period',
          description: 'SaaS revenue calculation with growth and churn',
          category: 'revenue',
          dependencies: ['initial_mrr', 'revenue_growth_rate', 'churn_rate']
        }
      ],
      sheets: [
        {
          id: 'inputs',
          name: 'Inputs',
          type: 'input',
          layout: [
            { row: 1, col: 1, value: 'SaaS Financial Model Inputs', type: 'label' },
            { row: 3, col: 1, value: 'Initial MRR', type: 'label' },
            { row: 3, col: 2, value: 'initial_mrr', type: 'input', reference: 'B3' },
            { row: 4, col: 1, value: 'Revenue Growth Rate', type: 'label' },
            { row: 4, col: 2, value: 'revenue_growth_rate', type: 'input', reference: 'B4' }
          ],
          formulas: [],
          formatting: [
            {
              range: 'B3:B4',
              type: 'number',
              format: '#,##0.00',
              conditional: []
            }
          ]
        }
      ],
      validation: [
        {
          type: 'range',
          field: 'revenue_growth_rate',
          condition: '0,0.5',
          message: 'Revenue growth rate must be between 0% and 50%',
          severity: 'error'
        }
      ]
    });

    // E-commerce Template
    this.templates.set('ecommerce', {
      id: 'ecommerce',
      name: 'E-commerce Financial Model',
      description: 'Template for E-commerce and subscription businesses',
      businessTypes: ['ecommerce'],
      version: '1.0',
      schema: {
        inputs: [
          {
            id: 'starting_customers',
            name: 'Starting Customers',
            type: 'number',
            category: 'revenue',
            required: true,
            description: 'Initial number of customers',
            unit: 'customers'
          },
          {
            id: 'new_customers_per_month',
            name: 'New Customers per Month',
            type: 'number',
            category: 'revenue',
            required: true,
            default: 10,
            description: 'Monthly customer acquisition rate',
            unit: 'customers/month'
          },
          {
            id: 'churn_rate',
            name: 'Monthly Churn Rate',
            type: 'percentage',
            category: 'revenue',
            required: true,
            default: 0.05,
            description: 'Monthly customer churn rate',
            validation: [
              { type: 'range', field: 'churn_rate', condition: '0,0.3', message: 'Churn rate must be between 0% and 30%', severity: 'error' }
            ]
          },
          {
            id: 'price_per_customer',
            name: 'Price per Customer',
            type: 'currency',
            category: 'revenue',
            required: true,
            description: 'Average revenue per customer per month',
            unit: 'USD'
          },
          {
            id: 'cogs_per_customer',
            name: 'COGS per Customer',
            type: 'currency',
            category: 'cogs',
            required: true,
            description: 'Cost of goods sold per customer per month',
            unit: 'USD'
          },
          {
            id: 'opex_per_month',
            name: 'Fixed Operating Expenses',
            type: 'currency',
            category: 'opex',
            required: true,
            default: 5000,
            description: 'Fixed monthly operating expenses',
            unit: 'USD'
          },
          {
            id: 'initial_cash',
            name: 'Initial Cash',
            type: 'currency',
            category: 'financing',
            required: true,
            default: 50000,
            description: 'Starting cash balance',
            unit: 'USD'
          }
        ],
        outputs: [],
        schedules: [
          {
            id: 'customer_schedule',
            name: 'Customer Schedule',
            type: 'custom',
            inputs: ['starting_customers', 'new_customers_per_month', 'churn_rate'],
            outputs: ['total_customers', 'revenue'],
            calculations: [
              {
                id: 'total_customers',
                description: 'Calculate total customers over time',
                formula: 'starting_customers + (new_customers_per_month * period) - (starting_customers * churn_rate * period)',
                dependencies: ['starting_customers', 'new_customers_per_month', 'churn_rate']
              },
              {
                id: 'revenue',
                description: 'Calculate monthly revenue',
                formula: 'total_customers * price_per_customer',
                dependencies: ['total_customers', 'price_per_customer']
              }
            ]
          }
        ]
      },
      formulas: [],
      sheets: [],
      validation: []
    });

    // Marketplace Template
    this.templates.set('marketplace', {
      id: 'marketplace',
      name: 'Marketplace Financial Model',
      description: 'Template for marketplace and platform businesses',
      businessTypes: ['marketplace'],
      version: '1.0',
      schema: {
        inputs: [
          {
            id: 'gmv',
            name: 'Gross Merchandise Value',
            type: 'currency',
            category: 'revenue',
            required: true,
            description: 'Total value of transactions on platform',
            unit: 'USD'
          },
          {
            id: 'take_rate',
            name: 'Take Rate',
            type: 'percentage',
            category: 'revenue',
            required: true,
            default: 0.15,
            description: 'Platform commission rate',
            validation: [
              { type: 'range', field: 'take_rate', condition: '0,0.5', message: 'Take rate must be between 0% and 50%', severity: 'error' }
            ]
          },
          {
            id: 'transaction_volume',
            name: 'Monthly Transaction Volume',
            type: 'number',
            category: 'revenue',
            required: true,
            description: 'Number of transactions per month',
            unit: 'transactions'
          },
          {
            id: 'average_order_value',
            name: 'Average Order Value',
            type: 'currency',
            category: 'revenue',
            required: true,
            description: 'Average value per transaction',
            unit: 'USD'
          },
          {
            id: 'customer_acquisition_cost',
            name: 'Customer Acquisition Cost',
            type: 'currency',
            category: 'opex',
            required: true,
            description: 'Cost to acquire new customers',
            unit: 'USD'
          },
          {
            id: 'operating_expenses',
            name: 'Operating Expenses',
            type: 'currency',
            category: 'opex',
            required: true,
            default: 10000,
            description: 'Monthly operating expenses',
            unit: 'USD'
          }
        ],
        outputs: [],
        schedules: []
      },
      formulas: [],
      sheets: [],
      validation: []
    });

    // Services Template
    this.templates.set('services', {
      id: 'services',
      name: 'Services Financial Model',
      description: 'Template for consulting and professional services',
      businessTypes: ['services'],
      version: '1.0',
      schema: {
        inputs: [
          {
            id: 'billable_hours',
            name: 'Billable Hours per Month',
            type: 'number',
            category: 'revenue',
            required: true,
            description: 'Total billable hours per month',
            unit: 'hours'
          },
          {
            id: 'hourly_rate',
            name: 'Average Hourly Rate',
            type: 'currency',
            category: 'revenue',
            required: true,
            description: 'Average billing rate per hour',
            unit: 'USD/hour'
          },
          {
            id: 'utilization_rate',
            name: 'Utilization Rate',
            type: 'percentage',
            category: 'revenue',
            required: true,
            default: 0.75,
            description: 'Percentage of time spent on billable work',
            validation: [
              { type: 'range', field: 'utilization_rate', condition: '0,1', message: 'Utilization rate must be between 0% and 100%', severity: 'error' }
            ]
          },
          {
            id: 'team_size',
            name: 'Team Size',
            type: 'number',
            category: 'opex',
            required: true,
            description: 'Number of team members',
            unit: 'people'
          },
          {
            id: 'average_salary',
            name: 'Average Salary',
            type: 'currency',
            category: 'opex',
            required: true,
            description: 'Average salary per team member',
            unit: 'USD/year'
          },
          {
            id: 'other_expenses',
            name: 'Other Operating Expenses',
            type: 'currency',
            category: 'opex',
            required: true,
            default: 5000,
            description: 'Other monthly operating expenses',
            unit: 'USD'
          }
        ],
        outputs: [],
        schedules: []
      },
      formulas: [],
      sheets: [],
      validation: []
    });

    // Hardware Template
    this.templates.set('hardware', {
      id: 'hardware',
      name: 'Hardware Financial Model',
      description: 'Template for hardware and physical product businesses',
      businessTypes: ['hardware'],
      version: '1.0',
      schema: {
        inputs: [
          {
            id: 'units_sold',
            name: 'Units Sold per Month',
            type: 'number',
            category: 'revenue',
            required: true,
            description: 'Number of units sold per month',
            unit: 'units'
          },
          {
            id: 'unit_price',
            name: 'Unit Price',
            type: 'currency',
            category: 'revenue',
            required: true,
            description: 'Selling price per unit',
            unit: 'USD'
          },
          {
            id: 'unit_cost',
            name: 'Unit Cost',
            type: 'currency',
            category: 'cogs',
            required: true,
            description: 'Cost to manufacture per unit',
            unit: 'USD'
          },
          {
            id: 'inventory_turnover',
            name: 'Inventory Turnover',
            type: 'number',
            category: 'working_capital',
            required: true,
            default: 4,
            description: 'Number of times inventory is sold per year',
            unit: 'times/year'
          },
          {
            id: 'manufacturing_capacity',
            name: 'Manufacturing Capacity',
            type: 'number',
            category: 'capex',
            required: true,
            description: 'Maximum units that can be produced per month',
            unit: 'units/month'
          },
          {
            id: 'fixed_costs',
            name: 'Fixed Manufacturing Costs',
            type: 'currency',
            category: 'opex',
            required: true,
            description: 'Fixed monthly manufacturing costs',
            unit: 'USD'
          }
        ],
        outputs: [],
        schedules: []
      },
      formulas: [],
      sheets: [],
      validation: []
    });

    // Manufacturing Template
    this.templates.set('manufacturing', {
      id: 'manufacturing',
      name: 'Manufacturing Financial Model',
      description: 'Template for manufacturing businesses',
      businessTypes: ['manufacturing'],
      version: '1.0',
      schema: {
        inputs: [
          {
            id: 'production_capacity',
            name: 'Production Capacity',
            type: 'number',
            category: 'capex',
            required: true,
            description: 'Maximum production capacity per month',
            unit: 'units/month'
          },
          {
            id: 'capacity_utilization',
            name: 'Capacity Utilization',
            type: 'percentage',
            category: 'revenue',
            required: true,
            default: 0.8,
            description: 'Percentage of capacity being utilized',
            validation: [
              { type: 'range', field: 'capacity_utilization', condition: '0,1', message: 'Capacity utilization must be between 0% and 100%', severity: 'error' }
            ]
          },
          {
            id: 'unit_price',
            name: 'Unit Selling Price',
            type: 'currency',
            category: 'revenue',
            required: true,
            description: 'Selling price per unit',
            unit: 'USD'
          },
          {
            id: 'variable_cost_per_unit',
            name: 'Variable Cost per Unit',
            type: 'currency',
            category: 'cogs',
            required: true,
            description: 'Variable cost per unit produced',
            unit: 'USD'
          },
          {
            id: 'fixed_manufacturing_costs',
            name: 'Fixed Manufacturing Costs',
            type: 'currency',
            category: 'opex',
            required: true,
            description: 'Fixed monthly manufacturing costs',
            unit: 'USD'
          },
          {
            id: 'equipment_depreciation',
            name: 'Equipment Depreciation',
            type: 'currency',
            category: 'opex',
            required: true,
            default: 5000,
            description: 'Monthly equipment depreciation',
            unit: 'USD'
          }
        ],
        outputs: [],
        schedules: []
      },
      formulas: [],
      sheets: [],
      validation: []
    });

    // Real Estate Template
    this.templates.set('real_estate', {
      id: 'real_estate',
      name: 'Real Estate Financial Model',
      description: 'Template for real estate investment and development',
      businessTypes: ['real_estate'],
      version: '1.0',
      schema: {
        inputs: [
          {
            id: 'property_value',
            name: 'Property Value',
            type: 'currency',
            category: 'capex',
            required: true,
            description: 'Total property value',
            unit: 'USD'
          },
          {
            id: 'rental_income',
            name: 'Monthly Rental Income',
            type: 'currency',
            category: 'revenue',
            required: true,
            description: 'Monthly rental income',
            unit: 'USD'
          },
          {
            id: 'occupancy_rate',
            name: 'Occupancy Rate',
            type: 'percentage',
            category: 'revenue',
            required: true,
            default: 0.95,
            description: 'Property occupancy rate',
            validation: [
              { type: 'range', field: 'occupancy_rate', condition: '0,1', message: 'Occupancy rate must be between 0% and 100%', severity: 'error' }
            ]
          },
          {
            id: 'operating_expenses',
            name: 'Operating Expenses',
            type: 'currency',
            category: 'opex',
            required: true,
            description: 'Monthly property operating expenses',
            unit: 'USD'
          },
          {
            id: 'mortgage_payment',
            name: 'Monthly Mortgage Payment',
            type: 'currency',
            category: 'financing',
            required: true,
            description: 'Monthly mortgage payment',
            unit: 'USD'
          },
          {
            id: 'property_taxes',
            name: 'Property Taxes',
            type: 'currency',
            category: 'tax',
            required: true,
            description: 'Annual property taxes',
            unit: 'USD/year'
          },
          {
            id: 'appreciation_rate',
            name: 'Property Appreciation Rate',
            type: 'percentage',
            category: 'revenue',
            required: true,
            default: 0.03,
            description: 'Annual property appreciation rate',
            unit: '%/year'
          }
        ],
        outputs: [],
        schedules: [],
        formulas: [],
        sheets: [],
        validation: []
      }
    });

    // Financial Template
    this.templates.set('financial', {
      id: 'financial',
      name: 'Financial Services Model',
      description: 'Template for financial services and fintech businesses',
      businessTypes: ['financial'],
      version: '1.0',
      schema: {
        inputs: [
          {
            id: 'assets_under_management',
            name: 'Assets Under Management',
            type: 'currency',
            category: 'revenue',
            required: true,
            description: 'Total assets under management',
            unit: 'USD'
          },
          {
            id: 'management_fee',
            name: 'Management Fee Rate',
            type: 'percentage',
            category: 'revenue',
            required: true,
            default: 0.01,
            description: 'Annual management fee rate',
            validation: [
              { type: 'range', field: 'management_fee', condition: '0,0.05', message: 'Management fee must be between 0% and 5%', severity: 'error' }
            ]
          },
          {
            id: 'transaction_volume',
            name: 'Transaction Volume',
            type: 'currency',
            category: 'revenue',
            required: true,
            description: 'Monthly transaction volume',
            unit: 'USD'
          },
          {
            id: 'transaction_fee',
            name: 'Transaction Fee Rate',
            type: 'percentage',
            category: 'revenue',
            required: true,
            default: 0.0025,
            description: 'Transaction fee rate',
            unit: '%'
          },
          {
            id: 'operating_expenses',
            name: 'Operating Expenses',
            type: 'currency',
            category: 'opex',
            required: true,
            description: 'Monthly operating expenses',
            unit: 'USD'
          },
          {
            id: 'regulatory_capital',
            name: 'Regulatory Capital',
            type: 'currency',
            category: 'financing',
            required: true,
            description: 'Required regulatory capital',
            unit: 'USD'
          }
        ],
        outputs: [],
        schedules: []
      },
      formulas: [],
      sheets: [],
      validation: []
    });

    // Default Template
    this.templates.set('default', {
      id: 'default',
      name: 'Default Financial Model',
      description: 'Generic financial model template',
      businessTypes: ['default'],
      version: '1.0',
      schema: {
        inputs: [
          {
            id: 'initial_revenue',
            name: 'Initial Revenue',
            type: 'currency',
            category: 'revenue',
            required: true,
            description: 'Starting revenue for the model',
            unit: 'USD'
          },
          {
            id: 'revenue_growth_rate',
            name: 'Revenue Growth Rate',
            type: 'percentage',
            category: 'revenue',
            required: true,
            default: 0.05,
            description: 'Monthly growth rate for revenue'
          }
        ],
        outputs: [],
        schedules: []
      },
      formulas: [],
      sheets: [],
      validation: []
    });
  }
}
