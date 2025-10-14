import { ProfessionalBasePDFGenerator } from '../base/ProfessionalBasePDFGenerator';
import { ProfessionalPDFComponents } from '../component/ProfessionalPDFComponents';
import PDFDocument from 'pdfkit';

type TimesheetEntryRow = {
  date: string;
  description: string;
  status: string;
  quantity: string;
};

export class TimesheetEntriesPdf extends ProfessionalBasePDFGenerator {
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
    data: Array<{
      employeeName: string;
      employeeEmail: string;
      tables: Array<{ title: string; rows: TimesheetEntryRow[] }>;
    }>,
    filters: { startDate?: string; endDate?: string }
  ): PDFDocument {
    this.components.addProfessionalHeader(
      'Timesheet Entries Report',
      filters,
      'Daily entry view with descriptions and approval status'
    );

    // For each employee render a header and their tables
    data.forEach((emp, empIndex) => {
      // Add section divider with employee name and email 
      this.components.addSectionDivider(`${emp.employeeName} - ${emp.employeeEmail}`);

      emp.tables.forEach((table, tableIndex) => {
        // Table title
        this.doc
          .fontSize(11)
          .fillColor(this.colors.text.primary)
          .font('Helvetica-Bold')
          .text(table.title, this.margin, this.currentY);
        this.currentY += 18;

        const headers = ['Date', 'Description', 'Status', 'Quantity'];
        const columnWidths = [100, 260, 100, 80];
        const dataRows = table.rows.map((r) => [r.date, r.description || '-', r.status || '', r.quantity || '']);
        this.components.addProfessionalTable(headers, dataRows, columnWidths, {
          alternateRows: true,
          textAlign: 'left',
          fontSize: 9,
        });

        
        if (table.rows.length > 18) {
          this.currentY += 10;
          this.checkPageBreak(200);
        }
      });

      // Per-employee summary metrics
      const empStats = this.calculateEmployeeStats(emp.tables);
      
      // Add Working Hours Summary as a table 
      
      // Check if we have enough space for the summary table
      this.checkPageBreak(150);
      
      this.doc.fontSize(11)
        .fillColor(this.colors.text.primary)
        .font('Helvetica-Bold')
        .text('Working Hours Summary', this.margin, this.currentY);
      this.currentY += 18;
      
      const metricsHeaders = ['Category', 'Hours'];
      const metricsData: string[][] = [
        ['Project Hours', `${empStats.projectHours.toFixed(2)} h`],
        ['Team Hours', `${empStats.teamHours.toFixed(2)} h`],
        ['Leave Hours', `${empStats.leaveHours.toFixed(2)} h`],
        ['Total Hours', `${empStats.totalHours.toFixed(2)} h`],
      ];
      
      this.components.addProfessionalTable(metricsHeaders, metricsData, [255, 245], {
        alternateRows: true,
        fontSize: 9,
        rowHeight: 20,
      });

      // Add spacing after employee's summary
      this.currentY += 10;
    });

    // Overall Summary
    this.checkPageBreak(200);
    this.currentY += 20;
    
    this.components.addSectionDivider('Overall Summary');
    
    const overallStats = this.calculateOverallStatistics(data);
    
    // Create summary table
    const tableWidth = this.pageWidth - (this.margin * 2);
    const rowHeight = 25;
    
    // Table header
    this.doc.rect(this.margin, this.currentY, tableWidth, 30)
      .fill(this.colors.primary);
    
    this.doc.fontSize(11)
      .fillColor('white')
      .font('Helvetica-Bold')
      .text('Category', this.margin + 10, this.currentY + 10)
      .text('Result', this.margin + tableWidth - 100, this.currentY + 10);
    
    this.currentY += 35;

    const summaryData = [
      { label: 'Total Employees', value: overallStats.totalEmployees, type: 'info' as const },
      { label: 'Total Working Days', value: overallStats.totalWorkingDays, type: 'info' as const },
      { label: 'Total Hours', value: `${overallStats.totalHours.toFixed(2)} h`, type: 'success' as const },
      { label: 'Projects Involved', value: overallStats.projectEntries, type: 'success' as const },
      { label: 'Teams Involved', value: overallStats.teamEntries, type: 'info' as const },
      { label: 'Leave Days Taken', value: overallStats.leaveDays, type: 'warning' as const },
    ];

    // Add metrics rows
    summaryData.forEach((item, index) => {
      const rowY = this.currentY;
      const bgColor = index % 2 === 0 ? '#F8FAFC' : 'white';
      
      // Row background
      this.doc.rect(this.margin, rowY, tableWidth, rowHeight)
        .fill(bgColor)
        .stroke(this.colors.border);
      
      // Status indicator 
      const indicatorColor = this.getSummaryColor(item.type);
      this.doc.circle(this.margin + 15, rowY + 12, 4)
        .fill(indicatorColor);
      
      // Metric label
      this.doc.fontSize(10)
        .fillColor(this.colors.text.primary)
        .font('Helvetica')
        .text(item.label, this.margin + 30, rowY + 8);
      
      // Metric value
      this.doc.fontSize(12)
        .fillColor(this.colors.text.primary)
        .font('Helvetica-Bold')
        .text(String(item.value), this.margin + tableWidth - 90, rowY + 8, {
          align: 'left',
          width: 80
        });
      
      this.currentY += rowHeight;
    });

    return this.doc;
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

  private calculateOverallStatistics(data: Array<{ tables: Array<{ title: string; rows: Array<{ quantity: string; date?: string }> }> }>) {
    let totalEntries = 0;
    let totalHours = 0;
    let projectEntries = 0;
    let teamEntries = 0;
    let leaveEntries = 0;

    // Aggregate leave hours per employee per date to compute day fractions like detailed timesheet
    // key format: `${employeeIndex}|${date}`
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
            // Track leave hours by date
            if (row.date) {
              const key = `${empIdx}|${row.date}`;
              const prev = leaveHoursByEmployeeDate.get(key) || 0;
              leaveHoursByEmployeeDate.set(key, prev + hours);
            }
          }
        });
      });
    });

    // Convert aggregated leave hours per day to leave day fractions capped at 1 per day
    let leaveDays = 0;
    leaveHoursByEmployeeDate.forEach((hours) => {
      const fraction = hours / 8;
      if (fraction > 0) leaveDays += Math.min(fraction, 1);
    });

    // Round to 2 decimals to match detailed timesheet style
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

  private getSummaryColor(type: string): string {
    switch (type) {
      case 'success': return this.colors.accent;
      case 'warning': return this.colors.warning;
      case 'danger': return this.colors.danger;
      case 'info': return this.colors.primary;
      default: return this.colors.secondary;
    }
  }
}




