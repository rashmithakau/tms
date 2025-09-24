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
      let grandTotal = 0;
      timesheet.categories.forEach((category) => {
        // Category header
        this.doc.fontSize(12)
          .fillColor('darkblue')
          .text(`Category: ${category.category}`, this.margin, this.currentY);
        this.currentY += 20;

        // Items table
        const headers = ['Work', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Total'];
        const columnWidths = [200, 55, 55, 55, 55, 55, 55, 55, 70];
        this.components.addTableHeader(headers, columnWidths);

        let categoryTotal = 0;
        category.items.forEach((item, index) => {
          const dailyHoursArr = Array.isArray(item.dailyHours) ? item.dailyHours : [0,0,0,0,0,0,0];
          const totalHours = dailyHoursArr.reduce((sum: number, h) => {
            const num = typeof h === 'number' ? h : Number(h);
            return Number(sum) + (isNaN(num) ? 0 : num);
          }, 0);
          categoryTotal += Number(totalHours);
          grandTotal += Number(totalHours);
          const rowData = [
            item.work,
            String(dailyHoursArr[0] ?? '0'),
            String(dailyHoursArr[1] ?? '0'),
            String(dailyHoursArr[2] ?? '0'),
            String(dailyHoursArr[3] ?? '0'),
            String(dailyHoursArr[4] ?? '0'),
            String(dailyHoursArr[5] ?? '0'),
            String(dailyHoursArr[6] ?? '0'),
            (Number(totalHours)).toFixed(2)
          ];
          this.components.addTableRow(rowData as string[], columnWidths, index % 2 === 0);
        });

        // Category total row
        this.doc.font('Helvetica-Bold').fontSize(10).fillColor('black');
        this.components.addTableRow([
          'Category Total', '', '', '', '', '', '', '', categoryTotal.toFixed(2)
        ], columnWidths, false);
        this.doc.font('Helvetica').fontSize(9);
        this.currentY += 10;
      });

      // Grand total section for employee
      this.doc.moveDown(1);
      this.doc.font('Helvetica-Bold').fontSize(12).fillColor('green')
        .text(`Grand Total Hours: ${grandTotal.toFixed(2)}`, this.margin, this.currentY);
      this.doc.font('Helvetica').fontSize(9).fillColor('black');
      this.currentY += 25;
      // Add a horizontal line for separation
      this.doc.moveTo(this.margin, this.currentY).lineTo(this.pageWidth - this.margin, this.currentY).stroke('#CCCCCC');
      this.currentY += 15;
  }
}