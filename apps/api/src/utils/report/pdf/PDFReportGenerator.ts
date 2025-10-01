import { 
  ProfessionalApprovalStatusReport, 
  ProfessionalDetailedTimesheetReport, 
  ProfessionalSubmissionStatusReport 
  
} from './generator';
import { 
  ISubmissionStatusReport, 
  IApprovalStatusReport, 
  IDetailedTimesheetReport 
} from '../../../interfaces';

export class PDFReportGenerator {
  private generator: ProfessionalSubmissionStatusReport | ProfessionalApprovalStatusReport | ProfessionalDetailedTimesheetReport | null = null;

  generateSubmissionStatusReport(
    data: ISubmissionStatusReport[], 
    filters?: { startDate?: string; endDate?: string }
  ): void {
    this.generator = new ProfessionalSubmissionStatusReport();
    this.generator.generate(data, filters);
  }

  generateApprovalStatusReport(
    data: IApprovalStatusReport[], 
    filters?: { startDate?: string; endDate?: string }
  ): void {
    this.generator = new ProfessionalApprovalStatusReport();
    this.generator.generate(data, filters);
  }

  generateDetailedTimesheetReport(
    data: IDetailedTimesheetReport[], 
    filters?: { startDate?: string; endDate?: string }
  ): void {
    this.generator = new ProfessionalDetailedTimesheetReport();
    this.generator.generate(data, filters);
  }

  async generateBuffer(): Promise<Buffer> {
    if (!this.generator) {
      throw new Error('No report generator initialized. Call a generate method first.');
    }
    
    return await this.generator.generateBuffer();
  }
}

