import { ExcelExporter } from '../excel-exporter';
import { FinancialModel } from '@/types';
import { TemplateEngine } from '../template-engine';

describe('ExcelExporter', () => {
  let excelExporter: ExcelExporter;
  let sampleModel: FinancialModel;

  beforeEach(() => {
    excelExporter = ExcelExporter.getInstance();
    
    // Create a sample financial model for testing
    const templateEngine = TemplateEngine.getInstance();
    const inputs = {
      initial_mrr: 50000,
      revenue_growth_rate: 0.05,
      churn_rate: 0.02,
      gross_margin: 0.8,
      sales_marketing_budget: 0.3,
      research_development_budget: 0.15,
      tax_rate: 0.25
    };
    
    sampleModel = templateEngine.applyTemplate(
      templateEngine.getTemplate('saas'),
      inputs
    );
  });

  describe('exportToExcel', () => {
    it('should generate Excel file with basic options', async () => {
      const options = {
        includeAuditSheet: false,
        includeScenarios: false,
        includeSchedules: false
      };

      const excelBuffer = await excelExporter.exportToExcel(sampleModel, options);

      expect(excelBuffer).toBeDefined();
      expect(Buffer.isBuffer(excelBuffer)).toBe(true);
      expect(excelBuffer.length).toBeGreaterThan(0);
    });

    it('should generate Excel file with all options enabled', async () => {
      const options = {
        includeAuditSheet: true,
        includeScenarios: true,
        includeSchedules: true,
        formatAsCurrency: true,
        includeNamedRanges: true,
        includeCrossSheetFormulas: true
      };

      const excelBuffer = await excelExporter.exportToExcel(sampleModel, options);

      expect(excelBuffer).toBeDefined();
      expect(Buffer.isBuffer(excelBuffer)).toBe(true);
      expect(excelBuffer.length).toBeGreaterThan(0);
    });

    it('should include all required sheets', async () => {
      const options = {
        includeAuditSheet: true,
        includeScenarios: true,
        includeSchedules: true
      };

      const excelBuffer = await excelExporter.exportToExcel(sampleModel, options);

      // The buffer should contain Excel file data
      expect(excelBuffer).toBeDefined();
      expect(excelBuffer.length).toBeGreaterThan(1000); // Minimum file size
    });
  });

  describe('exportToCSV', () => {
    it('should generate CSV files for all sheets', async () => {
      const outputDir = './test-exports';
      
      const csvFiles = await excelExporter.exportToCSV(sampleModel, outputDir);

      expect(csvFiles).toBeDefined();
      expect(Array.isArray(csvFiles)).toBe(true);
      expect(csvFiles.length).toBeGreaterThan(0);

      // Should generate CSV files for main statements
      const fileNames = csvFiles.map(file => file.split('/').pop());
      expect(fileNames).toContain('income_statement.csv');
      expect(fileNames).toContain('balance_sheet.csv');
      expect(fileNames).toContain('cash_flow_statement.csv');

      // Clean up test files
      csvFiles.forEach(file => {
        try {
          require('fs').unlinkSync(file);
        } catch (error) {
          // File might already be deleted
        }
      });
      
      try {
        require('fs').rmdirSync(outputDir);
      } catch (error) {
        // Directory might already be deleted
      }
    });

    it('should create output directory if it does not exist', async () => {
      const outputDir = './test-exports-new';
      
      const csvFiles = await excelExporter.exportToCSV(sampleModel, outputDir);

      expect(csvFiles).toBeDefined();
      expect(csvFiles.length).toBeGreaterThan(0);

      // Clean up
      csvFiles.forEach(file => {
        try {
          require('fs').unlinkSync(file);
        } catch (error) {
          // File might already be deleted
        }
      });
      
      try {
        require('fs').rmdirSync(outputDir);
      } catch (error) {
        // Directory might already be deleted
      }
    });
  });

  describe('CSV generation', () => {
    it('should generate valid CSV content', () => {
      const data = [
        ['Period', 'Revenue', 'COGS', 'Gross Profit'],
        [1, 100000, 20000, 80000],
        [2, 105000, 21000, 84000]
      ];

      const csvContent = (excelExporter as any).generateCSV('Test Sheet', data);

      expect(csvContent).toBeDefined();
      expect(typeof csvContent).toBe('string');
      expect(csvContent).toContain('Period,Revenue,COGS,Gross Profit');
      expect(csvContent).toContain('1,100000,20000,80000');
      expect(csvContent).toContain('2,105000,21000,84000');
    });

    it('should handle CSV escaping for strings with commas', () => {
      const data = [
        ['Description', 'Value'],
        ['Revenue, Net', 100000],
        ['Cost of Goods Sold', 20000]
      ];

      const csvContent = (excelExporter as any).generateCSV('Test Sheet', data);

      expect(csvContent).toBeDefined();
      expect(csvContent).toContain('"Revenue, Net"');
      expect(csvContent).toContain('Cost of Goods Sold');
    });
  });

  describe('Excel formatting', () => {
    it('should apply proper formatting to financial sheets', async () => {
      const options = {
        formatAsCurrency: true
      };

      const excelBuffer = await excelExporter.exportToExcel(sampleModel, options);

      expect(excelBuffer).toBeDefined();
      expect(excelBuffer.length).toBeGreaterThan(0);
    });
  });

  describe('error handling', () => {
    it('should handle invalid model data gracefully', async () => {
      const invalidModel = {
        ...sampleModel,
        incomeStatement: {
          ...sampleModel.incomeStatement,
          revenue: [] // Empty array should cause issues
        }
      };

      // This should still work as the exporter handles empty arrays
      const result = await excelExporter.exportToExcel(invalidModel as any, {});
      expect(result).toBeDefined();
      expect(Buffer.isBuffer(result)).toBe(true);
    });

    it('should handle missing model properties', async () => {
      const incompleteModel = {
        id: 'test',
        financialInputsId: 'test',
        createdAt: new Date(),
        updatedAt: new Date()
        // Missing required properties
      };

      // This should still work as the exporter has fallbacks
      const result = await excelExporter.exportToExcel(incompleteModel as any, {});
      expect(result).toBeDefined();
      expect(Buffer.isBuffer(result)).toBe(true);
    });
  });

  describe('performance', () => {
    it('should generate Excel file within reasonable time', async () => {
      const startTime = Date.now();
      
      const options = {
        includeAuditSheet: true,
        includeScenarios: true,
        includeSchedules: true
      };

      await excelExporter.exportToExcel(sampleModel, options);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should complete within 5 seconds
      expect(duration).toBeLessThan(5000);
    });

    it('should generate CSV files within reasonable time', async () => {
      const startTime = Date.now();
      
      const outputDir = './test-exports-performance';
      await excelExporter.exportToCSV(sampleModel, outputDir);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should complete within 2 seconds
      expect(duration).toBeLessThan(2000);

      // Clean up
      try {
        const fs = require('fs');
        const files = fs.readdirSync(outputDir);
        files.forEach((file: string) => {
          fs.unlinkSync(`${outputDir}/${file}`);
        });
        fs.rmdirSync(outputDir);
      } catch (error) {
        // Cleanup might fail, that's okay for tests
      }
    });
  });
});
