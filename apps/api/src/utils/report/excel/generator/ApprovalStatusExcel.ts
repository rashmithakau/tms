import { BaseExcelGenerator } from '../base/BaseExcelGenerator';
import { IApprovalStatusReport } from '../../../../interfaces';

export class ApprovalStatusExcel extends BaseExcelGenerator {
  constructor() {
    super('Approval Status');
  }

  build(data: IApprovalStatusReport[], _filters?: Record<string, any>) {
    this.addHeaderRow(['Employee Name', 'Week Start', 'Week End', 'Status']);
    data.forEach((item) => {
      // Calculate week end (assuming weekStartDate is a Date or string)
      const startDate = new Date(item.weekStartDate);
      const weekEndDate = new Date(startDate);
      weekEndDate.setDate(startDate.getDate() + 6);
      this.addDataRow([
        item.employeeName,
        typeof item.weekStartDate === 'string' ? item.weekStartDate : new Date(item.weekStartDate).toISOString().slice(0, 10),
        weekEndDate.toISOString().slice(0, 10),
        item.approvalStatus
      ]);
    });
  }
}


