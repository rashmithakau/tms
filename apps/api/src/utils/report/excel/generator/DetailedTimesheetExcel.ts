import { BaseExcelGenerator } from '../base/BaseExcelGenerator';
import { ITimesheetReportData } from '../../../../interfaces';

export class DetailedTimesheetExcel extends BaseExcelGenerator {
  constructor() {
    super('Detailed Timesheet');
  }

  build(data: ITimesheetReportData[], _filters?: Record<string, any>) {
    const totalColumns = 10; 
    
    const titleRow = this.worksheet.addRow(['Detailed Timesheet Report']);
    this.worksheet.mergeCells(titleRow.number, 1, titleRow.number, totalColumns);
    titleRow.font = { bold: true, size: 14 };
    titleRow.alignment = { horizontal: 'center' };
    titleRow.height = 17;

    const subtitleRow = this.worksheet.addRow([
      'Comprehensive breakdown of employee work hours and project allocations'
    ]);
    this.worksheet.mergeCells(subtitleRow.number, 1, subtitleRow.number, totalColumns);
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
    this.worksheet.mergeCells(periodRow.number, 1, periodRow.number, totalColumns);
    periodRow.font = { size: 8, italic: true };
    periodRow.alignment = { horizontal: 'center' };
    periodRow.height = 13;

    // Spacer
    this.worksheet.addRow([]);

    
    const grouped = this.groupByEmployee(data);

    const employees = Array.from(grouped.values())
      .sort((a, b) => a.meta.employeeName.localeCompare(b.meta.employeeName));

    employees.forEach((group, idx) => {
      if (idx > 0) this.worksheet.addRow([]);

      // Section header
      const sectionTitle = this.worksheet.addRow([
        `${group.meta.employeeName} (${group.meta.employeeEmail})`
      ]);
      this.worksheet.mergeCells(sectionTitle.number, 1, sectionTitle.number, totalColumns);
      sectionTitle.font = { bold: true, size: 12 };

      // Build sub-tables
      const subTables = this.buildSubTables(group.rows);

      subTables.forEach((sub) => {
        // Sub-table title
        const subTitle = this.worksheet.addRow([sub.title]);
        this.worksheet.mergeCells(subTitle.number, 1, subTitle.number, totalColumns);
        subTitle.font = { bold: true, size: 11 };

        // Headers aligned to PDF
        const headers = sub.includeWork
          ? ['Week Start', 'Week End', 'Status', 'Work', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Total']
          : ['Week Start', 'Week End', 'Status', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Total'];
        this.addHeaderRow(headers);
        const hdr = this.worksheet.lastRow;
        if (hdr) {
          hdr.font = { bold: true, size: 9 };
          hdr.height = 14;
        }

        // Rows sorted by week start
        sub.rows
          .slice()
          .sort((a, b) => a.sortDate.getTime() - b.sortDate.getTime())
          .forEach((r) => this.addDataRow(r.cells));

        // Small spacer after each sub-table
        this.worksheet.addRow([]);
      });

      // Per-employee Key Metrics 
      const metricsTitle = this.worksheet.addRow(['Key Metrics']);
      this.worksheet.mergeCells(metricsTitle.number, 1, metricsTitle.number, totalColumns);
      metricsTitle.font = { bold: true, size: 11 };

      // Table header for metrics
      const metricsHeader = this.worksheet.addRow(['Metric', '', '', 'Value', '']);
      this.worksheet.mergeCells(metricsHeader.number, 1, metricsHeader.number, 3);
      this.worksheet.mergeCells(metricsHeader.number, 4, metricsHeader.number, 5);
      metricsHeader.font = { bold: true, size: 10 };

      const empStats = this.calculateEmployeeStats(group.rows);
      const empMetrics: Array<[string, string | number]> = [
        ['Total Hours', empStats.grandTotal.toFixed(2) + 'h'],
        ['Monday Hours', empStats.daily[0].toFixed(2)],
        ['Tuesday Hours', empStats.daily[1].toFixed(2)],
        ['Wednesday Hours', empStats.daily[2].toFixed(2)],
        ['Thursday Hours', empStats.daily[3].toFixed(2)],
        ['Friday Hours', empStats.daily[4].toFixed(2)]
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

    // Overall Summary & Key Metrics 
    this.worksheet.addRow([]);
    const summaryTitle = this.worksheet.addRow(['Overall Summary & Key Metrics']);
    this.worksheet.mergeCells(summaryTitle.number, 1, summaryTitle.number, totalColumns);
    summaryTitle.font = { bold: true, size: 12 };

    const stats = this.calculateDetailedStatistics(data);
    const summaryHeader = this.worksheet.addRow(['Metric', '', '', 'Value', '']);
    this.worksheet.mergeCells(summaryHeader.number, 1, summaryHeader.number, 3);
    this.worksheet.mergeCells(summaryHeader.number, 4, summaryHeader.number, 5);
    summaryHeader.font = { bold: true, size: 10 };

    const summaryMetrics: Array<[string, string | number]> = [
      ['Total Employees', stats.totalEmployees],
      ['Total Teams', stats.totalTeams],
      ['Total Projects', stats.totalProjects],
      ['Work Items', stats.totalTasks],
      ['Other Days', stats.otherDays],
      ['Grand Total Hours', `${stats.grandTotal}h`]
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

  private groupByEmployee(data: ITimesheetReportData[]) {
    const map = new Map<string, { meta: { employeeId: string; employeeName: string; employeeEmail: string }, rows: ITimesheetReportData[] }>();
    data.forEach((d) => {
      const key = `${d.employeeId}-${d.employeeName}`;
      if (!map.has(key)) {
        map.set(key, { meta: { employeeId: d.employeeId, employeeName: d.employeeName, employeeEmail: d.employeeEmail }, rows: [] });
      }
      map.get(key)!.rows.push(d);
    });
    return map;
  }

  private buildSubTables(employeeWeeks: ITimesheetReportData[]) {
    type SubRow = { sortDate: Date; cells: (string | number)[] };
    type SubTable = { title: string; includeWork: boolean; rows: SubRow[] };
    const tablesByTitle = new Map<string, SubTable>();

    employeeWeeks.forEach((timesheetWeek) => {
      timesheetWeek.categories.forEach((category) => {
        category.items.forEach((item) => {
          const dailyHours = Array.isArray(item.dailyHours) ? item.dailyHours : [];

          // Determine sub-table
          let title = 'General';
          let includeWork = false;
          if (item.projectName) {
            title = `Project: ${item.projectName}`;
          } else if (item.teamName) {
            title = `Team: ${item.teamName}`;
          } else if (category.category === 'Other') {
            title = 'Leave';
            includeWork = true;
          }

          if (!tablesByTitle.has(title)) {
            tablesByTitle.set(title, { title, includeWork, rows: [] });
          }
          const table = tablesByTitle.get(title)!;

          const weekStartRaw = new Date(timesheetWeek.weekStartDate as any);
          const weekEndRaw = new Date(weekStartRaw);
          weekEndRaw.setDate(weekStartRaw.getDate() + 6);

          const rowTotal = dailyHours.slice(0, 5).reduce((sum: number, hours) => {
            const n = typeof hours === 'string' ? parseFloat(hours) : (hours || 0);
            return sum + (isNaN(n) ? 0 : n);
          }, 0);

          const baseCells: (string | number)[] = [
            this.formatDate(weekStartRaw),
            this.formatDate(weekEndRaw),
            timesheetWeek.status
          ];
          const workCells: (string | number)[] = includeWork ? [item.work || ''] : [];
          const dayCells: (string | number)[] = [
            this.formatHoursForDisplay(dailyHours[0]),
            this.formatHoursForDisplay(dailyHours[1]),
            this.formatHoursForDisplay(dailyHours[2]),
            this.formatHoursForDisplay(dailyHours[3]),
            this.formatHoursForDisplay(dailyHours[4]),
            this.formatHoursForDisplay(rowTotal)
          ];

          table.rows.push({ sortDate: weekStartRaw, cells: [...baseCells, ...workCells, ...dayCells] });
        });
      });
    });

    // Sort table order
    const ordered = Array.from(tablesByTitle.values()).sort((a, b) => {
      const rank = (t: string) => (t.startsWith('Project:') ? 0 : t.startsWith('Team:') ? 1 : t === 'Leave' ? 2 : 3);
      const rA = rank(a.title);
      const rB = rank(b.title);
      if (rA !== rB) return rA - rB;
      return a.title.localeCompare(b.title);
    });
    return ordered;
  }

  private calculateEmployeeStats(employeeWeeks: ITimesheetReportData[]) {
    const daily = [0, 0, 0, 0, 0];
    let grandTotal = 0;
    employeeWeeks.forEach((week) => {
      week.categories.forEach((cat) => {
        cat.items.forEach((item) => {
          const hours = Array.isArray(item.dailyHours) ? item.dailyHours : [];
          hours.slice(0, 5).forEach((h, i) => {
            const nNum = typeof h === 'string' ? parseFloat(h) : (typeof h === 'number' ? h : 0);
            if (!isNaN(nNum)) daily[i] += nNum;
          });
          const rowTotal: number = hours.slice(0, 5).reduce<number>((s, h) => {
            const nNum = typeof h === 'string' ? parseFloat(h) : (typeof h === 'number' ? h : 0);
            return s + (isNaN(nNum) ? 0 : nNum);
          }, 0);
          grandTotal += rowTotal;
        });
      });
    });
    return { daily, grandTotal };
  }

  private calculateDetailedStatistics(data: ITimesheetReportData[]) {
    const totalEmployees = new Set(data.map(d => d.employeeId)).size;
    let grandTotal = 0;
    let otherDays = 0;
    const allProjects = new Set<string>();
    const allTeams = new Set<string>();
    let totalTasks = 0;

    data.forEach(d => {
      // Track per-week leave hours aggregated across all other items
      const weeklyLeaveHours: number[] = [0, 0, 0, 0, 0];

      d.categories.forEach(cat => {
        cat.items.forEach(item => {
          if (item.projectName) allProjects.add(item.projectName);
          if (item.teamName) allTeams.add(item.teamName);
          totalTasks++;
          const dailyHours = Array.isArray(item.dailyHours) ? item.dailyHours : [];
          const rowTotal: number = dailyHours.slice(0, 5).reduce<number>((sum, hours) => {
            const nNum = typeof hours === 'string' ? parseFloat(hours) : (typeof hours === 'number' ? hours : 0);
            return sum + (isNaN(nNum) ? 0 : nNum);
          }, 0);
          grandTotal += rowTotal;

          if (cat.category === 'Other') {
            for (let i = 0; i < 5; i++) {
              const h = dailyHours[i];
              const n = typeof h === 'string' ? parseFloat(h) : (typeof h === 'number' ? h : 0);
              if (!isNaN(n) && n > 0) weeklyLeaveHours[i] += n;
            }
          }
        });
      });

      // Convert weekly aggregated leave hours to other day fractions (8h = 1 day)
      for (let i = 0; i < 5; i++) {
        const fraction = weeklyLeaveHours[i] / 8;
        if (fraction > 0) otherDays += Math.min(fraction, 1);
      }
    });

    return {
      totalEmployees,
      totalProjects: allProjects.size,
      totalTeams: allTeams.size,
      totalTasks,
      otherDays: Math.round(otherDays * 100) / 100,
      grandTotal: Math.round(grandTotal * 100) / 100
    };
  }

  private formatDate(d: Date): string {
    return d.toISOString().slice(0, 10);
  }

  private formatHoursForDisplay(hours: number | undefined | null | string): string {
    if (!hours || hours === 0 || hours === '0') return '';
    const num = typeof hours === 'string' ? parseFloat(hours) : hours;
    if (isNaN(num)) return '' as any;
    return num.toFixed(2);
  }

  async write(res: any, filename: string): Promise<void> {
   
    this.autoSizeColumns();
  
    const columnMaxWidths = [14, 14, 12, 8, 8, 8, 8, 8, 8, 10];
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




