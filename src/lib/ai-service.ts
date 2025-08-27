import OpenAI from 'openai';
import { AIQuestion, BusinessDescription } from '@/types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class AIService {
  private static instance: AIService;
  
  private constructor() {}
  
  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  async analyzeBusinessDescription(description: string): Promise<{
    industry: string;
    businessModel: string;
    questions: AIQuestion[];
  }> {
    const prompt = `
You are a financial modeling expert. Analyze the following business description and:

1. Identify the industry and business model
2. Generate relevant follow-up questions to gather financial inputs

Business Description: "${description}"

Please respond with a JSON object in this exact format:
{
  "industry": "string",
  "businessModel": "string", 
  "questions": [
    {
      "id": "unique_id",
      "question": "Question text",
      "type": "text|number|select|multi-select",
      "category": "revenue|costs|working_capital|capex|debt|other",
      "required": true/false,
      "options": ["option1", "option2"] // only for select/multi-select types
    }
  ]
}

Focus on questions that will help build a comprehensive 3-statement financial model. Include questions about:
- Revenue model and growth assumptions
- Cost structure and margins
- Working capital requirements
- Capital expenditure needs
- Debt and financing structure
- Tax and discount rates
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

      const result = JSON.parse(response);
      
      return {
        industry: result.industry,
        businessModel: result.businessModel,
        questions: result.questions.map((q: any) => ({
          ...q,
          id: q.id || `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }))
      };
    } catch (error) {
      console.error('Error analyzing business description:', error);
      throw new Error('Failed to analyze business description');
    }
  }

  async generateFollowUpQuestions(
    businessDescription: string,
    currentAnswers: Record<string, any>,
    previousQuestions: AIQuestion[]
  ): Promise<AIQuestion[]> {
    const prompt = `
You are a financial modeling expert conducting an interview. Based on the business description and previous answers, generate the next set of relevant follow-up questions.

Business Description: "${businessDescription}"

Previous Questions Asked: ${previousQuestions.map(q => q.question).join(', ')}

Current Answers: ${JSON.stringify(currentAnswers, null, 2)}

Generate 3-5 follow-up questions that will help complete the financial model. Focus on:
1. Missing critical information
2. Clarifying assumptions
3. Industry-specific considerations

Respond with a JSON array of questions in this format:
[
  {
    "id": "unique_id",
    "question": "Question text",
    "type": "text|number|select|multi-select",
    "category": "revenue|costs|working_capital|capex|debt|other",
    "required": true/false,
    "options": ["option1", "option2"] // only for select/multi-select types
  }
]
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

      const questions = JSON.parse(response);
      
      return questions.map((q: any) => ({
        ...q,
        id: q.id || `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }));
    } catch (error) {
      console.error('Error generating follow-up questions:', error);
      throw new Error('Failed to generate follow-up questions');
    }
  }

  async validateFinancialInputs(inputs: any): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const prompt = `
You are a financial modeling expert. Validate the following financial inputs for reasonableness and completeness.

Financial Inputs: ${JSON.stringify(inputs, null, 2)}

Check for:
1. Missing required fields
2. Unrealistic values
3. Inconsistent assumptions
4. Industry-specific issues

Respond with a JSON object:
{
  "isValid": true/false,
  "errors": ["error1", "error2"],
  "warnings": ["warning1", "warning2"]
}
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

      return JSON.parse(response);
    } catch (error) {
      console.error('Error validating financial inputs:', error);
      return {
        isValid: false,
        errors: ['Failed to validate inputs'],
        warnings: []
      };
    }
  }
}
