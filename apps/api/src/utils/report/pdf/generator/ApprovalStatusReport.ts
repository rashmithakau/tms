import PDFDocument from 'pdfkit';
import { BasePDFGenerator } from '../base/BasePDFGenerator';
import { PDFComponents } from '../component/PDFComponents';
import { IApprovalStatusReport } from '../../../../interfaces';
import { TimesheetStatus } from '@tms/shared';

export class ApprovalStatusReport extends BasePDFGenerator {
   private components: PDFComponents;

    constructor(){
        super();
        this.components = new PDFComponents(
            this.doc,
            this.margin,
            ()=>this.currentY,
            (y)=>this.currentY=y,
            (space)=>this.checkPageBreak(space)
        );
    }
  generate(
    data: IApprovalStatusReport[],
    filters: { startDate?: string; endDate?: string }
  ): PDFDocument {
    this.components.addReportHeader('Timesheet Approval Status Report', filters);
    
    // Table headers
    const headers = ['Employee Name', 'Week Start', 'Submission Date', 'Status'];
    const columnWidths = [120, 80, 80, 80];
    
    this.components.addTableHeader(headers, columnWidths);
    
    // Table data
    data.forEach((item, index) => {
      const rowData = [
        item.employeeName,
        this.formatDate(item.weekStartDate),
        this.formatDate(item.submissionDate),
        item.approvalStatus
      ];
      
      this.components.addTableRow(rowData, columnWidths, index % 2 === 0);
    });

    // Add summary
    this.currentY += 30;
    this.components.addSummarySection([
      { label: 'Total Timesheets', value: data.length },
      { label: 'Approved', value: data.filter(d => d.approvalStatus === TimesheetStatus.Approved).length },
      { label: 'Rejected', value: data.filter(d => d.approvalStatus === TimesheetStatus.Rejected).length },
      { label: 'Pending', value: data.filter(d => d.approvalStatus === TimesheetStatus.Pending).length }
    ]);

    return this.doc;
  }
}