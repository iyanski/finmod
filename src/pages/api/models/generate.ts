import { NextApiRequest, NextApiResponse } from 'next';
import { TemplateEngine } from '@/lib/template-engine';
import { FinancialModelingEngine } from '@/lib/financial-modeling-engine';
import { ApiResponse, FinancialModel } from '@/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<FinancialModel>>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    const { businessType, inputs } = req.body;

    if (!businessType || !inputs) {
      return res.status(400).json({
        success: false,
        error: 'Business type and inputs are required'
      });
    }

    const templateEngine = TemplateEngine.getInstance();
    const template = templateEngine.getTemplate(businessType);
    
    const financialModel = templateEngine.applyTemplate(template, inputs);

    return res.status(200).json({
      success: true,
      data: financialModel
    });
  } catch (error) {
    console.error('Error generating financial model:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate financial model'
    });
  }
}
