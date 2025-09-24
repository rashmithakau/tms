import { 
  SubmissionStatusReport, 
  ApprovalStatusReport, 
  DetailedTimesheetReport 
} from './generator';
import { 
  ISubmissionStatusReport, 
  IApprovalStatusReport, 
  ITimesheetReportData 
} from '../../../interfaces';

export class PDFReportGenerator {
  private generator: SubmissionStatusReport | ApprovalStatusReport | DetailedTimesheetReport | null = null;

  generateSubmissionStatusReport(
    data: ISubmissionStatusReport[], 
    filters?: { startDate?: string; endDate?: string }
  ): void {
    this.generator = new SubmissionStatusReport();
    this.generator.generate(data, filters);
  }

  generateApprovalStatusReport(
    data: IApprovalStatusReport[], 
    filters?: { startDate?: string; endDate?: string }
  ): void {
    this.generator = new ApprovalStatusReport();
    this.generator.generate(data, filters);
  }

  generateDetailedTimesheetReport(
    data: ITimesheetReportData[], 
    filters?: { startDate?: string; endDate?: string }
  ): void {
    this.generator = new DetailedTimesheetReport();
    this.generator.generate(data, filters);
  }

  async generateBuffer(): Promise<Buffer> {
    if (!this.generator) {
      throw new Error('No report generator initialized. Call a generate method first.');
    }
    
    return await this.generator.generateBuffer();
  }
}

