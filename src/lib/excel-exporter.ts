import ExcelJS from 'exceljs';
import { FinancialModel, IncomeStatement, BalanceSheet, CashFlowStatement } from '@/types';
import path from 'path';
import fs from 'fs';

export interface ExcelExportOptions {
  includeAuditSheet?: boolean;
  includeScenarios?: boolean;
  includeSchedules?: boolean;
  formatAsCurrency?: boolean;
  includeNamedRanges?: boolean;
  includeCrossSheetFormulas?: boolean;
}

export class ExcelExporter {
  private static instance: ExcelExporter;
  
  private constructor() {}
  
  static getInstance(): ExcelExporter {
    if (!ExcelExporter.instance) {
      ExcelExporter.instance = new ExcelExporter();
    }
    return ExcelExporter.instance;
  }

  async exportToExcel(
    financialModel: FinancialModel,
    options: ExcelExportOptions = {}
  ): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    
    // Add metadata
    workbook.creator = 'FinMod AI Platform';
    workbook.lastModifiedBy = 'FinMod AI';
    workbook.created = new Date();
    workbook.modified = new Date();
    
    // Create sheets
    await this.createInputsSheet(workbook, financialModel);
    await this.createIncomeStatementSheet(workbook, financialModel.incomeStatement);
    await this.createBalanceSheetSheet(workbook, financialModel.balanceSheet);
    await this.createCashFlowSheet(workbook, financialModel.cashFlowStatement);
    
    if (options.includeSchedules) {
      await this.createSchedulesSheet(workbook, financialModel.schedules);
    }
    
    if (options.includeScenarios) {
      await this.createScenariosSheet(workbook, financialModel.scenarios);
    }
    
    if (options.includeAuditSheet) {
      await this.createAuditSheet(workbook, financialModel);
    }
    
    // Add named ranges
    if (options.includeNamedRanges) {
      this.addNamedRanges(workbook);
    }
    
    // Add cross-sheet formulas
    if (options.includeCrossSheetFormulas) {
      this.addCrossSheetFormulas(workbook);
    }
    
