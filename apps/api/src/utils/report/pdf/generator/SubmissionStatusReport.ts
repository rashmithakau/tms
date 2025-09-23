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
    const headers = ['Employee Name', 'Email', 'Week Start', 'Status'];
    const columnWidths = [100, 120, 70, 70];
    
    this.components.addTableHeader(headers, columnWidths);
    
    // Table data
    data.forEach((item, index) => {
      const rowData = [
        item.employeeName,
        item.employeeEmail,
        this.formatDate(item.weekStartDate),
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