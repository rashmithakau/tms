import { BaseExcelGenerator } from '../base/BaseExcelGenerator';
import { ITimesheetReportData } from '../../../../interfaces';

export class DetailedTimesheetExcel extends BaseExcelGenerator {
  constructor() {
    super('Detailed Timesheet');
  }

  build(data: ITimesheetReportData[], _filters?: Record<string, any>) {
  this.addHeaderRow(['Employee', 'Email', 'Week Start', 'Status', 'Category', 'Work', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Total']);
    data.forEach((t) => {
      t.categories.forEach((category) => {
        category.items.forEach((item) => {
          // Defensive: Ensure dailyHours is an array of numbers
          const dailyHoursArr = Array.isArray(item.dailyHours) ? item.dailyHours : [0,0,0,0,0,0,0];
          const totalHours = dailyHoursArr.reduce((sum: number, h) => {
            const num = typeof h === 'number' ? h : Number(h);
            return Number(sum) + (isNaN(num) ? 0 : num);
          }, 0);
          this.addDataRow([
            t.employeeName,
            t.employeeEmail,
            typeof t.weekStartDate === 'string' ? t.weekStartDate : new Date(t.weekStartDate).toISOString().slice(0, 10),
            t.status,
            category.category,
            item.work,
            dailyHoursArr[0] ?? '0',
            dailyHoursArr[1] ?? '0',
            dailyHoursArr[2] ?? '0',
            dailyHoursArr[3] ?? '0',
            dailyHoursArr[4] ?? '0',
            dailyHoursArr[5] ?? '0',
            dailyHoursArr[6] ?? '0',
            (Number(totalHours)).toFixed(2),
          ]);
        });
      });
    });
  }
}




