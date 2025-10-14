import { 
  ApprovalStatusPdf, 
  DetailedTimesheetPdf, 
  SubmissionStatusPdf 
  
} from './generator';
import { 
  ISubmissionStatusReport, 
  IApprovalStatusReport, 
  IDetailedTimesheetReport 
} from '../../../interfaces';

export class PDFReportGenerator {
  private generator: SubmissionStatusPdf | ApprovalStatusPdf | DetailedTimesheetPdf | null = null;

  generateSubmissionStatusReport(
    data: ISubmissionStatusReport[], 
    filters?: { startDate?: string; endDate?: string }
  ): void {
    this.generator = new SubmissionStatusPdf();
    this.generator.generate(data, filters);
  }

  generateApprovalStatusReport(
    data: IApprovalStatusReport[], 
    filters?: { startDate?: string; endDate?: string }
  ): void {
    this.generator = new ApprovalStatusPdf();
    this.generator.generate(data, filters);
  }

  generateDetailedTimesheetReport(
    data: IDetailedTimesheetReport[], 
    filters?: { startDate?: string; endDate?: string }
  ): void {
    this.generator = new DetailedTimesheetPdf();
    this.generator.generate(data, filters);
  }

  async generateBuffer(): Promise<Buffer> {
    if (!this.generator) {
      throw new Error('No report generator initialized. Call a generate method first.');
    }
    
    return await this.generator.generateBuffer();
  }
}

