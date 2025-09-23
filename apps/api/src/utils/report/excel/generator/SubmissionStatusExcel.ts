import { BaseExcelGenerator } from '../base/BaseExcelGenerator';
import { ISubmissionStatusReport } from '../../../../interfaces';

export class SubmissionStatusExcel extends BaseExcelGenerator {
  constructor() {
    super('Submission Status');
  }

  build(data: ISubmissionStatusReport[], _filters?: Record<string, any>) {
    this.addHeaderRow(['Employee Name', 'Email', 'Week Start', 'Status']);
    data.forEach((item) => {
      this.addDataRow([
        item.employeeName,
        item.employeeEmail,
        typeof item.weekStartDate === 'string' ? item.weekStartDate : new Date(item.weekStartDate).toISOString().slice(0, 10),
        item.submissionStatus
      ]);
    });
  }
}


