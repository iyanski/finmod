import { AIQuestion, BusinessModel, BusinessIntent } from '@/types';
import { BusinessClassifier } from './business-classifier';

export interface QuestionNode {
  id: string;
  question: AIQuestion;
  dependencies: string[]; // IDs of questions that must be answered first
  conditions: QuestionCondition[];
  module: 'revenue' | 'cogs' | 'opex' | 'capex' | 'working_capital' | 'financing' | 'tax';
  priority: number; // 1 = highest priority
  explainWhy: string;
}

export interface QuestionCondition {
  type: 'business_model' | 'previous_answer' | 'metric_value';
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'not_contains';
  value: any;
}

export interface QuestionGraph {
  nodes: QuestionNode[];
  edges: Array<{ from: string; to: string; condition?: QuestionCondition }>;
}

export class AdaptiveQuestionEngine {
  private static instance: AdaptiveQuestionEngine;
  private questionGraphs: Map<string, QuestionGraph> = new Map();
  
  private constructor() {
    this.initializeQuestionGraphs();
  }
  
  static getInstance(): AdaptiveQuestionEngine {
    if (!AdaptiveQuestionEngine.instance) {
      AdaptiveQuestionEngine.instance = new AdaptiveQuestionEngine();
    }
    return AdaptiveQuestionEngine.instance;
  }

  async generateNextQuestions(
    businessDescription: string,
    businessModel: BusinessModel,
    businessIntent: BusinessIntent,
    answeredQuestions: Record<string, any>,
    previousQuestions: AIQuestion[]
  ): Promise<AIQuestion[]> {
    // Mock implementation to return proper AIQuestion objects
    const mockQuestions: AIQuestion[] = [
      {
        id: 'revenue_model',
        category: 'revenue',
        question: 'What is your primary revenue model?',
        type: 'select',
        required: true,
        options: [
          'SaaS Subscription',
          'E-commerce/Retail',
          'Marketplace Commission',
          'Advertising',
          'Consulting/Services',
          'Hardware Sales',
          'Licensing',
          'Transaction Fees',
          'Freemium',
          'Usage-Based',
          'Other'
        ]
      },
      {
        id: 'monthly_revenue',
        category: 'revenue',
        question: 'What is your current monthly revenue?',
        type: 'number',
        required: true,
        validation: {
          min: 0
        }
      },
      {
        id: 'growth_rate',
        category: 'revenue',
        question: 'What is your expected monthly growth rate (%)?',
        type: 'number',
        required: true,
        validation: {
          min: 0,
          max: 100
        }
      },
      {
        id: 'customer_count',
        category: 'revenue',
        question: 'How many customers do you currently have?',
        type: 'number',
        required: true,
        validation: {
          min: 0
        }
      },
      {
        id: 'average_revenue_per_customer',
        category: 'revenue',
        question: 'What is your average revenue per customer per month?',
        type: 'number',
        required: true,
        validation: {
          min: 0
        }
      }
    ];
    
    return mockQuestions;
  }

  private getQuestionGraph(businessType: string): QuestionGraph {
    return this.questionGraphs.get(businessType) || this.questionGraphs.get('default')!;
  }

  private getAvailableQuestions(
    graph: QuestionGraph,
    businessModel: BusinessModel,
    businessIntent: BusinessIntent,
    answeredQuestions: Record<string, any>
  ): QuestionNode[] {
    return graph.nodes.filter(node => {
      // Check if all dependencies are satisfied
      const dependenciesSatisfied = node.dependencies.every(depId => 
        answeredQuestions.hasOwnProperty(depId)
      );
      
      if (!dependenciesSatisfied) return false;
      
      // Check if conditions are met
      const conditionsMet = node.conditions.every(condition => 
        this.evaluateCondition(condition, businessModel, businessIntent, answeredQuestions)
      );
      
      return conditionsMet;
    });
  }

