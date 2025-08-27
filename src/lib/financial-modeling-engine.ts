import { 
  FinancialInputs, 
  FinancialModel, 
  IncomeStatement, 
  BalanceSheet, 
  CashFlowStatement,
  DepreciationSchedule,
  DebtSchedule,
  WorkingCapitalSchedule,
  Scenario,
  AuditCheck
} from '@/types';

export class FinancialModelingEngine {
  private static instance: FinancialModelingEngine;
  
  private constructor() {}
  
  static getInstance(): FinancialModelingEngine {
    if (!FinancialModelingEngine.instance) {
      FinancialModelingEngine.instance = new FinancialModelingEngine();
    }
    return FinancialModelingEngine.instance;
  }

  generateFinancialModel(inputs: FinancialInputs): FinancialModel {
    const periods = 60; // 5 years monthly
    
    // Generate schedules
    const depreciationSchedule = this.generateDepreciationSchedule(inputs, periods);
    const debtSchedule = this.generateDebtSchedule(inputs, periods);
    const workingCapitalSchedule = this.generateWorkingCapitalSchedule(inputs, periods);
    
    // Generate three statements
    const incomeStatement = this.generateIncomeStatement(inputs, periods, depreciationSchedule, debtSchedule);
    const balanceSheet = this.generateBalanceSheet(inputs, periods, incomeStatement, workingCapitalSchedule, depreciationSchedule, debtSchedule);
    const cashFlowStatement = this.generateCashFlowStatement(inputs, periods, incomeStatement, balanceSheet, depreciationSchedule, debtSchedule, workingCapitalSchedule);
    
    // Generate scenarios
    const scenarios = this.generateScenarios(inputs, incomeStatement, balanceSheet, cashFlowStatement);
    
    // Generate audit checks
    const auditChecks = this.generateAuditChecks(inputs, incomeStatement, balanceSheet, cashFlowStatement);
    
    return {
      id: `model_${Date.now()}`,
      financialInputsId: inputs.id,
      incomeStatement,
      balanceSheet,
      cashFlowStatement,
      schedules: {
        depreciation: depreciationSchedule,
        debt: debtSchedule,
        workingCapital: workingCapitalSchedule
      },
      scenarios,
      auditChecks,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private generateIncomeStatement(
    inputs: FinancialInputs, 
    periods: number,
    depreciationSchedule: DepreciationSchedule,
    debtSchedule: DebtSchedule
  ): IncomeStatement {
    const revenue = this.calculateRevenue(inputs, periods);
    const costOfGoodsSold = this.calculateCostOfGoodsSold(inputs, revenue);
    const grossProfit = revenue.map((r, i) => r - costOfGoodsSold[i]);
    
    const operatingExpenses = {
      salesAndMarketing: this.calculateOperatingExpense(inputs.operatingExpenses.salesAndMarketing, revenue),
      researchAndDevelopment: this.calculateOperatingExpense(inputs.operatingExpenses.researchAndDevelopment, revenue),
      generalAndAdministrative: this.calculateOperatingExpense(inputs.operatingExpenses.generalAndAdministrative, revenue)
    };
    
    const totalOperatingExpenses = revenue.map((_, i) => 
      operatingExpenses.salesAndMarketing[i] + 
      operatingExpenses.researchAndDevelopment[i] + 
      operatingExpenses.generalAndAdministrative[i]
    );
    
    const operatingIncome = grossProfit.map((gp, i) => gp - totalOperatingExpenses[i]);
    const interestExpense = debtSchedule.interestPayments;
    const taxes = operatingIncome.map((oi, i) => Math.max(0, oi - interestExpense[i]) * inputs.taxRate);
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

  private generateBalanceSheet(
    inputs: FinancialInputs,
    periods: number,
    incomeStatement: IncomeStatement,
    workingCapitalSchedule: WorkingCapitalSchedule,
    depreciationSchedule: DepreciationSchedule,
    debtSchedule: DebtSchedule
  ): BalanceSheet {
    const cash = this.calculateCashBalance(incomeStatement, periods);
    const accountsReceivable = workingCapitalSchedule.accountsReceivable;
    const inventory = workingCapitalSchedule.inventory;
    const fixedAssets = depreciationSchedule.endingBalance;
    const accumulatedDepreciation = depreciationSchedule.depreciation.map((_, i) => 
      depreciationSchedule.depreciation.slice(0, i + 1).reduce((sum, dep) => sum + dep, 0)
    );
    
    const totalAssets = cash.map((c, i) => 
      c + accountsReceivable[i] + inventory[i] + fixedAssets[i] - accumulatedDepreciation[i]
    );
    
    const accountsPayable = workingCapitalSchedule.accountsPayable;
    const debt = debtSchedule.endingBalance;
    const totalLiabilities = accountsPayable.map((ap, i) => ap + debt[i]);
    
    const commonStock = new Array(periods).fill(inputs.debtStructure.initialDebt * 0.3); // Assume 30% equity
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

  private generateCashFlowStatement(
    inputs: FinancialInputs,
    periods: number,
    incomeStatement: IncomeStatement,
    balanceSheet: BalanceSheet,
    depreciationSchedule: DepreciationSchedule,
    debtSchedule: DebtSchedule,
    workingCapitalSchedule: WorkingCapitalSchedule
  ): CashFlowStatement {
    const operatingCashFlow = incomeStatement.netIncome.map((ni, i) => 
      ni + depreciationSchedule.depreciation[i] - workingCapitalSchedule.changeInWorkingCapital[i]
    );
    
    const investingCashFlow = depreciationSchedule.additions.map(add => -add);
    const financingCashFlow = debtSchedule.newDebt.map((nd, i) => 
      nd - debtSchedule.principalPayments[i] - debtSchedule.interestPayments[i]
    );
    
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

  private generateDepreciationSchedule(inputs: FinancialInputs, periods: number): DepreciationSchedule {
    const beginningBalance = new Array(periods).fill(0);
    const additions = new Array(periods).fill(inputs.capex.annualCapex / 12); // Monthly capex
    const depreciation = new Array(periods).fill(0);
    const endingBalance = new Array(periods).fill(0);
    
    let currentBalance = 0;
    for (let i = 0; i < periods; i++) {
      beginningBalance[i] = currentBalance;
      currentBalance += additions[i];
      depreciation[i] = currentBalance * (inputs.capex.depreciationRate / 12);
      endingBalance[i] = currentBalance - depreciation[i];
      currentBalance = endingBalance[i];
    }
    
    return {
      periods,
      beginningBalance,
      additions,
      depreciation,
      endingBalance
    };
  }

  private generateDebtSchedule(inputs: FinancialInputs, periods: number): DebtSchedule {
    const beginningBalance = new Array(periods).fill(0);
    const newDebt = new Array(periods).fill(0);
    const principalPayments = new Array(periods).fill(0);
    const interestPayments = new Array(periods).fill(0);
    const endingBalance = new Array(periods).fill(0);
    
    beginningBalance[0] = inputs.debtStructure.initialDebt;
    endingBalance[0] = inputs.debtStructure.initialDebt;
    
    const monthlyRate = inputs.debtStructure.interestRate / 12;
    const totalPayments = inputs.debtStructure.initialDebt * (monthlyRate * Math.pow(1 + monthlyRate, inputs.debtStructure.debtMaturity * 12)) / (Math.pow(1 + monthlyRate, inputs.debtStructure.debtMaturity * 12) - 1);
    
    for (let i = 1; i < periods; i++) {
      beginningBalance[i] = endingBalance[i - 1];
      interestPayments[i] = beginningBalance[i] * monthlyRate;
      principalPayments[i] = Math.min(totalPayments - interestPayments[i], beginningBalance[i]);
      endingBalance[i] = beginningBalance[i] - principalPayments[i];
    }
    
    return {
      periods,
      beginningBalance,
      newDebt,
      principalPayments,
      interestPayments,
      endingBalance
    };
  }

  private generateWorkingCapitalSchedule(inputs: FinancialInputs, periods: number): WorkingCapitalSchedule {
    const accountsReceivable = new Array(periods).fill(0);
    const inventory = new Array(periods).fill(0);
    const accountsPayable = new Array(periods).fill(0);
    const netWorkingCapital = new Array(periods).fill(0);
    const changeInWorkingCapital = new Array(periods).fill(0);
    
    // Calculate based on DSO, DIO, DPO
    const monthlyRevenue = 100000; // Base assumption, will be overridden
    const monthlyCOGS = monthlyRevenue * 0.6; // Base assumption
    
    for (let i = 0; i < periods; i++) {
      accountsReceivable[i] = (monthlyRevenue * inputs.workingCapital.daysSalesOutstanding) / 30;
      inventory[i] = (monthlyCOGS * inputs.workingCapital.daysInventoryOutstanding) / 30;
      accountsPayable[i] = (monthlyCOGS * inputs.workingCapital.daysPayablesOutstanding) / 30;
      netWorkingCapital[i] = accountsReceivable[i] + inventory[i] - accountsPayable[i];
      
      if (i > 0) {
        changeInWorkingCapital[i] = netWorkingCapital[i] - netWorkingCapital[i - 1];
      }
    }
    
    return {
      periods,
      accountsReceivable,
      inventory,
      accountsPayable,
      netWorkingCapital,
      changeInWorkingCapital
    };
  }

  private generateScenarios(
    inputs: FinancialInputs,
    incomeStatement: IncomeStatement,
    balanceSheet: BalanceSheet,
    cashFlowStatement: CashFlowStatement
  ): Scenario[] {
    const baseScenario: Scenario = {
      id: 'base',
      name: 'Base Case',
      description: 'Base case scenario with current assumptions',
      type: 'base',
      assumptions: {},
      results: this.calculateScenarioResults(incomeStatement, balanceSheet, cashFlowStatement, inputs.discountRate)
    };
    
    const optimisticScenario: Scenario = {
      id: 'optimistic',
      name: 'Optimistic Case',
      description: 'Optimistic scenario with 20% better performance',
      type: 'optimistic',
      assumptions: { revenueGrowth: 1.2, marginImprovement: 1.1 },
      results: this.calculateScenarioResults(incomeStatement, balanceSheet, cashFlowStatement, inputs.discountRate * 0.9)
    };
    
    const pessimisticScenario: Scenario = {
      id: 'pessimistic',
      name: 'Pessimistic Case',
      description: 'Pessimistic scenario with 20% worse performance',
      type: 'pessimistic',
      assumptions: { revenueGrowth: 0.8, marginDeterioration: 0.9 },
      results: this.calculateScenarioResults(incomeStatement, balanceSheet, cashFlowStatement, inputs.discountRate * 1.1)
    };
    
    return [baseScenario, optimisticScenario, pessimisticScenario];
  }

  private generateAuditChecks(
    inputs: FinancialInputs,
    incomeStatement: IncomeStatement,
    balanceSheet: BalanceSheet,
    cashFlowStatement: CashFlowStatement
  ): AuditCheck[] {
    const checks: AuditCheck[] = [];
    
    // Revenue growth check
    const avgRevenueGrowth = this.calculateAverageGrowth(incomeStatement.revenue);
    checks.push({
      id: 'revenue_growth',
      name: 'Revenue Growth',
      description: 'Check if revenue growth is reasonable',
      status: avgRevenueGrowth > 0.5 ? 'warning' : avgRevenueGrowth < 0 ? 'fail' : 'pass',
      message: `Average revenue growth is ${(avgRevenueGrowth * 100).toFixed(1)}%`,
      value: avgRevenueGrowth,
      threshold: 0.3
    });
    
    // Margin check
    const avgGrossMargin = incomeStatement.grossProfit.reduce((sum, gp, i) => sum + (gp / incomeStatement.revenue[i]), 0) / incomeStatement.periods;
    checks.push({
      id: 'gross_margin',
      name: 'Gross Margin',
      description: 'Check if gross margin is reasonable',
      status: avgGrossMargin < 0.1 ? 'fail' : avgGrossMargin < 0.2 ? 'warning' : 'pass',
      message: `Average gross margin is ${(avgGrossMargin * 100).toFixed(1)}%`,
      value: avgGrossMargin,
      threshold: 0.2
    });
    
    // Cash flow check
    const negativeCashFlowPeriods = cashFlowStatement.netCashFlow.filter(cf => cf < 0).length;
    checks.push({
      id: 'cash_flow',
      name: 'Cash Flow',
      description: 'Check for negative cash flow periods',
      status: negativeCashFlowPeriods > 12 ? 'fail' : negativeCashFlowPeriods > 6 ? 'warning' : 'pass',
      message: `${negativeCashFlowPeriods} periods with negative cash flow`,
      value: negativeCashFlowPeriods,
      threshold: 6
    });
    
    // Debt coverage check
    const avgInterestCoverage = incomeStatement.operatingIncome.reduce((sum, oi, i) => 
      sum + (oi / Math.max(incomeStatement.interestExpense[i], 1)), 0) / incomeStatement.periods;
    checks.push({
      id: 'interest_coverage',
      name: 'Interest Coverage',
      description: 'Check interest coverage ratio',
      status: avgInterestCoverage < 1.5 ? 'fail' : avgInterestCoverage < 2 ? 'warning' : 'pass',
      message: `Average interest coverage is ${avgInterestCoverage.toFixed(2)}x`,
      value: avgInterestCoverage,
      threshold: 2
    });
    
    return checks;
  }

  // Helper methods
  private calculateRevenue(inputs: FinancialInputs, periods: number): number[] {
    const revenue = new Array(periods).fill(0);
    let currentRevenue = 100000; // Base revenue
    
    for (let i = 0; i < periods; i++) {
      revenue[i] = currentRevenue;
      const growthRate = inputs.revenueGrowth[Math.min(i, inputs.revenueGrowth.length - 1)];
      currentRevenue *= (1 + growthRate / 12); // Monthly growth
    }
    
    return revenue;
  }

  private calculateCostOfGoodsSold(inputs: FinancialInputs, revenue: number[]): number[] {
    return revenue.map(r => r * inputs.costStructure.costOfGoodsSold.percentage + inputs.costStructure.costOfGoodsSold.fixedCosts);
  }

  private calculateOperatingExpense(expenseConfig: { percentage: number; fixedCosts: number }, revenue: number[]): number[] {
    return revenue.map(r => r * expenseConfig.percentage + expenseConfig.fixedCosts);
  }

  private calculateCashBalance(incomeStatement: IncomeStatement, periods: number): number[] {
    const cash = new Array(periods).fill(0);
    let currentCash = 50000; // Starting cash
    
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
    let currentCash = 50000; // Starting cash
    
    for (let i = 0; i < netCashFlow.length; i++) {
      currentCash += netCashFlow[i];
      endingCash[i] = currentCash;
    }
    
    return endingCash;
  }

  private calculateAverageGrowth(values: number[]): number {
    if (values.length < 2) return 0;
    const growthRates = [];
    for (let i = 1; i < values.length; i++) {
      if (values[i - 1] > 0) {
        growthRates.push((values[i] - values[i - 1]) / values[i - 1]);
      }
    }
    return growthRates.length > 0 ? growthRates.reduce((sum, rate) => sum + rate, 0) / growthRates.length : 0;
  }

  private calculateScenarioResults(
    incomeStatement: IncomeStatement,
    balanceSheet: BalanceSheet,
    cashFlowStatement: CashFlowStatement,
    discountRate: number
  ): { npv: number; irr: number; paybackPeriod: number; keyMetrics: Record<string, number> } {
    const cashFlows = cashFlowStatement.netCashFlow;
    const npv = this.calculateNPV(cashFlows, discountRate);
    const irr = this.calculateIRR(cashFlows);
    const paybackPeriod = this.calculatePaybackPeriod(cashFlows);
    
    return {
      npv,
      irr,
      paybackPeriod,
      keyMetrics: {
        totalRevenue: incomeStatement.revenue.reduce((sum, r) => sum + r, 0),
        totalNetIncome: incomeStatement.netIncome.reduce((sum, ni) => sum + ni, 0),
        avgGrossMargin: incomeStatement.grossProfit.reduce((sum, gp, i) => sum + (gp / incomeStatement.revenue[i]), 0) / incomeStatement.periods,
        finalCash: cashFlowStatement.endingCash[cashFlowStatement.endingCash.length - 1]
      }
    };
  }

  private calculateNPV(cashFlows: number[], discountRate: number): number {
    return cashFlows.reduce((npv, cf, i) => npv + cf / Math.pow(1 + discountRate / 12, i), 0);
  }

  private calculateIRR(cashFlows: number[]): number {
    // Simplified IRR calculation
    const totalCF = cashFlows.reduce((sum, cf) => sum + cf, 0);
    const initialInvestment = Math.abs(cashFlows[0]);
    return totalCF > 0 ? (totalCF / initialInvestment - 1) * 12 : 0; // Annualized
  }

  private calculatePaybackPeriod(cashFlows: number[]): number {
    let cumulativeCF = 0;
    for (let i = 0; i < cashFlows.length; i++) {
      cumulativeCF += cashFlows[i];
      if (cumulativeCF >= 0) {
        return i + 1; // Return period number
      }
    }
    return cashFlows.length; // Never payback
  }
}