    // Generate buffer
    return await workbook.xlsx.writeBuffer();
  }

  private async createInputsSheet(workbook: ExcelJS.Workbook, model: FinancialModel): Promise<void> {
    const worksheet = workbook.addWorksheet('Inputs');
    
    // Set up headers
    worksheet.columns = [
      { header: 'Input', key: 'input', width: 30 },
      { header: 'Value', key: 'value', width: 20 },
      { header: 'Description', key: 'description', width: 50 },
      { header: 'Category', key: 'category', width: 15 },
      { header: 'Validation', key: 'validation', width: 20 }
    ];
    
    // Add input data
    const inputs = [
      { input: 'Model ID', value: model.id, description: 'Unique model identifier', category: 'System', validation: 'Required' },
      { input: 'Created Date', value: model.createdAt.toISOString().split('T')[0], description: 'Model creation date', category: 'System', validation: 'Auto-generated' },
      { input: 'Planning Periods', value: model.incomeStatement?.periods || 60, description: 'Number of planning periods', category: 'System', validation: 'Required' },
      { input: 'Currency', value: 'USD', description: 'Reporting currency', category: 'System', validation: 'Required' }
    ];
    
    inputs.forEach(input => {
      worksheet.addRow(input);
    });
    
    // Add formatting
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };
  }

  private async createIncomeStatementSheet(workbook: ExcelJS.Workbook, incomeStatement: IncomeStatement): Promise<void> {
    const worksheet = workbook.addWorksheet('Income Statement');
    
    // Set up headers
    const headers = ['Period', 'Revenue', 'COGS', 'Gross Profit', 'Sales & Marketing', 'R&D', 'G&A', 'Operating Income', 'Interest Expense', 'Taxes', 'Net Income'];
    worksheet.addRow(headers);
    
    // Add data
    const periods = incomeStatement?.periods || 60;
    for (let i = 0; i < periods; i++) {
      const row = [
        i + 1,
        incomeStatement?.revenue?.[i] || 0,
        incomeStatement?.costOfGoodsSold?.[i] || 0,
        incomeStatement?.grossProfit?.[i] || 0,
        incomeStatement?.operatingExpenses?.salesAndMarketing?.[i] || 0,
        incomeStatement?.operatingExpenses?.researchAndDevelopment?.[i] || 0,
        incomeStatement?.operatingExpenses?.generalAndAdministrative?.[i] || 0,
        incomeStatement?.operatingIncome?.[i] || 0,
        incomeStatement?.interestExpense?.[i] || 0,
        incomeStatement?.taxes?.[i] || 0,
        incomeStatement?.netIncome?.[i] || 0
      ];
      worksheet.addRow(row);
    }
    
    // Add totals row
    const totalsRow = ['Total'];
    totalsRow.push(this.sumColumn(incomeStatement?.revenue || []));
    totalsRow.push(this.sumColumn(incomeStatement?.costOfGoodsSold || []));
    totalsRow.push(this.sumColumn(incomeStatement?.grossProfit || []));
    totalsRow.push(this.sumColumn(incomeStatement?.operatingExpenses?.salesAndMarketing || []));
    totalsRow.push(this.sumColumn(incomeStatement?.operatingExpenses?.researchAndDevelopment || []));
    totalsRow.push(this.sumColumn(incomeStatement?.operatingExpenses?.generalAndAdministrative || []));
    totalsRow.push(this.sumColumn(incomeStatement?.operatingIncome || []));
    totalsRow.push(this.sumColumn(incomeStatement?.interestExpense || []));
    totalsRow.push(this.sumColumn(incomeStatement?.taxes || []));
    totalsRow.push(this.sumColumn(incomeStatement?.netIncome || []));
    
    worksheet.addRow(totalsRow);
    
    // Add formatting
    this.formatFinancialSheet(worksheet);
  }

  private async createBalanceSheetSheet(workbook: ExcelJS.Workbook, balanceSheet: BalanceSheet): Promise<void> {
    const worksheet = workbook.addWorksheet('Balance Sheet');
    
    // Assets section
    worksheet.addRow(['ASSETS']);
    worksheet.addRow(['Period', 'Cash', 'Accounts Receivable', 'Inventory', 'Fixed Assets', 'Accumulated Depreciation', 'Total Assets']);
    
    const periods = balanceSheet?.periods || 60;
    for (let i = 0; i < periods; i++) {
      const row = [
        i + 1,
        balanceSheet?.assets?.cash?.[i] || 0,
        balanceSheet?.assets?.accountsReceivable?.[i] || 0,
        balanceSheet?.assets?.inventory?.[i] || 0,
        balanceSheet?.assets?.fixedAssets?.[i] || 0,
        balanceSheet?.assets?.accumulatedDepreciation?.[i] || 0,
        balanceSheet?.assets?.totalAssets?.[i] || 0
      ];
      worksheet.addRow(row);
    }
    
    // Liabilities section
    worksheet.addRow([]);
    worksheet.addRow(['LIABILITIES']);
    worksheet.addRow(['Period', 'Accounts Payable', 'Debt', 'Total Liabilities']);
    
    for (let i = 0; i < periods; i++) {
      const row = [
        i + 1,
        balanceSheet?.liabilities?.accountsPayable?.[i] || 0,
        balanceSheet?.liabilities?.debt?.[i] || 0,
        balanceSheet?.liabilities?.totalLiabilities?.[i] || 0
      ];
      worksheet.addRow(row);
    }
    
    // Equity section
    worksheet.addRow([]);
    worksheet.addRow(['EQUITY']);
    worksheet.addRow(['Period', 'Common Stock', 'Retained Earnings', 'Total Equity']);
    
    for (let i = 0; i < periods; i++) {
      const row = [
        i + 1,
        balanceSheet?.equity?.commonStock?.[i] || 0,
        balanceSheet?.equity?.retainedEarnings?.[i] || 0,
        balanceSheet?.equity?.totalEquity?.[i] || 0
      ];
      worksheet.addRow(row);
    }
    
    // Add formatting
    this.formatFinancialSheet(worksheet);
  }

  private async createCashFlowSheet(workbook: ExcelJS.Workbook, cashFlowStatement: CashFlowStatement): Promise<void> {
    const worksheet = workbook.addWorksheet('Cash Flow Statement');
    
    // Set up headers
    const headers = ['Period', 'Operating Cash Flow', 'Investing Cash Flow', 'Financing Cash Flow', 'Net Cash Flow', 'Ending Cash'];
    worksheet.addRow(headers);
    
    // Add data
    const periods = cashFlowStatement?.periods || 60;
    for (let i = 0; i < periods; i++) {
      const row = [
        i + 1,
        cashFlowStatement?.operatingCashFlow?.[i] || 0,
        cashFlowStatement?.investingCashFlow?.[i] || 0,
        cashFlowStatement?.financingCashFlow?.[i] || 0,
        cashFlowStatement?.netCashFlow?.[i] || 0,
        cashFlowStatement?.endingCash?.[i] || 0
      ];
      worksheet.addRow(row);
    }
    
    // Add totals row
    const totalsRow = ['Total'];
    totalsRow.push(this.sumColumn(cashFlowStatement?.operatingCashFlow || []));
    totalsRow.push(this.sumColumn(cashFlowStatement?.investingCashFlow || []));
    totalsRow.push(this.sumColumn(cashFlowStatement?.financingCashFlow || []));
    totalsRow.push(this.sumColumn(cashFlowStatement?.netCashFlow || []));
    totalsRow.push(cashFlowStatement?.endingCash?.[cashFlowStatement?.endingCash?.length - 1] || 0);
    
    worksheet.addRow(totalsRow);
    
    // Add formatting
    this.formatFinancialSheet(worksheet);
  }

  private async createSchedulesSheet(workbook: ExcelJS.Workbook, schedules: any): Promise<void> {
    const worksheet = workbook.addWorksheet('Schedules');
    
    // Depreciation Schedule
    worksheet.addRow(['DEPRECIATION SCHEDULE']);
    worksheet.addRow(['Period', 'Beginning Balance', 'Additions', 'Depreciation', 'Ending Balance']);
    
    if (schedules.depreciation && schedules.depreciation.periods) {
      for (let i = 0; i < schedules.depreciation.periods; i++) {
      const row = [
        i + 1,
        schedules.depreciation.beginningBalance[i],
        schedules.depreciation.additions[i],
        schedules.depreciation.depreciation[i],
        schedules.depreciation.endingBalance[i]
      ];
      worksheet.addRow(row);
    }
    
    }
    
    // Debt Schedule
    worksheet.addRow([]);
    worksheet.addRow(['DEBT SCHEDULE']);
    worksheet.addRow(['Period', 'Beginning Balance', 'New Debt', 'Principal Payments', 'Interest Payments', 'Ending Balance']);
    
    if (schedules.debt && schedules.debt.periods) {
      for (let i = 0; i < schedules.debt.periods; i++) {
      const row = [
        i + 1,
        schedules.debt.beginningBalance[i],
        schedules.debt.newDebt[i],
        schedules.debt.principalPayments[i],
        schedules.debt.interestPayments[i],
        schedules.debt.endingBalance[i]
      ];
      worksheet.addRow(row);
    }
    
    }
    
    // Working Capital Schedule
    worksheet.addRow([]);
    worksheet.addRow(['WORKING CAPITAL SCHEDULE']);
    worksheet.addRow(['Period', 'Accounts Receivable', 'Inventory', 'Accounts Payable', 'Net Working Capital', 'Change in WC']);
    
    if (schedules.workingCapital && schedules.workingCapital.periods) {
      for (let i = 0; i < schedules.workingCapital.periods; i++) {
      const row = [
        i + 1,
        schedules.workingCapital.accountsReceivable[i],
        schedules.workingCapital.inventory[i],
        schedules.workingCapital.accountsPayable[i],
        schedules.workingCapital.netWorkingCapital[i],
        schedules.workingCapital.changeInWorkingCapital[i]
      ];
      worksheet.addRow(row);
    }
    }
    
    // Add formatting
    this.formatFinancialSheet(worksheet);
  }

  private async createScenariosSheet(workbook: ExcelJS.Workbook, scenarios: any[]): Promise<void> {
    const worksheet = workbook.addWorksheet('Scenarios');
    
    // Set up headers
    worksheet.addRow(['Scenario', 'NPV', 'IRR', 'Payback Period', 'Total Revenue', 'Total Net Income', 'Final Cash']);
    
    // Add scenario data
    scenarios.forEach(scenario => {
      const row = [
        scenario.name,
        scenario.results.npv,
        scenario.results.irr,
        scenario.results.paybackPeriod,
        scenario.results.keyMetrics.totalRevenue,
        scenario.results.keyMetrics.totalNetIncome,
        scenario.results.keyMetrics.finalCash
      ];
      worksheet.addRow(row);
    });
    
    // Add formatting
    this.formatFinancialSheet(worksheet);
  }

  private async createAuditSheet(workbook: ExcelJS.Workbook, model: FinancialModel): Promise<void> {
    const worksheet = workbook.addWorksheet('Audit');
    
    // Audit checks
    worksheet.addRow(['AUDIT CHECKS']);
    worksheet.addRow(['Check', 'Status', 'Message', 'Value', 'Threshold']);
    
    model.auditChecks.forEach(check => {
      const row = [
        check.name,
        check.status.toUpperCase(),
        check.message,
        check.value || 'N/A',
        check.threshold || 'N/A'
      ];
      worksheet.addRow(row);
    });
    
    // Balance sheet checks
    worksheet.addRow([]);
    worksheet.addRow(['BALANCE SHEET CHECKS']);
    worksheet.addRow(['Period', 'Assets = Liabilities + Equity', 'Difference']);
    
    for (let i = 0; i < model.balanceSheet.periods; i++) {
      const assets = model.balanceSheet.assets.totalAssets[i];
      const liabilities = model.balanceSheet.liabilities.totalLiabilities[i];
      const equity = model.balanceSheet.equity.totalEquity[i];
      const difference = assets - (liabilities + equity);
      
      const row = [i + 1, assets, liabilities + equity, difference];
      worksheet.addRow(row);
    }
    
    // Cash flow checks
    worksheet.addRow([]);
    worksheet.addRow(['CASH FLOW CHECKS']);
    worksheet.addRow(['Period', 'Net Cash Flow', 'Change in Cash', 'Difference']);
    
    for (let i = 0; i < model.cashFlowStatement.periods; i++) {
      const netCashFlow = model.cashFlowStatement.netCashFlow[i];
      const changeInCash = i === 0 ? 
        model.cashFlowStatement.endingCash[i] - 50000 : // Starting cash assumption
        model.cashFlowStatement.endingCash[i] - model.cashFlowStatement.endingCash[i - 1];
      const difference = netCashFlow - changeInCash;
      
      const row = [i + 1, netCashFlow, changeInCash, difference];
      worksheet.addRow(row);
    }
    
    // Add formatting
    this.formatFinancialSheet(worksheet);
  }

  private addNamedRanges(workbook: ExcelJS.Workbook): void {
    // Add named ranges for key metrics
    const incomeSheet = workbook.getWorksheet('Income Statement');
    if (incomeSheet) {
      workbook.defineName('Revenue', `'Income Statement'!$B$2:$B${incomeSheet.rowCount - 1}`);
      workbook.defineName('NetIncome', `'Income Statement'!$K$2:$K${incomeSheet.rowCount - 1}`);
    }
    
    const balanceSheet = workbook.getWorksheet('Balance Sheet');
    if (balanceSheet) {
      workbook.defineName('TotalAssets', `'Balance Sheet'!$G$3:$G${balanceSheet.rowCount - 1}`);
      workbook.defineName('TotalEquity', `'Balance Sheet'!$D$${balanceSheet.rowCount - 6}:$D${balanceSheet.rowCount - 1}`);
    }
  }

  private addCrossSheetFormulas(workbook: ExcelJS.Workbook): void {
    // Add cross-sheet validation formulas
    const auditSheet = workbook.getWorksheet('Audit');
    if (auditSheet) {
      // Add formula to check if assets = liabilities + equity
      auditSheet.getCell('B3').formula = '=IF(A3=B3+C3,"PASS","FAIL")';
    }
  }

  private formatFinancialSheet(worksheet: ExcelJS.Worksheet): void {
    // Format headers
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };
    
    // Format numbers as currency
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        row.eachCell((cell, colNumber) => {
          if (colNumber > 1 && typeof cell.value === 'number') {
            cell.numFmt = '$#,##0.00';
          }
        });
      }
    });
    
    // Add borders
    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });
  }

  private sumColumn(values: number[]): number {
    return values.reduce((sum, value) => sum + value, 0);
  }

  async exportToCSV(financialModel: FinancialModel, outputDir: string): Promise<string[]> {
    const csvFiles: string[] = [];
    
    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Export Income Statement
    const incomeCSV = this.generateCSV('Income Statement', [
      ['Period', 'Revenue', 'COGS', 'Gross Profit', 'Sales & Marketing', 'R&D', 'G&A', 'Operating Income', 'Interest Expense', 'Taxes', 'Net Income'],
      ...financialModel.incomeStatement.revenue.map((_, i) => [
        i + 1,
        financialModel.incomeStatement.revenue[i],
        financialModel.incomeStatement.costOfGoodsSold[i],
        financialModel.incomeStatement.grossProfit[i],
        financialModel.incomeStatement.operatingExpenses.salesAndMarketing[i],
        financialModel.incomeStatement.operatingExpenses.researchAndDevelopment[i],
        financialModel.incomeStatement.operatingExpenses.generalAndAdministrative[i],
        financialModel.incomeStatement.operatingIncome[i],
        financialModel.incomeStatement.interestExpense[i],
        financialModel.incomeStatement.taxes[i],
        financialModel.incomeStatement.netIncome[i]
      ])
    ]);
    
    const incomePath = path.join(outputDir, 'income_statement.csv');
    fs.writeFileSync(incomePath, incomeCSV);
    csvFiles.push(incomePath);
    
    // Export Balance Sheet
    const balanceCSV = this.generateCSV('Balance Sheet', [
      ['Period', 'Cash', 'Accounts Receivable', 'Inventory', 'Fixed Assets', 'Accumulated Depreciation', 'Total Assets', 'Accounts Payable', 'Debt', 'Total Liabilities', 'Common Stock', 'Retained Earnings', 'Total Equity'],
      ...financialModel.balanceSheet.assets.cash.map((_, i) => [
        i + 1,
        financialModel.balanceSheet.assets.cash[i],
        financialModel.balanceSheet.assets.accountsReceivable[i],
        financialModel.balanceSheet.assets.inventory[i],
        financialModel.balanceSheet.assets.fixedAssets[i],
        financialModel.balanceSheet.assets.accumulatedDepreciation[i],
        financialModel.balanceSheet.assets.totalAssets[i],
        financialModel.balanceSheet.liabilities.accountsPayable[i],
        financialModel.balanceSheet.liabilities.debt[i],
        financialModel.balanceSheet.liabilities.totalLiabilities[i],
        financialModel.balanceSheet.equity.commonStock[i],
        financialModel.balanceSheet.equity.retainedEarnings[i],
        financialModel.balanceSheet.equity.totalEquity[i]
      ])
    ]);
    
    const balancePath = path.join(outputDir, 'balance_sheet.csv');
    fs.writeFileSync(balancePath, balanceCSV);
    csvFiles.push(balancePath);
    
    // Export Cash Flow Statement
    const cashFlowCSV = this.generateCSV('Cash Flow Statement', [
      ['Period', 'Operating Cash Flow', 'Investing Cash Flow', 'Financing Cash Flow', 'Net Cash Flow', 'Ending Cash'],
      ...financialModel.cashFlowStatement.operatingCashFlow.map((_, i) => [
        i + 1,
        financialModel.cashFlowStatement.operatingCashFlow[i],
        financialModel.cashFlowStatement.investingCashFlow[i],
        financialModel.cashFlowStatement.financingCashFlow[i],
        financialModel.cashFlowStatement.netCashFlow[i],
        financialModel.cashFlowStatement.endingCash[i]
      ])
    ]);
    
    const cashFlowPath = path.join(outputDir, 'cash_flow_statement.csv');
    fs.writeFileSync(cashFlowPath, cashFlowCSV);
    csvFiles.push(cashFlowPath);
    
    return csvFiles;
  }

  private generateCSV(sheetName: string, data: any[][]): string {
    const csvContent = data.map(row => 
      row.map(cell => 
        typeof cell === 'string' && cell.includes(',') ? `"${cell}"` : cell
      ).join(',')
    ).join('\n');
    
    return csvContent;
  }
}
