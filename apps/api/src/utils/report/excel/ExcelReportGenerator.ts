import { 
  SubmissionStatusExcel, 
  ApprovalStatusExcel, 
  DetailedTimesheetExcel 
} from './generator';
import { 
  ISubmissionStatusReport, 
  IApprovalStatusReport, 
  ITimesheetReportData 
} from '../../../interfaces';

export class ExcelReportGenerator {
  private generator: SubmissionStatusExcel | ApprovalStatusExcel | DetailedTimesheetExcel | null = null;

  generateSubmissionStatusReport(
    data: ISubmissionStatusReport[], 
    filters?: { startDate?: string; endDate?: string }
  ): void {
    this.generator = new SubmissionStatusExcel();
    this.generator.build(data, filters);
  }

  generateApprovalStatusReport(
    data: IApprovalStatusReport[], 
    filters?: { startDate?: string; endDate?: string }
  ): void {
    this.generator = new ApprovalStatusExcel();
    this.generator.build(data, filters);
  }

  generateDetailedTimesheetReport(
    data: ITimesheetReportData[], 
    filters?: { startDate?: string; endDate?: string }
  ): void {
    this.generator = new DetailedTimesheetExcel();
    this.generator.build(data, filters);
  }

  async generateBuffer(): Promise<Buffer> {
    if (!this.generator) {
      throw new Error('No report generator initialized. Call a generate method first.');
    }
    
    
    const workbook = (this.generator as any).workbook;
    if (workbook && workbook.xlsx && workbook.xlsx.writeBuffer) {
      return await workbook.xlsx.writeBuffer();
    }
    
    throw new Error('Unable to generate buffer from Excel generator');
  }
}

