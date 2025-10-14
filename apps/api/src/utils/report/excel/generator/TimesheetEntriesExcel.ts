import { BaseExcelGenerator } from '../base/BaseExcelGenerator';

type TimesheetEntryData = Array<{
  employeeName: string;
  employeeEmail: string;
  tables: Array<{
    title: string;
    rows: Array<{
      date: string;
      description: string;
      status: string;
      quantity: string;
    }>;
  }>;
}>;

export class TimesheetEntriesExcel extends BaseExcelGenerator {
  constructor() {
    super('Timesheet Entries');
  }

  build(data: TimesheetEntryData, filters?: Record<string, any>) {
    const totalColumns = 4; 
    
    const titleRow = this.worksheet.addRow(['Timesheet Entries Report']);
    this.worksheet.mergeCells(titleRow.number, 1, titleRow.number, totalColumns);
    titleRow.font = { bold: true, size: 14 };
    titleRow.alignment = { horizontal: 'center' };
    titleRow.height = 17;

    const subtitleRow = this.worksheet.addRow([
      'Daily entry view with descriptions and approval status'
    ]);
    this.worksheet.mergeCells(subtitleRow.number, 1, subtitleRow.number, totalColumns);
    subtitleRow.font = { size: 9 };
    subtitleRow.alignment = { horizontal: 'center' };
    subtitleRow.height = 14;

    const start = filters?.startDate ? new Date(filters.startDate) : undefined;
    const end = filters?.endDate ? new Date(filters.endDate) : undefined;
    const startStr = start ? start.toISOString().slice(0, 10) : undefined;
    const endStr = end ? end.toISOString().slice(0, 10) : undefined;
    const periodText = startStr || endStr
      ? `Period: ${startStr ?? '...'} to ${endStr ?? '...'}`
      : 'Period: All time';

    const periodRow = this.worksheet.addRow([periodText]);
    this.worksheet.mergeCells(periodRow.number, 1, periodRow.number, totalColumns);
    periodRow.font = { size: 8, italic: true };
    periodRow.alignment = { horizontal: 'center' };
    periodRow.height = 13;

    this.worksheet.addRow([]);

    // Sort employees by name
    const sortedData = [...data].sort((a, b) => a.employeeName.localeCompare(b.employeeName));

    sortedData.forEach((employee, empIdx) => {
      if (empIdx > 0) this.worksheet.addRow([]);

      // Employee section header
      const sectionTitle = this.worksheet.addRow([
        `${employee.employeeName} - ${employee.employeeEmail}`
      ]);
      this.worksheet.mergeCells(sectionTitle.number, 1, sectionTitle.number, totalColumns);
      sectionTitle.font = { bold: true, size: 12 };

      // Build sub-tables 
      const sortedTables = [...employee.tables].sort((a, b) => {
        const rank = (t: string) => (t.startsWith('Project:') ? 0 : t.startsWith('Team:') ? 1 : t === 'Leave' ? 2 : 3);
        const rA = rank(a.title);
        const rB = rank(b.title);
        if (rA !== rB) return rA - rB;
        return a.title.localeCompare(b.title);
      });

      sortedTables.forEach((table) => {
        // Sub-table title
        const subTitle = this.worksheet.addRow([table.title]);
        this.worksheet.mergeCells(subTitle.number, 1, subTitle.number, totalColumns);
        subTitle.font = { bold: true, size: 11 };

        // Headers
        const headers = ['Date', 'Description', 'Status', 'Quantity'];
        this.addHeaderRow(headers);
        const hdr = this.worksheet.lastRow;
        if (hdr) {
          hdr.font = { bold: true, size: 9 };
          hdr.height = 14;
        }

        // Sort rows by date
        const sortedRows = [...table.rows].sort((a, b) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        // Add data rows
        sortedRows.forEach((row) => {
          const cells = [row.date, row.description, row.status, row.quantity];
          this.addDataRow(cells);
        });

        // Small spacer after each sub-table
        this.worksheet.addRow([]);
      });

      // Per-employee summary metrics
      const metricsTitle = this.worksheet.addRow(['Working Hours Summary']);
      this.worksheet.mergeCells(metricsTitle.number, 1, metricsTitle.number, totalColumns);
      metricsTitle.font = { bold: true, size: 11 };

      // Calculate employee stats
      const empStats = this.calculateEmployeeStats(employee.tables);
      
      // Table header for metrics
      const metricsHeader = this.worksheet.addRow(['Category', '', '', 'Hours', '']);
      this.worksheet.mergeCells(metricsHeader.number, 1, metricsHeader.number, 3);
      this.worksheet.mergeCells(metricsHeader.number, 4, metricsHeader.number, 5);
      metricsHeader.font = { bold: true, size: 10 };

      const empMetrics: Array<[string, string | number]> = [
        ['Project Hours', `${empStats.projectHours.toFixed(2)} h`],
        ['Team Hours', `${empStats.teamHours.toFixed(2)} h`],
        ['Leave Hours', `${empStats.leaveHours.toFixed(2)} h`],
        ['Total Hours', `${empStats.totalHours.toFixed(2)} h`],
      ];

      empMetrics.forEach((entry) => {
        const row = this.worksheet.addRow([entry[0], '', '', entry[1], '']);
        this.worksheet.mergeCells(row.number, 1, row.number, 3);
        this.worksheet.mergeCells(row.number, 4, row.number, 5);
        row.font = { size: 10 };
        const labelCell = this.worksheet.getCell(row.number, 1);
        labelCell.alignment = { horizontal: 'left' };
        const valueCell = this.worksheet.getCell(row.number, 4);
        valueCell.alignment = { horizontal: 'left' };
      });
    });

    // Overall Summary
    this.worksheet.addRow([]);
    const summaryTitle = this.worksheet.addRow(['Overall Summary']);
    this.worksheet.mergeCells(summaryTitle.number, 1, summaryTitle.number, totalColumns);
    summaryTitle.font = { bold: true, size: 12 };

    const stats = this.calculateOverallStatistics(data);
    const summaryHeader = this.worksheet.addRow(['Category', '', '', 'Result', '']);
    this.worksheet.mergeCells(summaryHeader.number, 1, summaryHeader.number, 3);
    this.worksheet.mergeCells(summaryHeader.number, 4, summaryHeader.number, 5);
    summaryHeader.font = { bold: true, size: 10 };

    const summaryMetrics: Array<[string, string | number]> = [
      ['Total Employees', stats.totalEmployees],
      ['Total Working Days', stats.totalWorkingDays],
      ['Total Hours', `${stats.totalHours.toFixed(2)} h`],
      ['Projects Involved', stats.projectEntries],
      ['Teams Involved', stats.teamEntries],
      ['Leave Days Taken', stats.leaveDays],
    ];

    summaryMetrics.forEach((entry) => {
      const row = this.worksheet.addRow([entry[0], '', '', entry[1], '']);
      this.worksheet.mergeCells(row.number, 1, row.number, 3);
      this.worksheet.mergeCells(row.number, 4, row.number, 5);
      row.font = { size: 10 };
      const labelCell = this.worksheet.getCell(row.number, 1);
      labelCell.alignment = { horizontal: 'left' };
      const valueCell = this.worksheet.getCell(row.number, 4);
      valueCell.alignment = { horizontal: 'left' };
    });
  }

  private calculateEmployeeStats(tables: Array<{ title: string; rows: Array<{ quantity: string }> }>) {
    let totalHours = 0;
    let totalDays = 0;
    let projectHours = 0;
    let teamHours = 0;
    let leaveHours = 0;

    tables.forEach((table) => {
      table.rows.forEach((row) => {
        const hours = parseFloat(row.quantity) || 0;
        totalHours += hours;
        totalDays++;
        
        if (table.title.startsWith('Project:')) {
          projectHours += hours;
        } else if (table.title.startsWith('Team:')) {
          teamHours += hours;
        } else if (table.title === 'Leave') {
          leaveHours += hours;
        }
      });
    });

    const avgHoursPerDay = totalDays > 0 ? totalHours / totalDays : 0;

    return {
      totalHours,
      totalDays,
      avgHoursPerDay,
      projectHours,
      teamHours,
      leaveHours,
    };
  }

  private calculateOverallStatistics(data: TimesheetEntryData) {
    let totalEntries = 0;
    let totalHours = 0;
    let projectEntries = 0;
    let teamEntries = 0;
    let leaveEntries = 0;

    // Aggregate leave hours per employee per date to compute leave days (hours/8 capped at 1)
    const leaveHoursByEmployeeDate = new Map<string, number>();

    data.forEach((employee, empIdx) => {
      employee.tables.forEach((table) => {
        table.rows.forEach((row) => {
          totalEntries++;
          const hours = parseFloat(row.quantity) || 0;
          totalHours += hours;
          
          if (table.title.startsWith('Project:')) {
            projectEntries++;
          } else if (table.title.startsWith('Team:')) {
            teamEntries++;
          } else if (table.title === 'Leave') {
            leaveEntries++;
            if (row.date) {
              const key = `${empIdx}|${row.date}`;
              const prev = leaveHoursByEmployeeDate.get(key) || 0;
              leaveHoursByEmployeeDate.set(key, prev + hours);
            }
          }
        });
      });
    });

    let leaveDays = 0;
    leaveHoursByEmployeeDate.forEach((hours) => {
      const fraction = hours / 8;
      if (fraction > 0) leaveDays += Math.min(fraction, 1);
    });
    leaveDays = Math.round(leaveDays * 100) / 100;

    return {
      totalEmployees: data.length,
      totalWorkingDays: totalEntries,
      totalHours,
      projectEntries,
      teamEntries,
      leaveEntries,
      leaveDays,
    };
  }

  async write(res: any, filename: string): Promise<void> {
    this.autoSizeColumns();

    const columnMaxWidths = [12, 40, 12, 10]; 
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
