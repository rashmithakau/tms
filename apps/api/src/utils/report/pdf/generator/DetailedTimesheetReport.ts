import { BasePDFGenerator } from '../base/BasePDFGenerator';
import { PDFComponents } from '../component/PDFComponents';
import { ITimesheetReportData } from '../../../../interfaces';
import PDFDocument from 'pdfkit';

export class DetailedTimesheetReport extends BasePDFGenerator {
  private components: PDFComponents;

  constructor() {
    super();
    this.components = new PDFComponents(
      this.doc,
      this.margin,
      () => this.currentY,
      (y) => this.currentY = y,
      (space) => this.checkPageBreak(space)
    );
  }

  generate(
    data: ITimesheetReportData[],
    filters: { startDate?: string; endDate?: string }
  ):PDFDocument {
    this.components.addReportHeader('Detailed Timesheet Report', filters);

    data.forEach((timesheet, timesheetIndex) => {
      if (timesheetIndex > 0) {
        this.checkPageBreak(100);
        this.currentY += 20;
      }

      this.addEmployeeHeader(timesheet);
      this.addTimesheetDetails(timesheet);
    });

    return this.doc;
  }

  private addEmployeeHeader(timesheet: ITimesheetReportData): void {
    this.doc.fontSize(14)
      .fillColor('blue')
      .text(`Employee: ${timesheet.employeeName} (${timesheet.employeeEmail})`, this.margin, this.currentY);
    
    this.currentY += 20;
    
    this.doc.fontSize(10)
      .fillColor('black')
      .text(`Week: ${this.formatDate(timesheet.weekStartDate)}`, this.margin, this.currentY)
      .text(`Status: ${timesheet.status}`, this.margin + 200, this.currentY)
      .text(`Total Hours: ${timesheet.totalHours}`, this.margin + 350, this.currentY);
    
    this.currentY += 30;
  }

  private addTimesheetDetails(timesheet: ITimesheetReportData): void {
    timesheet.categories.forEach((category) => {
      // Category header
      this.doc.fontSize(12)
        .fillColor('darkblue')
        .text(`Category: ${category.category}`, this.margin, this.currentY);
      this.currentY += 20;

      // Items table
      const headers = ['Work', 'Project/Team', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Total'];
      const columnWidths = [150, 100, 35, 35, 35, 35, 35, 35, 35, 45];
      
      this.components.addTableHeader(headers, columnWidths);

      category.items.forEach((item, index) => {
        const rowData = [
          item.work,
          item.projectName || item.teamName || 'N/A',
          String(item.dailyHours[0] ?? '0'),
          String(item.dailyHours[1] ?? '0'),
          String(item.dailyHours[2] ?? '0'),
          String(item.dailyHours[3] ?? '0'),
          String(item.dailyHours[4] ?? '0'),
          String(item.dailyHours[5] ?? '0'),
          String(item.dailyHours[6] ?? '0'),
          item.totalHours.toString()
        ];
        
        this.components.addTableRow(rowData as string[], columnWidths, index % 2 === 0);
      });

      this.currentY += 15;
    });
  }
}