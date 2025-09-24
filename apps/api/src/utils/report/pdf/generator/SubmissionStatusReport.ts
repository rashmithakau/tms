import { BasePDFGenerator } from '../base/BasePDFGenerator';
import { PDFComponents } from '../component/PDFComponents';
import { ISubmissionStatusReport } from '../../../../interfaces';
import PDFDocument from 'pdfkit';

export class SubmissionStatusReport extends BasePDFGenerator {
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
    data: ISubmissionStatusReport[],
    filters: { startDate?: string; endDate?: string }
  ): PDFDocument {
    this.components.addReportHeader('Timesheet Submission Status Report', filters);
    
  // Table headers
  const headers = ['Employee Name', 'Email', 'Week Start', 'Week End', 'Status'];
  // Adjusted column widths for better alignment
  const columnWidths = [140, 180, 80, 80, 80];

  this.components.addTableHeader(headers, columnWidths);

  // Table data
  data.forEach((item, index) => {
    // Calculate week end (assuming weekStartDate is a Date or string)
    const startDate = new Date(item.weekStartDate);
    const weekEndDate = new Date(startDate);
    weekEndDate.setDate(startDate.getDate() + 6);
    const rowData = [
      item.employeeName,
      item.employeeEmail,
      this.formatDate(item.weekStartDate),
      this.formatDate(weekEndDate),
      item.submissionStatus
    ];
    this.components.addTableRow(rowData, columnWidths, index % 2 === 0);
  });

    // Add summary
    this.currentY += 30;
    this.components.addSummarySection([
      { label: 'Total Employees', value: data.length },
      { label: 'Submitted On Time', value: data.filter(d => d.submissionStatus === 'Submitted').length },
      { label: 'Late Submissions', value: data.filter(d => d.submissionStatus === 'Late').length },
      { label: 'Missing Submissions', value: data.filter(d => d.submissionStatus === 'Missing').length }
    ]);

    return this.doc;
  }
}