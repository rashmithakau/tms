import { BaseExcelGenerator } from '../base/BaseExcelGenerator';
import { ISubmissionStatusReport } from '../../../../interfaces';

export class SubmissionStatusExcel extends BaseExcelGenerator {
  constructor() {
    super('Submission Status');
  }

  build(data: ISubmissionStatusReport[], _filters?: Record<string, any>) {
    const totalColumns = 5;

    const titleRow = this.worksheet.addRow(['Timesheet Submission Status Report']);
    this.worksheet.mergeCells(1, 1, 1, totalColumns);
    titleRow.font = { bold: true, size: 14 };
    titleRow.alignment = { horizontal: 'center' };
    titleRow.height = 17;

    const subtitleRow = this.worksheet.addRow([
      'Comprehensive analysis of employee timesheet submission compliance'
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

    // Group data by employee
    const groupedData = this.groupDataByEmployee(data);

    // Add each employee's data separately
    Object.values(groupedData).forEach((employeeData, index) => {
      if (index > 0) {
        // Add spacing between employees
        this.worksheet.addRow([]);
      }

      // Employee header
      const employeeHeaderRow = this.worksheet.addRow([`${employeeData.employeeName} (${employeeData.employeeEmail})`]);
      this.worksheet.mergeCells(employeeHeaderRow.number, 1, employeeHeaderRow.number, totalColumns);
      employeeHeaderRow.font = { bold: true, size: 11 };
      employeeHeaderRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE2E8F0' }
      };
      employeeHeaderRow.height = 16;

      // Add header row for this employee
      this.addHeaderRow(['Week Start', 'Week End', 'Status']);
      
      const headerRow = this.worksheet.lastRow;
      if (headerRow) {
        headerRow.font = { bold: true, size: 9 };
        headerRow.height = 14;
      }

      // Sort employee's data by week start date
      const sortedEmployeeData = employeeData.weeks.slice().sort((a, b) => {
        const aTime = new Date(a.weekStartDate as any).getTime();
        const bTime = new Date(b.weekStartDate as any).getTime();
        return aTime - bTime;
      });

      // Add data rows for this employee
      sortedEmployeeData.forEach((item) => {
        // Calculate week end 
        const startDate = new Date(item.weekStartDate);
        const weekEndDate = new Date(startDate);
        weekEndDate.setDate(startDate.getDate() + 6);
        this.addDataRow([
          typeof item.weekStartDate === 'string' ? item.weekStartDate : new Date(item.weekStartDate).toISOString().slice(0, 10),
          weekEndDate.toISOString().slice(0, 10),
          item.submissionStatus
        ]);
      });
    });

    //Analytics & Insights 
    this.worksheet.addRow([]); 

    const analyticsTitle = this.worksheet.addRow(['Analytics']);
    this.worksheet.mergeCells(analyticsTitle.number, 1, analyticsTitle.number, totalColumns);
    analyticsTitle.font = { bold: true, size: 12 };

    const keyMetricsTitle = this.worksheet.addRow(['Summary']);
    this.worksheet.mergeCells(keyMetricsTitle.number, 1, keyMetricsTitle.number, totalColumns);
    keyMetricsTitle.font = { bold: true, size: 11 };

    // Table header for metrics
    const metricsHeader = this.worksheet.addRow(['Category', '', '', 'Result', '']);
    this.worksheet.mergeCells(metricsHeader.number, 1, metricsHeader.number, 3);
    this.worksheet.mergeCells(metricsHeader.number, 4, metricsHeader.number, 5);
    metricsHeader.font = { bold: true, size: 10 };

    const stats = this.calculateStatistics(data);

    const metrics: Array<[string, string | number]> = [
      ['Total Employees', stats.totalEmployees],
      ['Total Records', stats.totalRecords],
      ['On-Time Submissions', stats.submittedCount],
     
    ];

    metrics.forEach((entry, idx) => {
      const row = this.worksheet.addRow([entry[0], '', '', entry[1], '']);
      this.worksheet.mergeCells(row.number, 1, row.number, 3);
      this.worksheet.mergeCells(row.number, 4, row.number, 5);
      row.font = { size: 10 };
      // Align label and value cells to the left for Key Metrics
      const labelCell = this.worksheet.getCell(row.number, 1);
      labelCell.alignment = { horizontal: 'left' };
      const valueCell = this.worksheet.getCell(row.number, 4);
      valueCell.alignment = { horizontal: 'left' };
    });
  }

  private groupDataByEmployee(data: ISubmissionStatusReport[]) {
    const grouped: { [key: string]: { employeeName: string; employeeEmail: string; weeks: ISubmissionStatusReport[] } } = {};
    
    data.forEach((item) => {
      const key = `${item.employeeName}|${item.employeeEmail}`;
      if (!grouped[key]) {
        grouped[key] = {
          employeeName: item.employeeName,
          employeeEmail: item.employeeEmail,
          weeks: []
        };
      }
      grouped[key].weeks.push(item);
    });
    
    return grouped;
  }

  private calculateStatistics(data: ISubmissionStatusReport[]) {
    const uniqueEmployees = new Set(data.map((item) => item.employeeEmail)).size;
    const totalRecords = data.length;
    const submittedCount = data.filter((d) => d.submissionStatus === 'Submitted').length;
   

    return {
      totalEmployees: uniqueEmployees,
      totalRecords,
      submittedCount,
     
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


