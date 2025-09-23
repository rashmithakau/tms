import { BaseExcelGenerator } from '../base/BaseExcelGenerator';
import { ITimesheetReportData } from '../../../../interfaces';

export class DetailedTimesheetExcel extends BaseExcelGenerator {
  constructor() {
    super('Detailed Timesheet');
  }

  build(data: ITimesheetReportData[], _filters?: Record<string, any>) {
    this.addHeaderRow(['Employee', 'Email', 'Week Start', 'Status', 'Category', 'Work', 'Project/Team', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Total']);
    data.forEach((t) => {
      t.categories.forEach((category) => {
        category.items.forEach((item) => {
          this.addDataRow([
            t.employeeName,
            t.employeeEmail,
            typeof t.weekStartDate === 'string' ? t.weekStartDate : new Date(t.weekStartDate).toISOString().slice(0, 10),
            t.status,
            category.category,
            item.work,
            item.projectName || item.teamName || 'N/A',
            item.dailyHours[0] ?? '0',
            item.dailyHours[1] ?? '0',
            item.dailyHours[2] ?? '0',
            item.dailyHours[3] ?? '0',
            item.dailyHours[4] ?? '0',
            item.dailyHours[5] ?? '0',
            item.dailyHours[6] ?? '0',
            item.totalHours,
          ]);
        });
      });
    });
  }
}