  private evaluateCondition(
    condition: QuestionCondition,
    businessModel: BusinessModel,
    businessIntent: BusinessIntent,
    answeredQuestions: Record<string, any>
  ): boolean {
    let value: any;
    
    switch (condition.type) {
      case 'business_model':
        value = businessModel[condition.field as keyof BusinessModel];
        break;
      case 'previous_answer':
        value = answeredQuestions[condition.field];
        break;
      case 'metric_value':
        value = this.calculateMetricValue(condition.field, answeredQuestions);
        break;
      default:
        return false;
    }
    
    return this.compareValues(value, condition.operator, condition.value);
  }

  private compareValues(value: any, operator: string, expectedValue: any): boolean {
    switch (operator) {
      case 'equals':
        return value === expectedValue;
      case 'not_equals':
        return value !== expectedValue;
      case 'greater_than':
        return value > expectedValue;
      case 'less_than':
        return value < expectedValue;
      case 'contains':
        return Array.isArray(value) ? value.includes(expectedValue) : String(value).includes(expectedValue);
      case 'not_contains':
        return Array.isArray(value) ? !value.includes(expectedValue) : !String(value).includes(expectedValue);
      default:
        return false;
    }
  }

  private calculateMetricValue(metric: string, answeredQuestions: Record<string, any>): number {
    // Simple metric calculations based on answered questions
    switch (metric) {
      case 'revenue_growth_rate':
        return answeredQuestions.revenue_growth_rate || 0;
      case 'gross_margin':
        return answeredQuestions.gross_margin || 0;
      case 'customer_acquisition_cost':
        return answeredQuestions.customer_acquisition_cost || 0;
      default:
        return 0;
    }
  }

  private sortQuestionsByPriority(questions: QuestionNode[], answeredQuestions: Record<string, any>): QuestionNode[] {
    return questions.sort((a, b) => {
      // First by priority (lower number = higher priority)
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      
      // Then by module order
      const moduleOrder = ['revenue', 'cogs', 'opex', 'working_capital', 'capex', 'financing', 'tax'];
      const aModuleIndex = moduleOrder.indexOf(a.module);
      const bModuleIndex = moduleOrder.indexOf(b.module);
      
      return aModuleIndex - bModuleIndex;
    });
  }

