export interface BusinessDescription {
  id: string;
  description: string;
  industry: string;
  businessModel: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FinancialInputs {
  id: string;
  businessDescriptionId: string;
  
  // Revenue inputs
  revenueModel: RevenueModel;
  revenueGrowth: number[];
  pricingStrategy: PricingStrategy;
  
  // Cost inputs
  costStructure: CostStructure;
  operatingExpenses: OperatingExpenses;
  marginTargets: MarginTargets;
  
  // Working capital
  workingCapital: WorkingCapital;
  
  // Capital expenditure
  capex: CapexModel;
  
  // Debt and financing
  debtStructure: DebtStructure;
  
  // Other assumptions
  taxRate: number;
  discountRate: number;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface RevenueModel {
  type: 'subscription' | 'transactional' | 'marketplace' | 'advertising' | 'other';
  details: {
    averageRevenuePerUser?: number;
    customerLifetimeValue?: number;
    churnRate?: number;
    transactionVolume?: number;
    commissionRate?: number;
    [key: string]: any;
  };
}

export interface PricingStrategy {
  basePrice: number;
  pricingModel: 'fixed' | 'tiered' | 'usage-based' | 'freemium';
  tiers?: Array<{
    name: string;
    price: number;
    features: string[];
  }>;
}

export interface CostStructure {
  costOfGoodsSold: {
    percentage: number;
    fixedCosts: number;
  };
  grossMargin: number;
}

export interface OperatingExpenses {
  salesAndMarketing: {
    percentage: number;
    fixedCosts: number;
  };
  researchAndDevelopment: {
    percentage: number;
    fixedCosts: number;
  };
  generalAndAdministrative: {
    percentage: number;
    fixedCosts: number;
  };
}

export interface MarginTargets {
  grossMargin: number;
  operatingMargin: number;
  netMargin: number;
}

export interface WorkingCapital {
  daysSalesOutstanding: number;
  daysInventoryOutstanding: number;
  daysPayablesOutstanding: number;
  cashConversionCycle: number;
}

export interface CapexModel {
  type: 'light' | 'medium' | 'heavy';
  annualCapex: number;
  depreciationRate: number;
}

export interface DebtStructure {
  initialDebt: number;
  interestRate: number;
  repaymentSchedule: 'monthly' | 'quarterly' | 'annually';
  debtMaturity: number;
}

export interface FinancialModel {
  id: string;
  financialInputsId: string;
  
  // Three statements
  incomeStatement: IncomeStatement;
  balanceSheet: BalanceSheet;
  cashFlowStatement: CashFlowStatement;
  
  // Schedules
  schedules: {
    depreciation: DepreciationSchedule;
    debt: DebtSchedule;
    workingCapital: WorkingCapitalSchedule;
  };
  
  // Scenarios
  scenarios: Scenario[];
  
  // Audit checks
  auditChecks: AuditCheck[];
  
  createdAt: Date;
  updatedAt: Date;
}

export interface IncomeStatement {
  periods: number;
  revenue: number[];
  costOfGoodsSold: number[];
  grossProfit: number[];
  operatingExpenses: {
    salesAndMarketing: number[];
    researchAndDevelopment: number[];
    generalAndAdministrative: number[];
  };
  operatingIncome: number[];
  interestExpense: number[];
  taxes: number[];
  netIncome: number[];
}

export interface BalanceSheet {
  periods: number;
  assets: {
    cash: number[];
    accountsReceivable: number[];
    inventory: number[];
    fixedAssets: number[];
    accumulatedDepreciation: number[];
    totalAssets: number[];
  };
  liabilities: {
    accountsPayable: number[];
    debt: number[];
    totalLiabilities: number[];
  };
  equity: {
    commonStock: number[];
    retainedEarnings: number[];
    totalEquity: number[];
  };
}

export interface CashFlowStatement {
  periods: number;
  operatingCashFlow: number[];
  investingCashFlow: number[];
  financingCashFlow: number[];
  netCashFlow: number[];
  endingCash: number[];
}

export interface DepreciationSchedule {
  periods: number;
  beginningBalance: number[];
  additions: number[];
  depreciation: number[];
  endingBalance: number[];
}

export interface DebtSchedule {
  periods: number;
  beginningBalance: number[];
  newDebt: number[];
  principalPayments: number[];
  interestPayments: number[];
  endingBalance: number[];
}

export interface WorkingCapitalSchedule {
  periods: number;
  accountsReceivable: number[];
  inventory: number[];
  accountsPayable: number[];
  netWorkingCapital: number[];
  changeInWorkingCapital: number[];
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  type: 'base' | 'optimistic' | 'pessimistic' | 'custom';
  assumptions: Record<string, any>;
  results: {
    npv: number;
    irr: number;
    paybackPeriod: number;
    keyMetrics: Record<string, number>;
  };
}

export interface AuditCheck {
  id: string;
  name: string;
  description: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  value?: number;
  threshold?: number;
}

export interface AIQuestion {
  id: string;
  question: string;
  type: 'text' | 'number' | 'select' | 'multi-select';
  category: 'revenue' | 'costs' | 'working_capital' | 'capex' | 'debt' | 'other';
  required: boolean;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface ConversationSession {
  id: string;
  businessDescription: string;
  questions: AIQuestion[];
  answers: Record<string, any>;
  status: 'in_progress' | 'completed' | 'abandoned';
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
