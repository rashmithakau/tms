import { BaseExcelGenerator } from '../base/BaseExcelGenerator';
import { IApprovalStatusReport } from '../../../../interfaces';

export class ApprovalStatusExcel extends BaseExcelGenerator {
  constructor() {
    super('Approval Status');
  }

  build(data: IApprovalStatusReport[], _filters?: Record<string, any>) {
    this.addHeaderRow(['Employee Name', 'Week Start', 'Submission Date', 'Status']);
    data.forEach((item) => {
      this.addDataRow([
        item.employeeName,
        typeof item.weekStartDate === 'string' ? item.weekStartDate : new Date(item.weekStartDate).toISOString().slice(0, 10),
        item.submissionDate ? (typeof item.submissionDate === 'string' ? item.submissionDate : new Date(item.submissionDate).toISOString().slice(0, 10)) : 'N/A',
        item.approvalStatus
      ]);
    });
  }
}


