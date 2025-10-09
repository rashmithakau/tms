import { ProfessionalBasePDFGenerator } from '../base/ProfessionalBasePDFGenerator';
import { ProfessionalPDFComponents } from '../component/ProfessionalPDFComponents';
import { ISubmissionStatusReport } from '../../../../interfaces';
import PDFDocument from 'pdfkit';

export class ProfessionalSubmissionStatusReport extends ProfessionalBasePDFGenerator {
  private components: ProfessionalPDFComponents;

  constructor() {
    super();
    this.components = new ProfessionalPDFComponents(
      this.doc,
      this.margin,
      () => this.currentY,
      (y) => (this.currentY = y),
      (space) => this.checkPageBreak(space),
      this.pageWidth
    );
  }

  generate(
    data: ISubmissionStatusReport[],
    filters: { startDate?: string; endDate?: string }
  ): PDFDocument {
    // Header with period info
    this.components.addProfessionalHeader(
      'Timesheet Submission Status Report',
      filters,
      'Comprehensive analysis of employee timesheet submission compliance'
    );

    // Add main data table
    this.addMainDataTable(data);

    // Add detailed analytics
    this.addAnalyticsSection(data);

    return this.doc;
  }

  private addCustomHeader(): void {
    // Header background
    this.doc.rect(0, 0, this.pageWidth, 120).fill(this.colors.primary);

    // Report title
    this.doc
      .fontSize(22)
      .fillColor('white')
      .font('Helvetica-Bold')
      .text('Timesheet Submission Status Report', 0, 35, {
        align: 'center',
        width: this.pageWidth,
      });

    // Subtitle
    this.doc
      .fontSize(12)
      .fillColor('#E2E8F0')
      .font('Helvetica')
      .text(
        'Comprehensive analysis of employee timesheet submission compliance',
        0,
        65,
        {
          align: 'center',
          width: this.pageWidth,
        }
      );

    this.currentY = 140;
  }

  private addMainDataTable(data: ISubmissionStatusReport[]): void {
    this.components.addSectionDivider('Submission Status Details');

    if (data.length === 0) {
      this.doc
        .fontSize(12)
        .fillColor(this.colors.text.secondary)
        .font('Helvetica')
        .text(
          'No data available for the selected period.',
          this.margin,
          this.currentY
        );

      this.currentY += 40;
      return;
    }

    const headers = ['Employee', 'Email', 'Week Start', 'Week End', 'Status'];
    const columnWidths = [150, 130, 80, 80, 80];

    const tableData = data
      .slice()
      .sort((a, b) => new Date(a.weekStartDate).getTime() - new Date(b.weekStartDate).getTime())
      .map((item) => {
      const startDate = new Date(item.weekStartDate);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);

      return [
        item.employeeName,
        item.employeeEmail,
        `${this.formatDate(item.weekStartDate)}`,
        `${this.formatDate(endDate)}`,
        item.submissionStatus,
      ];
    });

    this.components.addProfessionalTable(headers, tableData, columnWidths, {
      alternateRows: true,
      fontSize: 9,
    });
  }

  private addAnalyticsSection(data: ISubmissionStatusReport[]): void {
    this.components.addSectionDivider('Analytics & Insights');

    // Calculate statistics
    const stats = this.calculateStatistics(data);

    // Summary cards
    const summaryData = [
      {
        label: 'Total Employees',
        value: stats.totalEmployees,
        type: 'info' as const,
      },
      {
        label: 'Total Records',
        value: stats.totalRecords,
        type: 'info' as const,
      },
      {
        label: 'On-Time Submissions',
        value: stats.submittedCount,
        type: 'success' as const,
      },
    ];

    // Add summary cards with proper spacing
    this.addSummaryCards(summaryData);

    // Add compliance breakdown
    this.addComplianceBreakdown(stats);
  }

  private addSummaryCards(
    summaryData: {
      label: string;
      value: number | string;
      type: 'success' | 'warning' | 'danger' | 'info';
    }[]
  ): void {
    this.checkPageBreak(150);

    // Add title
    this.doc
      .fontSize(14)
      .fillColor(this.colors.text.primary)
      .font('Helvetica-Bold')
      .text('Key Metrics', this.margin, this.currentY);

    this.currentY += 25;

    // Create a metrics table format
    const tableWidth = this.pageWidth - this.margin * 2;
    const rowHeight = 25;

    // Table header
    this.doc
      .rect(this.margin, this.currentY, tableWidth, 30)
      .fill(this.colors.primary);

    this.doc
      .fontSize(11)
      .fillColor('white')
      .font('Helvetica-Bold')
      .text('Metric', this.margin + 10, this.currentY + 10)
      .text('Value', this.margin + tableWidth - 100, this.currentY + 10);

    this.currentY += 35;

    // Add metrics rows
    summaryData.forEach((item, index) => {
      const rowY = this.currentY;
      const bgColor = index % 2 === 0 ? '#F8FAFC' : 'white';

      // Row background
      this.doc
        .rect(this.margin, rowY, tableWidth, rowHeight)
        .fill(bgColor)
        .stroke(this.colors.border);

      // Status indicator 
      const indicatorColor = this.getSummaryColor(item.type);
      this.doc.circle(this.margin + 15, rowY + 12, 4).fill(indicatorColor);

      // Metric label
      this.doc
        .fontSize(10)
        .fillColor(this.colors.text.primary)
        .font('Helvetica')
        .text(item.label, this.margin + 30, rowY + 8);

      // Metric value
      this.doc
        .fontSize(12)
        .fillColor(this.colors.text.primary)
        .font('Helvetica-Bold')
        .text(String(item.value), this.margin + tableWidth - 90, rowY + 8, {
          align: 'left',
          width: 80,
        });

      this.currentY += rowHeight;
    });

    this.currentY += 15;
  }

  private getSummaryColor(type: string): string {
    switch (type) {
      case 'success':
        return this.colors.accent;
      case 'warning':
        return this.colors.warning;
      case 'danger':
        return this.colors.danger;
      case 'info':
        return this.colors.primary;
      default:
        return this.colors.secondary;
    }
  }

  private addComplianceBreakdown(stats: any): void {
    this.currentY += 20;
  }

  private calculateStatistics(data: ISubmissionStatusReport[]) {
    // Get unique employees for proper counting
    const uniqueEmployees = new Set(data.map((item) => item.employeeEmail))
      .size;
    const totalRecords = data.length;
    const submittedCount = data.filter(
      (d) => d.submissionStatus === 'Submitted'
    ).length;
    const lateCount = data.filter((d) => d.submissionStatus === 'Late').length;
    const missingCount = data.filter(
      (d) => d.submissionStatus === 'Missing'
    ).length;

    // Calculate compliance rate
    const complianceRate =
      totalRecords > 0 ? Math.round((submittedCount / totalRecords) * 100) : 0;

    const totalDaysLate = data.reduce(
      (sum, item) => sum + (item.daysLate || 0),
      0
    );
    const avgDaysLate =
      lateCount > 0 ? (totalDaysLate / lateCount).toFixed(1) : '0';

    return {
      totalEmployees: uniqueEmployees,
      totalRecords: totalRecords,
      submittedCount,
      lateCount,
      missingCount,
      complianceRate,
      avgDaysLate,
    };
  }
}
