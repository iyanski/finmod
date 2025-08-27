import { NextApiRequest, NextApiResponse } from 'next';
import { BusinessClassifier } from '@/lib/business-classifier';
import { ApiResponse } from '@/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    const { description } = req.body;

    if (!description || typeof description !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Business description is required'
      });
    }

    const classifier = BusinessClassifier.getInstance();
    const classification = await classifier.classifyBusiness(description);

    return res.status(200).json({
      success: true,
      data: classification
    });
  } catch (error) {
    console.error('Error classifying business:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to classify business'
    });
  }
}
