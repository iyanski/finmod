import { NextApiRequest, NextApiResponse } from 'next';
import { ExcelExporter } from '@/lib/excel-exporter';
import { TemplateEngine } from '@/lib/template-engine';
import { ApiResponse } from '@/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    const { businessType, inputs, options = {} } = req.body;

    if (!businessType || !inputs) {
      return res.status(400).json({
        success: false,
        error: 'Business type and inputs are required'
      });
    }

    // Generate the financial model
    const templateEngine = TemplateEngine.getInstance();
    const template = templateEngine.getTemplate(businessType);
    const financialModel = templateEngine.applyTemplate(template, inputs);

    // Export to Excel
    const excelExporter = ExcelExporter.getInstance();
    const excelBuffer = await excelExporter.exportToExcel(financialModel, {
      includeAuditSheet: true,
      includeScenarios: true,
      includeSchedules: true,
      formatAsCurrency: true,
      includeNamedRanges: true,
      includeCrossSheetFormulas: true,
      ...options
    });

    // Set response headers for file download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="financial_model_${financialModel.id}.xlsx"`);
    res.setHeader('Content-Length', excelBuffer.length);

    // Send the Excel file
    res.send(excelBuffer);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to export to Excel'
    });
  }
}
