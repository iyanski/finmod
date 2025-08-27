import { useState } from 'react';
import Head from 'next/head';

interface BusinessModel {
  type: string;
  subtype: string;
  confidence: number;
  characteristics: string[];
}

interface BusinessIntent {
  currency: string;
  startDate: string;
  timeGranularity: string;
  units: string;
  taxRegime: string;
  geographicScope: string;
  planningHorizon: number;
  keyDrivers: string[];
}

interface AIQuestion {
  id: string;
  category: string;
  question: string;
  type: string;
  unit?: string;
  horizon?: string;
  defaultValue?: any;
  validation?: any;
  explanation?: string;
}

interface FinancialModel {
  incomeStatement: any;
  balanceSheet: any;
  cashFlowStatement: any;
  schedules: any;
  scenarios: any;
  audit: any;
}

type Step = 'description' | 'classification' | 'questions' | 'model' | 'export';

export default function Home() {
  const [currentStep, setCurrentStep] = useState<Step>('description');
  const [businessDescription, setBusinessDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [classificationResult, setClassificationResult] = useState<any>(null);
  const [questions, setQuestions] = useState<AIQuestion[]>([]);
  const [answeredQuestions, setAnsweredQuestions] = useState<Record<string, any>>({});
  const [financialModel, setFinancialModel] = useState<FinancialModel | null>(null);
  const [exportLoading, setExportLoading] = useState(false);

  const handleBusinessDescriptionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/business/classify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description: businessDescription }),
      });

      const data = await response.json();
      if (data.success) {
        setClassificationResult(data.data);
        
        // Generate follow-up questions
        const questionsResponse = await fetch('/api/questions/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            businessDescription,
            businessModel: data.data.models[0],
            businessIntent: data.data.intents,
            answeredQuestions: {},
            previousQuestions: []
          }),
        });

        const questionsData = await questionsResponse.json();
        if (questionsData.success) {
          setQuestions(questionsData.data);
        }
        
        setCurrentStep('classification');
      } else {
        alert('Failed to classify business: ' + data.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to analyze business');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuestionAnswer = (questionId: string, value: any) => {
    setAnsweredQuestions(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleGenerateModel = async () => {
    setIsLoading(true);
    try {
      // Map frontend field names to backend expected field names based on business type
      const businessType = classificationResult.models[0].type;
      let mappedInputs: any = {
        ...answeredQuestions,
        businessDescription,
        businessModel: classificationResult.models[0],
        businessIntent: classificationResult.intents
      };

      // Add business-type specific mappings
      if (businessType === 'saas') {
        mappedInputs = {
          ...mappedInputs,
          initial_mrr: answeredQuestions.monthly_revenue || 0,
          revenue_growth_rate: (answeredQuestions.growth_rate || 0) / 100,
          total_customers: answeredQuestions.customer_count || 0,
          arpu: answeredQuestions.average_revenue_per_customer || 0,
          churn_rate: 0.05,
          initial_assets: 10000,
          depreciation_rate: 0.1,
          initial_debt: 0,
          interest_rate: 0.05
        };
      } else if (businessType === 'ecommerce') {
        mappedInputs = {
          ...mappedInputs,
          starting_customers: answeredQuestions.customer_count || 200,
          new_customers_per_month: 40,
          churn_rate: 0.05,
          price_per_customer: answeredQuestions.average_revenue_per_customer || 30,
          cogs_per_customer: 12,
          opex_per_month: 5000,
          initial_cash: 100000,
          initial_assets: 10000,
          depreciation_rate: 0.1,
          initial_debt: 0,
          interest_rate: 0.05
        };
      } else if (businessType === 'services') {
        mappedInputs = {
          ...mappedInputs,
          billable_hours: answeredQuestions.billable_hours || 160,
          hourly_rate: answeredQuestions.hourly_rate || 100,
          utilization_rate: 0.75,
          team_size: answeredQuestions.team_size || 5,
          average_salary: answeredQuestions.average_salary || 80000,
          other_expenses: 5000,
          initial_assets: 10000,
          depreciation_rate: 0.1,
          initial_debt: 0,
          interest_rate: 0.05
        };
      } else if (businessType === 'marketplace') {
        mappedInputs = {
          ...mappedInputs,
          gmv: answeredQuestions.gmv || 100000,
          take_rate: 0.15,
          transaction_volume: answeredQuestions.transaction_volume || 1000,
          average_order_value: answeredQuestions.average_order_value || 100,
          customer_acquisition_cost: answeredQuestions.customer_acquisition_cost || 50,
          operating_expenses: 10000,
          initial_assets: 10000,
          depreciation_rate: 0.1,
          initial_debt: 0,
          interest_rate: 0.05
        };
      } else if (businessType === 'hardware') {
        mappedInputs = {
          ...mappedInputs,
          units_sold: answeredQuestions.units_sold || 100,
          unit_price: answeredQuestions.unit_price || 500,
          unit_cost: answeredQuestions.unit_cost || 200,
          inventory_turnover: 4,
          manufacturing_capacity: answeredQuestions.manufacturing_capacity || 200,
          fixed_costs: answeredQuestions.fixed_costs || 10000,
          initial_assets: 10000,
          depreciation_rate: 0.1,
          initial_debt: 0,
          interest_rate: 0.05
        };
      } else if (businessType === 'manufacturing') {
        mappedInputs = {
          ...mappedInputs,
          production_capacity: answeredQuestions.production_capacity || 1000,
          capacity_utilization: 0.8,
          unit_price: answeredQuestions.unit_price || 100,
          variable_cost_per_unit: answeredQuestions.variable_cost_per_unit || 60,
          fixed_manufacturing_costs: answeredQuestions.fixed_manufacturing_costs || 20000,
          equipment_depreciation: 5000,
          initial_assets: 10000,
          depreciation_rate: 0.1,
          initial_debt: 0,
          interest_rate: 0.05
        };
      } else if (businessType === 'real_estate') {
        mappedInputs = {
          ...mappedInputs,
          property_value: answeredQuestions.property_value || 1000000,
          rental_income: answeredQuestions.rental_income || 8000,
          occupancy_rate: 0.95,
          operating_expenses: answeredQuestions.operating_expenses || 3000,
          mortgage_payment: answeredQuestions.mortgage_payment || 4000,
          property_taxes: answeredQuestions.property_taxes || 12000,
          appreciation_rate: 0.03,
          initial_assets: 10000,
          depreciation_rate: 0.1,
          initial_debt: 0,
          interest_rate: 0.05
        };
      } else if (businessType === 'financial') {
        mappedInputs = {
          ...mappedInputs,
          assets_under_management: answeredQuestions.assets_under_management || 10000000,
          management_fee: 0.01,
          transaction_volume: answeredQuestions.transaction_volume || 1000000,
          transaction_fee: 0.0025,
          operating_expenses: answeredQuestions.operating_expenses || 50000,
          regulatory_capital: answeredQuestions.regulatory_capital || 1000000,
          initial_assets: 10000,
          depreciation_rate: 0.1,
          initial_debt: 0,
          interest_rate: 0.05
        };
      } else {
        // Default template
        mappedInputs = {
          ...mappedInputs,
          initial_revenue: answeredQuestions.monthly_revenue || 10000,
          revenue_growth_rate: (answeredQuestions.growth_rate || 5) / 100,
          initial_assets: 10000,
          depreciation_rate: 0.1,
          initial_debt: 0,
          interest_rate: 0.05
        };
      }

      const response = await fetch('/api/models/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessType: classificationResult.models[0].type,
          inputs: mappedInputs
        }),
      });

      const data = await response.json();
      if (data.success) {
        setFinancialModel(data.data);
        setCurrentStep('model');
      } else {
        alert('Failed to generate model: ' + data.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to generate financial model');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async (format: 'excel' | 'csv') => {
    setExportLoading(true);
    try {
      // Use the same business-type specific mapping as in handleGenerateModel
      const businessType = classificationResult.models[0].type;
      let mappedInputs: any = {
        ...answeredQuestions,
        businessDescription,
        businessModel: classificationResult.models[0],
        businessIntent: classificationResult.intents
      };

      // Add business-type specific mappings (same logic as handleGenerateModel)
      if (businessType === 'saas') {
        mappedInputs = {
          ...mappedInputs,
          initial_mrr: answeredQuestions.monthly_revenue || 0,
          revenue_growth_rate: (answeredQuestions.growth_rate || 0) / 100,
          total_customers: answeredQuestions.customer_count || 0,
          arpu: answeredQuestions.average_revenue_per_customer || 0,
          churn_rate: 0.05,
          initial_assets: 10000,
          depreciation_rate: 0.1,
          initial_debt: 0,
          interest_rate: 0.05
        };
      } else if (businessType === 'ecommerce') {
        mappedInputs = {
          ...mappedInputs,
          starting_customers: answeredQuestions.customer_count || 200,
          new_customers_per_month: 40,
          churn_rate: 0.05,
          price_per_customer: answeredQuestions.average_revenue_per_customer || 30,
          cogs_per_customer: 12,
          opex_per_month: 5000,
          initial_cash: 100000,
          initial_assets: 10000,
          depreciation_rate: 0.1,
          initial_debt: 0,
          interest_rate: 0.05
        };
      } else if (businessType === 'services') {
        mappedInputs = {
          ...mappedInputs,
          billable_hours: answeredQuestions.billable_hours || 160,
          hourly_rate: answeredQuestions.hourly_rate || 100,
          utilization_rate: 0.75,
          team_size: answeredQuestions.team_size || 5,
          average_salary: answeredQuestions.average_salary || 80000,
          other_expenses: 5000,
          initial_assets: 10000,
          depreciation_rate: 0.1,
          initial_debt: 0,
          interest_rate: 0.05
        };
      } else if (businessType === 'marketplace') {
        mappedInputs = {
          ...mappedInputs,
          gmv: answeredQuestions.gmv || 100000,
          take_rate: 0.15,
          transaction_volume: answeredQuestions.transaction_volume || 1000,
          average_order_value: answeredQuestions.average_order_value || 100,
          customer_acquisition_cost: answeredQuestions.customer_acquisition_cost || 50,
          operating_expenses: 10000,
          initial_assets: 10000,
          depreciation_rate: 0.1,
          initial_debt: 0,
          interest_rate: 0.05
        };
      } else if (businessType === 'hardware') {
        mappedInputs = {
          ...mappedInputs,
          units_sold: answeredQuestions.units_sold || 100,
          unit_price: answeredQuestions.unit_price || 500,
          unit_cost: answeredQuestions.unit_cost || 200,
          inventory_turnover: 4,
          manufacturing_capacity: answeredQuestions.manufacturing_capacity || 200,
          fixed_costs: answeredQuestions.fixed_costs || 10000,
          initial_assets: 10000,
          depreciation_rate: 0.1,
          initial_debt: 0,
          interest_rate: 0.05
        };
      } else if (businessType === 'manufacturing') {
        mappedInputs = {
          ...mappedInputs,
          production_capacity: answeredQuestions.production_capacity || 1000,
          capacity_utilization: 0.8,
          unit_price: answeredQuestions.unit_price || 100,
          variable_cost_per_unit: answeredQuestions.variable_cost_per_unit || 60,
          fixed_manufacturing_costs: answeredQuestions.fixed_manufacturing_costs || 20000,
          equipment_depreciation: 5000,
          initial_assets: 10000,
          depreciation_rate: 0.1,
          initial_debt: 0,
          interest_rate: 0.05
        };
      } else if (businessType === 'real_estate') {
        mappedInputs = {
          ...mappedInputs,
          property_value: answeredQuestions.property_value || 1000000,
          rental_income: answeredQuestions.rental_income || 8000,
          occupancy_rate: 0.95,
          operating_expenses: answeredQuestions.operating_expenses || 3000,
          mortgage_payment: answeredQuestions.mortgage_payment || 4000,
          property_taxes: answeredQuestions.property_taxes || 12000,
          appreciation_rate: 0.03,
          initial_assets: 10000,
          depreciation_rate: 0.1,
          initial_debt: 0,
          interest_rate: 0.05
        };
      } else if (businessType === 'financial') {
        mappedInputs = {
          ...mappedInputs,
          assets_under_management: answeredQuestions.assets_under_management || 10000000,
          management_fee: 0.01,
          transaction_volume: answeredQuestions.transaction_volume || 1000000,
          transaction_fee: 0.0025,
          operating_expenses: answeredQuestions.operating_expenses || 50000,
          regulatory_capital: answeredQuestions.regulatory_capital || 1000000,
          initial_assets: 10000,
          depreciation_rate: 0.1,
          initial_debt: 0,
          interest_rate: 0.05
        };
      } else {
        // Default template
        mappedInputs = {
          ...mappedInputs,
          initial_revenue: answeredQuestions.monthly_revenue || 10000,
          revenue_growth_rate: (answeredQuestions.growth_rate || 5) / 100,
          initial_assets: 10000,
          depreciation_rate: 0.1,
          initial_debt: 0,
          interest_rate: 0.05
        };
      }

      const response = await fetch(`/api/export/${format}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessType: classificationResult.models[0].type,
          inputs: mappedInputs
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `financial-model.${format === 'excel' ? 'xlsx' : 'zip'}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert(`Failed to export ${format.toUpperCase()}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert(`Failed to export ${format.toUpperCase()}`);
    } finally {
      setExportLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex justify-center mb-8">
      <div className="flex space-x-4">
        {(['description', 'classification', 'questions', 'model', 'export'] as Step[]).map((step, index) => (
          <div key={step} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep === step 
                ? 'bg-blue-600 text-white' 
                : index < ['description', 'classification', 'questions', 'model', 'export'].indexOf(currentStep)
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 text-gray-600'
            }`}>
              {index + 1}
            </div>
            {index < 4 && (
              <div className={`w-12 h-1 mx-2 ${
                index < ['description', 'classification', 'questions', 'model', 'export'].indexOf(currentStep)
                  ? 'bg-green-500'
                  : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderBusinessDescriptionStep = () => (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-semibold mb-6">Step 1: Describe Your Business</h2>
      <p className="text-gray-600 mb-6">
        Describe your business in plain English. Include details about your business model, 
        revenue streams, pricing, sales cycle, and key characteristics.
      </p>
      
      <form onSubmit={handleBusinessDescriptionSubmit} className="space-y-6">
        <div>
          <label htmlFor="businessDescription" className="block text-sm font-medium text-gray-700 mb-2">
            Business Description
          </label>
          <textarea
            id="businessDescription"
            value={businessDescription}
            onChange={(e) => setBusinessDescription(e.target.value)}
            placeholder="e.g., B2B SaaS company, £49/seat/month, 2-month sales cycle, targeting mid-market companies in the UK..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={6}
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !businessDescription.trim()}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Analyzing...' : 'Analyze Business & Generate Questions'}
        </button>
      </form>
    </div>
  );

  const renderClassificationStep = () => (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-semibold mb-6">Step 2: Business Classification</h2>
      
      <div className="space-y-6">
        <div>
          <h4 className="font-medium text-gray-900 mb-2">AI Classification Results</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {classificationResult.models.map((model: BusinessModel, index: number) => (
              <div key={index} className="bg-gray-50 p-4 rounded-md">
                <p className="font-medium text-lg">{model.type}</p>
                <p className="text-sm text-gray-600">Confidence: {(model.confidence * 100).toFixed(1)}%</p>
                {model.subtype && (
                  <p className="text-sm text-gray-600">Subtype: {model.subtype}</p>
                )}
                {model.characteristics.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-gray-700">Characteristics:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {model.characteristics.map((char, idx) => (
                        <span key={idx} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                          {char}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-2">Business Intent</h4>
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="grid grid-cols-2 gap-4">
              <p><strong>Currency:</strong> {classificationResult.intents.currency}</p>
              <p><strong>Time Granularity:</strong> {classificationResult.intents.timeGranularity}</p>
              <p><strong>Geographic Scope:</strong> {classificationResult.intents.geographicScope}</p>
              <p><strong>Planning Horizon:</strong> {classificationResult.intents.planningHorizon} months</p>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-2">Key Drivers Identified</h4>
          <div className="flex flex-wrap gap-2">
            {classificationResult.drivers.map((driver: string, index: number) => (
              <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                {driver}
              </span>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t">
          <button
            onClick={() => setCurrentStep('questions')}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Continue to Questions
          </button>
        </div>
      </div>
    </div>
  );

  const renderQuestionsStep = () => (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-semibold mb-6">Step 3: Financial Inputs</h2>
      <p className="text-gray-600 mb-6">
        Please provide the following financial information to generate your 3-statement model.
      </p>
      
      <div className="space-y-6">
        {questions && questions.length > 0 ? (
          questions.map((question, index) => {
            // Ensure question is a valid object with required properties
            if (!question || typeof question !== 'object') {
              console.warn('Invalid question object:', question);
              return null;
            }
            
            const questionId = question.id || `question-${index}`;
            const questionText = question.question || 'Question text not available';
            const questionType = question.type || 'text';
            const questionUnit = question.unit || '';
            const questionExplanation = question.explanation || '';
            const questionDefaultValue = question.defaultValue || '';
            const questionOptions = question.validation?.options || [];
            
            return (
              <div key={questionId} className="border border-gray-200 rounded-lg p-4">
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {questionText}
                  </label>
                  {questionExplanation && (
                    <p className="text-sm text-gray-500 mb-2">{questionExplanation}</p>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  {questionType === 'number' && (
                    <input
                      type="number"
                      value={answeredQuestions[questionId] || ''}
                      onChange={(e) => handleQuestionAnswer(questionId, parseFloat(e.target.value) || 0)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={questionDefaultValue.toString() || '0'}
                    />
                  )}
                  {questionType === 'text' && (
                    <input
                      type="text"
                      value={answeredQuestions[questionId] || ''}
                      onChange={(e) => handleQuestionAnswer(questionId, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={questionDefaultValue.toString() || ''}
                    />
                  )}
                  {questionType === 'select' && (
                    <select
                      value={answeredQuestions[questionId] || ''}
                      onChange={(e) => handleQuestionAnswer(questionId, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select an option</option>
                      {Array.isArray(questionOptions) && questionOptions.map((option: string, optionIndex: number) => (
                        <option key={optionIndex} value={option}>{option}</option>
                      ))}
                    </select>
                  )}
                  {questionUnit && (
                    <span className="text-sm text-gray-500 whitespace-nowrap">{questionUnit}</span>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No questions available. Please go back and try again.</p>
            <button
              onClick={() => setCurrentStep('description')}
              className="mt-4 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700"
            >
              Go Back
            </button>
          </div>
        )}
        
        {questions && questions.length > 0 && (
          <div className="pt-4 border-t">
            <button
              onClick={handleGenerateModel}
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Generating Model...' : 'Generate Financial Model'}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderModelStep = () => (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-semibold mb-6">Step 4: Financial Model Generated</h2>
      
      {financialModel && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-2">Income Statement</h4>
              <p className="text-sm text-green-700">Generated with {financialModel.incomeStatement?.periods || 0} periods</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Balance Sheet</h4>
              <p className="text-sm text-blue-700">Assets, Liabilities & Equity</p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-medium text-purple-900 mb-2">Cash Flow</h4>
              <p className="text-sm text-purple-700">Operating, Investing & Financing</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Schedules</h4>
              <p className="text-sm text-gray-700">Depreciation, Debt, Working Capital</p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-900 mb-2">Scenarios</h4>
              <p className="text-sm text-yellow-700">Base, Optimistic, Pessimistic</p>
            </div>
          </div>

          <div className="pt-4 border-t">
            <button
              onClick={() => setCurrentStep('export')}
              className="w-full bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Export Financial Model
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderExportStep = () => (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-semibold mb-6">Step 5: Export Options</h2>
      <p className="text-gray-600 mb-6">
        Download your financial model in the format that works best for you.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border border-gray-200 rounded-lg p-6 text-center">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Excel Workbook</h3>
          <p className="text-sm text-gray-600 mb-4">
            Fully linked Excel file with formulas, named ranges, data validation, 
            and audit sheets. Perfect for financial professionals.
          </p>
          <button
            onClick={() => handleExport('excel')}
            disabled={exportLoading}
            className="w-full bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exportLoading ? 'Generating...' : 'Download Excel (.xlsx)'}
          </button>
        </div>

        <div className="border border-gray-200 rounded-lg p-6 text-center">
          <div className="text-4xl mb-4">📁</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">CSV Package</h3>
          <p className="text-sm text-gray-600 mb-4">
            Individual CSV files for each sheet, zipped together. 
            Ideal for data analysis and integration with other tools.
          </p>
          <button
            onClick={() => handleExport('csv')}
            disabled={exportLoading}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exportLoading ? 'Generating...' : 'Download CSV Package (.zip)'}
          </button>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t">
        <button
          onClick={() => {
            setCurrentStep('description');
            setBusinessDescription('');
            setClassificationResult(null);
            setQuestions([]);
            setAnsweredQuestions({});
            setFinancialModel(null);
          }}
          className="w-full bg-gray-600 text-white py-3 px-6 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          Start New Model
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>FinMod AI - AI-Assisted Financial Modeling Platform</title>
        <meta name="description" content="Generate comprehensive 3-statement financial models with AI assistance" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              FinMod AI Platform
            </h1>
            <p className="text-xl text-gray-600">
              AI-Assisted Financial Modeling Platform
            </p>
          </div>

          {renderStepIndicator()}

          {currentStep === 'description' && renderBusinessDescriptionStep()}
          {currentStep === 'classification' && renderClassificationStep()}
          {currentStep === 'questions' && renderQuestionsStep()}
          {currentStep === 'model' && renderModelStep()}
          {currentStep === 'export' && renderExportStep()}
        </div>
      </main>

      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 FinMod AI Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
