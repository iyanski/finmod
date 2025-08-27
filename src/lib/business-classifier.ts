import OpenAI from 'openai';
import { BusinessModel, BusinessIntent, Currency, TimeGranularity, GeographicScope } from '@/types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface BusinessClassification {
  models: BusinessModel[];
  intents: BusinessIntent;
  drivers: string[];
  confidence: number;
}

export interface BusinessModel {
  type: 'saas' | 'ecommerce' | 'marketplace' | 'services' | 'hardware' | 'manufacturing' | 'real_estate' | 'financial';
  subtype?: string;
  confidence: number;
  characteristics: string[];
}

export interface BusinessIntent {
  currency: Currency;
  startDate: string;
  timeGranularity: TimeGranularity;
  units: string;
  taxRegime: string;
  geographicScope: GeographicScope;
  planningHorizon: number; // in months
  keyDrivers: string[];
}

export type Currency = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'JPY' | 'CNY';
export type TimeGranularity = 'monthly' | 'quarterly' | 'annually';
export type GeographicScope = 'local' | 'regional' | 'national' | 'international' | 'global';

export class BusinessClassifier {
  private static instance: BusinessClassifier;
  
  private constructor() {}
  
  static getInstance(): BusinessClassifier {
    if (!BusinessClassifier.instance) {
      BusinessClassifier.instance = new BusinessClassifier();
    }
    return BusinessClassifier.instance;
  }

  async classifyBusiness(description: string): Promise<BusinessClassification> {
    const prompt = `
You are a financial modeling expert specializing in business model classification. Analyze the following business description and extract structured information.

Business Description: "${description}"

Please respond with a JSON object in this exact format:
{
  "models": [
    {
      "type": "saas|ecommerce|marketplace|services|hardware|manufacturing|real_estate|financial",
      "subtype": "optional specific subtype",
      "confidence": 0.95,
      "characteristics": ["characteristic1", "characteristic2"]
    }
  ],
  "intents": {
    "currency": "USD|EUR|GBP|CAD|AUD|JPY|CNY",
    "startDate": "YYYY-MM-DD",
    "timeGranularity": "monthly|quarterly|annually",
    "units": "description of units (e.g., 'users', 'transactions', 'units sold')",
    "taxRegime": "description of tax considerations",
    "geographicScope": "local|regional|national|international|global",
    "planningHorizon": 60,
    "keyDrivers": ["driver1", "driver2", "driver3"]
  },
  "drivers": ["revenue_growth", "customer_acquisition_cost", "churn_rate"],
  "confidence": 0.9
}

Focus on:
1. Identifying primary and secondary business models
2. Extracting key financial drivers
3. Determining appropriate time granularity and planning horizon
4. Identifying geographic and currency considerations
5. Understanding tax implications
`;

    try {
      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a financial modeling expert. Always respond with valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from OpenAI');
      }

      const result = JSON.parse(response);
      
      return {
        models: result.models,
        intents: result.intents,
        drivers: result.drivers,
        confidence: result.confidence
      };
    } catch (error) {
      console.error('Error classifying business:', error);
      throw new Error('Failed to classify business model');
    }
  }

  async extractKeyMetrics(description: string, businessModel: BusinessModel): Promise<string[]> {
    const prompt = `
Based on the business description and model type, identify the key financial metrics that should be tracked.

Business Description: "${description}"
Business Model: ${businessModel.type}${businessModel.subtype ? ` (${businessModel.subtype})` : ''}

For this business model, what are the most important financial drivers and metrics? Consider:
- Revenue drivers
- Cost drivers
- Growth metrics
- Efficiency metrics
- Risk factors

Respond with a JSON array of metric names:
["metric1", "metric2", "metric3"]
`;

    try {
      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a financial modeling expert. Always respond with valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from OpenAI');
      }

      return JSON.parse(response);
    } catch (error) {
      console.error('Error extracting key metrics:', error);
      return this.getDefaultMetrics(businessModel.type);
    }
  }

  private getDefaultMetrics(businessType: string): string[] {
    const defaultMetrics: Record<string, string[]> = {
      saas: ['monthly_recurring_revenue', 'customer_acquisition_cost', 'churn_rate', 'lifetime_value'],
      ecommerce: ['average_order_value', 'conversion_rate', 'customer_acquisition_cost', 'repeat_purchase_rate'],
      marketplace: ['take_rate', 'gross_merchandise_value', 'active_users', 'transaction_volume'],
      services: ['billable_hours', 'utilization_rate', 'project_margins', 'client_retention'],
      hardware: ['unit_cost', 'manufacturing_efficiency', 'inventory_turnover', 'warranty_costs'],
      manufacturing: ['production_capacity', 'raw_material_costs', 'labor_efficiency', 'quality_metrics'],
      real_estate: ['occupancy_rate', 'rental_yield', 'maintenance_costs', 'property_appreciation'],
      financial: ['interest_margin', 'credit_quality', 'operational_efficiency', 'regulatory_capital']
    };

    return defaultMetrics[businessType] || ['revenue_growth', 'profit_margin', 'operational_efficiency'];
  }
}
