import { NextApiRequest, NextApiResponse } from 'next';
import { AdaptiveQuestionEngine } from '@/lib/adaptive-question-engine';
import { BusinessClassifier } from '@/lib/business-classifier';
import { ApiResponse, AIQuestion } from '@/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<AIQuestion[]>>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    const { 
      businessDescription, 
      businessModel, 
      businessIntent, 
      answeredQuestions, 
      previousQuestions 
    } = req.body;

    if (!businessDescription || !businessModel) {
      return res.status(400).json({
        success: false,
        error: 'Business description and model are required'
      });
    }

    const questionEngine = AdaptiveQuestionEngine.getInstance();
    const nextQuestions = await questionEngine.generateNextQuestions(
      businessDescription,
      businessModel,
      businessIntent || {},
      answeredQuestions || {},
      previousQuestions || []
    );

    return res.status(200).json({
      success: true,
      data: nextQuestions
    });
  } catch (error) {
    console.error('Error generating questions:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate questions'
    });
  }
}
