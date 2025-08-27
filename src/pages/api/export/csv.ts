import { NextApiRequest, NextApiResponse } from 'next';
import { ExcelExporter } from '@/lib/excel-exporter';
import { TemplateEngine } from '@/lib/template-engine';
import { ApiResponse } from '@/types';
import path from 'path';
import fs from 'fs';

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
    const { businessType, inputs } = req.body;

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

    // Export to CSV
    const excelExporter = ExcelExporter.getInstance();
    const outputDir = path.join(process.cwd(), 'exports', financialModel.id);
    const csvFiles = await excelExporter.exportToCSV(financialModel, outputDir);

    // Create a zip file containing all CSV files
    const archiver = require('archiver');
    const zipPath = path.join(outputDir, 'financial_model_csv.zip');
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
      // Read the zip file and send it
      const zipBuffer = fs.readFileSync(zipPath);
      
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="financial_model_${financialModel.id}_csv.zip"`);
      res.setHeader('Content-Length', zipBuffer.length);
      
      res.send(zipBuffer);
      
      // Clean up temporary files
      csvFiles.forEach(file => fs.unlinkSync(file));
      fs.unlinkSync(zipPath);
      fs.rmdirSync(outputDir);
    });

    archive.on('error', (err: any) => {
      throw err;
    });

    archive.pipe(output);

    // Add CSV files to the zip
    csvFiles.forEach(file => {
      const fileName = path.basename(file);
      archive.file(file, { name: fileName });
    });

    archive.finalize();
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to export to CSV'
    });
  }
}
