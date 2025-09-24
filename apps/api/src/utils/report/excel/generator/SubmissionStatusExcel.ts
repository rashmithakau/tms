import { BaseExcelGenerator } from '../base/BaseExcelGenerator';
import { ISubmissionStatusReport } from '../../../../interfaces';

export class SubmissionStatusExcel extends BaseExcelGenerator {
  constructor() {
    super('Submission Status');
  }

  build(data: ISubmissionStatusReport[], _filters?: Record<string, any>) {
    this.addHeaderRow(['Employee Name', 'Email', 'Week Start', 'Week End', 'Status']);
    data.forEach((item) => {
      // Calculate week end (assuming weekStartDate is a Date or string)
      const startDate = new Date(item.weekStartDate);
      const weekEndDate = new Date(startDate);
      weekEndDate.setDate(startDate.getDate() + 6);
      this.addDataRow([
        item.employeeName,
        item.employeeEmail,
        typeof item.weekStartDate === 'string' ? item.weekStartDate : new Date(item.weekStartDate).toISOString().slice(0, 10),
        weekEndDate.toISOString().slice(0, 10),
        item.submissionStatus
      ]);
    });
  }
}