  private initializeQuestionGraphs(): void {
    // SaaS Question Graph
    this.questionGraphs.set('saas', {
      nodes: [
        {
          id: 'revenue_model',
          question: {
            id: 'revenue_model',
            question: 'What is your primary revenue model?',
            type: 'select',
            category: 'revenue',
            required: true,
            options: ['subscription', 'usage-based', 'freemium', 'enterprise', 'marketplace']
          },
          dependencies: [],
          conditions: [],
          module: 'revenue',
          priority: 1,
          explainWhy: 'Understanding the revenue model is fundamental to building accurate revenue projections.'
        },
        {
          id: 'monthly_recurring_revenue',
          question: {
            id: 'monthly_recurring_revenue',
            question: 'What is your current Monthly Recurring Revenue (MRR)?',
            type: 'number',
            category: 'revenue',
            required: true,
            validation: { min: 0 }
          },
          dependencies: ['revenue_model'],
          conditions: [
            { type: 'previous_answer', field: 'revenue_model', operator: 'contains', value: 'subscription' }
          ],
          module: 'revenue',
          priority: 2,
          explainWhy: 'MRR is the key metric for subscription businesses to track growth and predict future revenue.'
        },
        {
          id: 'customer_acquisition_cost',
          question: {
            id: 'customer_acquisition_cost',
            question: 'What is your Customer Acquisition Cost (CAC)?',
            type: 'number',
            category: 'revenue',
            required: true,
            validation: { min: 0 }
          },
          dependencies: ['revenue_model'],
          conditions: [],
          module: 'revenue',
          priority: 3,
          explainWhy: 'CAC helps determine the profitability of customer acquisition and marketing efficiency.'
        },
        {
          id: 'churn_rate',
          question: {
            id: 'churn_rate',
            question: 'What is your monthly customer churn rate (%)?',
            type: 'number',
            category: 'revenue',
            required: true,
            validation: { min: 0, max: 100 }
          },
          dependencies: ['revenue_model'],
          conditions: [
            { type: 'previous_answer', field: 'revenue_model', operator: 'contains', value: 'subscription' }
          ],
          module: 'revenue',
          priority: 4,
          explainWhy: 'Churn rate directly impacts revenue growth and customer lifetime value calculations.'
        },
        {
          id: 'gross_margin',
          question: {
            id: 'gross_margin',
            question: 'What is your gross margin percentage?',
            type: 'number',
            category: 'cogs',
            required: true,
            validation: { min: 0, max: 100 }
          },
          dependencies: ['revenue_model'],
          conditions: [],
          module: 'cogs',
          priority: 5,
          explainWhy: 'Gross margin determines the profitability after direct costs and affects overall business viability.'
        },
        {
          id: 'sales_marketing_budget',
          question: {
            id: 'sales_marketing_budget',
            question: 'What percentage of revenue do you allocate to sales and marketing?',
            type: 'number',
            category: 'opex',
            required: true,
            validation: { min: 0, max: 100 }
          },
          dependencies: ['gross_margin'],
          conditions: [],
          module: 'opex',
          priority: 6,
          explainWhy: 'Sales and marketing spend is crucial for growth and affects the path to profitability.'
        },
        {
          id: 'research_development_budget',
          question: {
            id: 'research_development_budget',
            question: 'What percentage of revenue do you allocate to research and development?',
            type: 'number',
            category: 'opex',
            required: true,
            validation: { min: 0, max: 100 }
          },
          dependencies: ['sales_marketing_budget'],
          conditions: [],
          module: 'opex',
          priority: 7,
          explainWhy: 'R&D investment drives product innovation and competitive advantage.'
        },
        {
          id: 'working_capital_days',
          question: {
            id: 'working_capital_days',
            question: 'How many days of working capital do you typically need?',
            type: 'number',
            category: 'working_capital',
            required: true,
            validation: { min: 0 }
          },
          dependencies: ['gross_margin'],
          conditions: [],
          module: 'working_capital',
          priority: 8,
          explainWhy: 'Working capital requirements affect cash flow and funding needs.'
        },
        {
          id: 'capital_expenditure',
          question: {
            id: 'capital_expenditure',
            question: 'What is your annual capital expenditure as a percentage of revenue?',
            type: 'number',
            category: 'capex',
            required: true,
            validation: { min: 0, max: 100 }
          },
          dependencies: ['working_capital_days'],
          conditions: [],
          module: 'capex',
          priority: 9,
          explainWhy: 'Capital expenditure affects asset growth and depreciation schedules.'
        },
        {
          id: 'debt_financing',
          question: {
            id: 'debt_financing',
            question: 'Do you have or plan to have debt financing?',
            type: 'select',
            category: 'financing',
            required: true,
            options: ['yes', 'no', 'maybe']
          },
          dependencies: ['capital_expenditure'],
          conditions: [],
          module: 'financing',
          priority: 10,
          explainWhy: 'Debt financing affects capital structure and interest expense calculations.'
        },
        {
          id: 'tax_rate',
          question: {
            id: 'tax_rate',
            question: 'What is your effective tax rate (%)?',
            type: 'number',
            category: 'tax',
            required: true,
            validation: { min: 0, max: 100 }
          },
          dependencies: ['debt_financing'],
          conditions: [],
          module: 'tax',
          priority: 11,
          explainWhy: 'Tax rate affects net income and cash flow projections.'
        }
      ],
      edges: [
        { from: 'revenue_model', to: 'monthly_recurring_revenue' },
        { from: 'revenue_model', to: 'customer_acquisition_cost' },
        { from: 'revenue_model', to: 'churn_rate' },
        { from: 'monthly_recurring_revenue', to: 'gross_margin' },
        { from: 'gross_margin', to: 'sales_marketing_budget' },
        { from: 'sales_marketing_budget', to: 'research_development_budget' },
        { from: 'research_development_budget', to: 'working_capital_days' },
        { from: 'working_capital_days', to: 'capital_expenditure' },
        { from: 'capital_expenditure', to: 'debt_financing' },
        { from: 'debt_financing', to: 'tax_rate' }
      ]
    });

    // E-commerce Question Graph
    this.questionGraphs.set('ecommerce', {
      nodes: [
        {
          id: 'revenue_model',
          question: {
            id: 'revenue_model',
            question: 'What is your primary revenue model?',
            type: 'select',
            category: 'revenue',
            required: true,
            options: ['direct_sales', 'marketplace', 'subscription', 'dropshipping', 'wholesale']
          },
          dependencies: [],
          conditions: [],
          module: 'revenue',
          priority: 1,
          explainWhy: 'Revenue model determines pricing strategy and cost structure.'
        },
        {
          id: 'average_order_value',
          question: {
            id: 'average_order_value',
            question: 'What is your average order value?',
            type: 'number',
            category: 'revenue',
            required: true,
            validation: { min: 0 }
          },
          dependencies: ['revenue_model'],
          conditions: [],
          module: 'revenue',
          priority: 2,
          explainWhy: 'AOV is key for revenue projections and customer value analysis.'
        },
        {
          id: 'conversion_rate',
          question: {
            id: 'conversion_rate',
            question: 'What is your website conversion rate (%)?',
            type: 'number',
            category: 'revenue',
            required: true,
            validation: { min: 0, max: 100 }
          },
          dependencies: ['average_order_value'],
          conditions: [],
          module: 'revenue',
          priority: 3,
          explainWhy: 'Conversion rate affects traffic requirements and marketing efficiency.'
        },
        {
          id: 'cost_of_goods_sold',
          question: {
            id: 'cost_of_goods_sold',
            question: 'What percentage of revenue is your cost of goods sold?',
            type: 'number',
            category: 'cogs',
            required: true,
            validation: { min: 0, max: 100 }
          },
          dependencies: ['conversion_rate'],
          conditions: [],
          module: 'cogs',
          priority: 4,
          explainWhy: 'COGS directly impacts gross margin and profitability.'
        },
        {
          id: 'fulfillment_costs',
          question: {
            id: 'fulfillment_costs',
            question: 'What percentage of revenue do you spend on fulfillment and shipping?',
            type: 'number',
            category: 'cogs',
            required: true,
            validation: { min: 0, max: 100 }
          },
          dependencies: ['cost_of_goods_sold'],
          conditions: [],
          module: 'cogs',
          priority: 5,
          explainWhy: 'Fulfillment costs are critical for e-commerce profitability.'
        },
        {
          id: 'marketing_budget',
          question: {
            id: 'marketing_budget',
            question: 'What percentage of revenue do you allocate to marketing?',
            type: 'number',
            category: 'opex',
            required: true,
            validation: { min: 0, max: 100 }
          },
          dependencies: ['fulfillment_costs'],
          conditions: [],
          module: 'opex',
          priority: 6,
          explainWhy: 'Marketing spend drives customer acquisition and revenue growth.'
        },
        {
          id: 'inventory_turnover',
          question: {
            id: 'inventory_turnover',
            question: 'How many times per year do you turn over your inventory?',
            type: 'number',
            category: 'working_capital',
            required: true,
            validation: { min: 0 }
          },
          dependencies: ['marketing_budget'],
          conditions: [],
          module: 'working_capital',
          priority: 7,
          explainWhy: 'Inventory turnover affects working capital requirements and cash flow.'
        },
        {
          id: 'warehouse_costs',
          question: {
            id: 'warehouse_costs',
            question: 'What percentage of revenue do you spend on warehouse and storage?',
            type: 'number',
            category: 'capex',
            required: true,
            validation: { min: 0, max: 100 }
          },
          dependencies: ['inventory_turnover'],
          conditions: [],
          module: 'capex',
          priority: 8,
          explainWhy: 'Warehouse costs affect operational efficiency and capital requirements.'
        },
        {
          id: 'payment_processing',
          question: {
            id: 'payment_processing',
            question: 'What percentage do you pay for payment processing fees?',
            type: 'number',
            category: 'opex',
            required: true,
            validation: { min: 0, max: 10 }
          },
          dependencies: ['warehouse_costs'],
          conditions: [],
          module: 'opex',
          priority: 9,
          explainWhy: 'Payment processing fees directly impact net revenue.'
        },
        {
          id: 'tax_rate',
          question: {
            id: 'tax_rate',
            question: 'What is your effective tax rate (%)?',
            type: 'number',
            category: 'tax',
            required: true,
            validation: { min: 0, max: 100 }
          },
          dependencies: ['payment_processing'],
          conditions: [],
          module: 'tax',
          priority: 10,
          explainWhy: 'Tax rate affects net income and cash flow projections.'
        }
      ],
      edges: [
        { from: 'revenue_model', to: 'average_order_value' },
        { from: 'average_order_value', to: 'conversion_rate' },
        { from: 'conversion_rate', to: 'cost_of_goods_sold' },
        { from: 'cost_of_goods_sold', to: 'fulfillment_costs' },
        { from: 'fulfillment_costs', to: 'marketing_budget' },
        { from: 'marketing_budget', to: 'inventory_turnover' },
        { from: 'inventory_turnover', to: 'warehouse_costs' },
        { from: 'warehouse_costs', to: 'payment_processing' },
        { from: 'payment_processing', to: 'tax_rate' }
      ]
    });

    // Default Question Graph (for other business types)
    this.questionGraphs.set('default', {
      nodes: [
        {
          id: 'revenue_model',
          question: {
            id: 'revenue_model',
            question: 'What is your primary revenue model?',
            type: 'text',
            category: 'revenue',
            required: true
          },
          dependencies: [],
          conditions: [],
          module: 'revenue',
          priority: 1,
          explainWhy: 'Understanding the revenue model is fundamental to building accurate projections.'
        },
        {
          id: 'annual_revenue',
          question: {
            id: 'annual_revenue',
            question: 'What is your current annual revenue?',
            type: 'number',
            category: 'revenue',
            required: true,
            validation: { min: 0 }
          },
          dependencies: ['revenue_model'],
          conditions: [],
          module: 'revenue',
          priority: 2,
          explainWhy: 'Current revenue provides the baseline for growth projections.'
        },
        {
          id: 'gross_margin',
          question: {
            id: 'gross_margin',
            question: 'What is your gross margin percentage?',
            type: 'number',
            category: 'cogs',
            required: true,
            validation: { min: 0, max: 100 }
          },
          dependencies: ['annual_revenue'],
          conditions: [],
          module: 'cogs',
          priority: 3,
          explainWhy: 'Gross margin determines profitability after direct costs.'
        },
        {
          id: 'operating_expenses',
          question: {
            id: 'operating_expenses',
            question: 'What percentage of revenue are your operating expenses?',
            type: 'number',
            category: 'opex',
            required: true,
            validation: { min: 0, max: 100 }
          },
          dependencies: ['gross_margin'],
          conditions: [],
          module: 'opex',
          priority: 4,
          explainWhy: 'Operating expenses affect net profit and cash flow.'
        },
        {
          id: 'tax_rate',
          question: {
            id: 'tax_rate',
            question: 'What is your effective tax rate (%)?',
            type: 'number',
            category: 'tax',
            required: true,
            validation: { min: 0, max: 100 }
          },
          dependencies: ['operating_expenses'],
          conditions: [],
          module: 'tax',
          priority: 5,
          explainWhy: 'Tax rate affects net income and cash flow projections.'
        }
      ],
      edges: [
        { from: 'revenue_model', to: 'annual_revenue' },
        { from: 'annual_revenue', to: 'gross_margin' },
        { from: 'gross_margin', to: 'operating_expenses' },
        { from: 'operating_expenses', to: 'tax_rate' }
      ]
    });
  }
}
