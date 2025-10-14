import { BaseExcelGenerator } from '../base/BaseExcelGenerator';
import { IApprovalStatusReport } from '../../../../interfaces';

export class ApprovalStatusExcel extends BaseExcelGenerator {
  constructor() {
    super('Approval Status');
  }

  build(data: IApprovalStatusReport[], _filters?: Record<string, any>) {
    const totalColumns = 5;

    const titleRow = this.worksheet.addRow(['Timesheet Approval Status Report']);
    this.worksheet.mergeCells(1, 1, 1, totalColumns);
    titleRow.font = { bold: true, size: 14 };
    titleRow.alignment = { horizontal: 'center' };
    titleRow.height = 17;

    const subtitleRow = this.worksheet.addRow([
      'Comprehensive analysis of timesheet approval workflow and status tracking'
    ]);
    this.worksheet.mergeCells(2, 1, 2, totalColumns);
    subtitleRow.font = { size: 9 };
    subtitleRow.alignment = { horizontal: 'center' };
    subtitleRow.height = 14;

    const start = _filters?.startDate ? new Date(_filters.startDate) : undefined;
    const end = _filters?.endDate ? new Date(_filters.endDate) : undefined;
    const startStr = start ? start.toISOString().slice(0, 10) : undefined;
    const endStr = end ? end.toISOString().slice(0, 10) : undefined;
    const periodText = startStr || endStr
      ? `Period: ${startStr ?? '...'} to ${endStr ?? '...'}`
      : 'Period: All time';

    const periodRow = this.worksheet.addRow([periodText]);
    this.worksheet.mergeCells(3, 1, 3, totalColumns);
    periodRow.font = { size: 8, italic: true };
    periodRow.alignment = { horizontal: 'center' };
    periodRow.height = 13;

    // Table header
    this.addHeaderRow(['Employee Name', 'Email', 'Week Start', 'Week End', 'Status']);
    const headerRow = this.worksheet.lastRow;
    if (headerRow) {
      headerRow.font = { bold: true, size: 9 };
      headerRow.height = 14;
    }

    // Sort by week start for consistency
    const sorted = data.slice().sort((a, b) => {
      const aTime = new Date(a.weekStartDate as any).getTime();
      const bTime = new Date(b.weekStartDate as any).getTime();
      return aTime - bTime;
    });

    // Rows
    sorted.forEach((item) => {
      const startDate = new Date(item.weekStartDate);
      const weekEndDate = new Date(startDate);
      weekEndDate.setDate(startDate.getDate() + 6);
      this.addDataRow([
        item.employeeName,
        (item as any).employeeEmail,
        typeof item.weekStartDate === 'string' ? item.weekStartDate : new Date(item.weekStartDate).toISOString().slice(0, 10),
        weekEndDate.toISOString().slice(0, 10),
        item.approvalStatus
      ]);
    });

    // Analytics & Key Metrics
    this.worksheet.addRow([]);

    const analyticsTitle = this.worksheet.addRow(['Analytics']);
    this.worksheet.mergeCells(analyticsTitle.number, 1, analyticsTitle.number, totalColumns);
    analyticsTitle.font = { bold: true, size: 12 };

    const keyMetricsTitle = this.worksheet.addRow(['Summary']);
    this.worksheet.mergeCells(keyMetricsTitle.number, 1, keyMetricsTitle.number, totalColumns);
    keyMetricsTitle.font = { bold: true, size: 11 };

    const metricsHeader = this.worksheet.addRow(['Category', '', '', 'Result', '']);
    this.worksheet.mergeCells(metricsHeader.number, 1, metricsHeader.number, 3);
    this.worksheet.mergeCells(metricsHeader.number, 4, metricsHeader.number, 5);
    metricsHeader.font = { bold: true, size: 10 };

    const stats = this.calculateApprovalStatistics(sorted);

    const metrics: Array<[string, string | number]> = [
      ['Total Employees', stats.uniqueEmployees],
      ['Total Submissions', stats.totalTimesheets],
      ['Approved', stats.approvedCount],
      ['Approval Rate', `${stats.approvalRate}%`]
    ];

    metrics.forEach((entry) => {
      const row = this.worksheet.addRow([entry[0], '', '', entry[1], '']);
      this.worksheet.mergeCells(row.number, 1, row.number, 3);
      this.worksheet.mergeCells(row.number, 4, row.number, 5);
      row.font = { size: 10 };

      // Align cells consistently
      const labelCell = this.worksheet.getCell(row.number, 1);
      labelCell.alignment = { horizontal: 'left' };
      const valueCell = this.worksheet.getCell(row.number, 4);
      valueCell.alignment = { horizontal: 'left' };

      
      if (entry[0] === 'Approval Rate') {
        const raw = entry[1];
        let numeric = 0;
        if (typeof raw === 'string') {
          const cleaned = raw.replace('%', '').trim();
          const parsed = Number(cleaned);
          numeric = isNaN(parsed) ? 0 : parsed / 100;
        } else if (typeof raw === 'number') {
          numeric = raw > 1 ? raw / 100 : raw;
        }
        valueCell.value = numeric;
        valueCell.numFmt = '0%';
      }
    });
  }

  private calculateApprovalStatistics(data: IApprovalStatusReport[]) {
    const uniqueEmployees = new Set(data.map((item) => (item as any).employeeEmail || item.employeeName)).size;
    const totalTimesheets = data.length;
    const approvedCount = data.filter((d) => d.approvalStatus === 'Approved').length;
    const approvalRate = totalTimesheets > 0 ? Math.round((approvedCount / totalTimesheets) * 100) : 0;

    return {
      uniqueEmployees,
      totalTimesheets,
      approvedCount,
      approvalRate
    };
  }

  async write(res: any, filename: string): Promise<void> {
    this.autoSizeColumns();
    const columnMaxWidths = [22, 30, 14, 14, 16];
    this.worksheet.columns.forEach((col, idx) => {
      const current = col.width ?? 10;
      const max = columnMaxWidths[idx] ?? 16;
      const min = 8;
      col.width = Math.max(Math.min(current, max), min);
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}.xlsx`);
    await (this as any).workbook.xlsx.write(res);
    res.end();
  }
}


