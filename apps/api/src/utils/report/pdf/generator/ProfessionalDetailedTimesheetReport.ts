import { ProfessionalBasePDFGenerator } from '../base/ProfessionalBasePDFGenerator';
import { ProfessionalPDFComponents } from '../component/ProfessionalPDFComponents';
import PDFDocument from 'pdfkit';
import { IDetailedTimesheetReport } from '../../../../interfaces';

export class ProfessionalDetailedTimesheetReport extends ProfessionalBasePDFGenerator {
  private components: ProfessionalPDFComponents;

  constructor() {
    super();
    this.components = new ProfessionalPDFComponents(
      this.doc,
      this.margin,
      () => this.currentY,
      (y) => this.currentY = y,
      (space) => this.checkPageBreak(space),
      this.pageWidth
    );
  }

  generate(
    data: IDetailedTimesheetReport[],
    filters: { startDate?: string; endDate?: string }
  ): PDFDocument {
    // Add custom header without date and period info 
    this.addCustomHeader();

    // Group data by employee
    const groupedData = this.groupDataByEmployee(data);

    // Add separate table for each employee
    this.addEmployeeTables(groupedData);

    // Add summary statistics
    this.addSummaryStatistics(data);

    return this.doc;
  }

  private groupDataByEmployee(data: IDetailedTimesheetReport[]): Map<string, IDetailedTimesheetReport[]> {
    const groupedData = new Map<string, IDetailedTimesheetReport[]>();
    
    data.forEach(timesheetWeek => {
      const employeeKey = `${timesheetWeek.employeeId}-${timesheetWeek.employeeName}`;
      
      if (!groupedData.has(employeeKey)) {
        groupedData.set(employeeKey, []);
      }
      
      groupedData.get(employeeKey)!.push(timesheetWeek);
    });
    
    return groupedData;
  }

  private addEmployeeTables(groupedData: Map<string, IDetailedTimesheetReport[]>): void {
    if (groupedData.size === 0) {
      this.doc.fontSize(10)
        .fillColor(this.colors.text.secondary)
        .font('Helvetica')
        .text('No data available for the selected period.', this.margin, this.currentY);
      
      this.currentY += 40;
      return;
    }

    // Sort employees by name for consistent ordering
    const sortedEmployees = Array.from(groupedData.entries()).sort(([keyA], [keyB]) => {
      const nameA = keyA.split('-')[1] || '';
      const nameB = keyB.split('-')[1] || '';
      return nameA.localeCompare(nameB);
    });

    sortedEmployees.forEach(([employeeKey, employeeData], index) => {
      if (index > 0) {
        // Add page break before each new employee (except the first one)
        this.checkPageBreak(200);
        this.currentY += 20;
      }

      this.addEmployeeTable(employeeData);
    });
  }

  private addEmployeeTable(employeeData: IDetailedTimesheetReport[]): void {
    if (employeeData.length === 0) return;

    const employee = employeeData[0];
    
    // Employee section header
    this.components.addSectionDivider(`${employee.employeeName} (${employee.employeeEmail})`);
    
    // Table headers
    const headers = ['Week Start', 'Status', 'Category', 'Work', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Total'];
    const columnWidths = [70, 60, 70, 80, 45, 45, 45, 45, 45, 45];

    const tableData: string[][] = [];
    
    // Calculate totals for this employee
    const employeeDailyTotals = [0, 0, 0, 0, 0];
    let employeeGrandTotal = 0;
    
    employeeData.forEach(timesheetWeek => {
      timesheetWeek.categories.forEach(category => {
        category.items.forEach(item => {
          const dailyHours = item.dailyHours || [];
          
          // Add to employee daily totals
          dailyHours.forEach((hours, index) => {
            if (index < 5 && hours) {
              employeeDailyTotals[index] += parseFloat(hours.toString()) || 0;
            }
          });
          
          // Calculate row total from daily hours 
          const rowTotal = dailyHours.slice(0, 5).reduce((sum, hours) => {
            return sum + (parseFloat(hours?.toString()) || 0);
          }, 0);
          
          // Add to employee grand total
          employeeGrandTotal += rowTotal;
          
          tableData.push([
            this.formatDate(timesheetWeek.weekStartDate),
            timesheetWeek.status,
            category.category,
            item.work || 'No description',
            this.formatHoursForDisplay(dailyHours[0]),
            this.formatHoursForDisplay(dailyHours[1]),
            this.formatHoursForDisplay(dailyHours[2]),
            this.formatHoursForDisplay(dailyHours[3]),
            this.formatHoursForDisplay(dailyHours[4]),
            this.formatHoursForDisplay(rowTotal)
          ]);
        });
      });
    });

    // Add the table
    this.components.addProfessionalTable(headers, tableData, columnWidths, {
      alternateRows: true,
      fontSize: 8
    });

    
  }

  
  private addCustomHeader(): void {
    // Header background
    this.doc.rect(0, 0, this.pageWidth, 120)
      .fill(this.colors.primary);

    // Report title 
    this.doc.fontSize(22)
      .fillColor('white')
      .font('Helvetica-Bold')
      .text('Detailed Timesheet Report', 0, 35, { 
        align: 'center',
        width: this.pageWidth
      });

    // Subtitle
    this.doc.fontSize(12)
      .fillColor('#E2E8F0')
      .font('Helvetica')
      .text('Comprehensive breakdown of employee work hours and project allocations', 0, 65, { 
        align: 'center',
        width: this.pageWidth
      });

    this.currentY = 140;
  }

  private addSummaryStatistics(data: IDetailedTimesheetReport[]): void {
    // Add page break before summary if needed
    this.checkPageBreak(200);
    
    this.components.addSectionDivider('Overall Summary & Key Metrics');

    const stats = this.calculateDetailedStatistics(data);
    
    const summaryData = [
      { 
        label: 'Total Employees', 
        value: stats.totalEmployees,
        type: 'info' as const
      },
      { 
        label: 'Total Teams', 
        value: stats.totalTeams,
        type: 'info' as const
      },
      { 
        label: 'Active Projects', 
        value: stats.totalProjects,
        type: 'info' as const
      },
      { 
        label: 'Work Items', 
        value: stats.totalTasks,
        type: 'info' as const
      },
      { 
        label: 'Grand Total Hours', 
        value: `${stats.grandTotal}h`,
        type: 'success' as const
      },
      
    ];

    // Add summary cards with proper spacing
    this.addSummaryCards(summaryData);

    // Add employee breakdown if multiple employees
    if (stats.totalEmployees > 1) {
      this.addEmployeeBreakdown(data);
    }
  }

  private addEmployeeBreakdown(data: IDetailedTimesheetReport[]): void {
    this.currentY += 20;
    this.checkPageBreak(150);
    
    // Group data by employee to get individual totals
    const employeeStats = new Map<string, { name: string; email: string; totalHours: number; weeks: number }>();
    
    data.forEach(timesheetWeek => {
      const key = timesheetWeek.employeeId;
      
      if (!employeeStats.has(key)) {
        employeeStats.set(key, {
          name: timesheetWeek.employeeName,
          email: timesheetWeek.employeeEmail,
          totalHours: 0,
          weeks: 0
        });
      }
      
      const employeeStat = employeeStats.get(key)!;
      employeeStat.weeks++;
      
      // Calculate total hours from categories
      timesheetWeek.categories.forEach(category => {
        category.items.forEach(item => {
          const dailyHours = item.dailyHours || [];
          const rowTotal = dailyHours.slice(0, 5).reduce((sum, hours) => {
            return sum + (parseFloat(hours?.toString()) || 0);
          }, 0);
          employeeStat.totalHours += rowTotal;
        });
      });
    });

    // Create employee breakdown table
    const headers = ['Employee', 'Email', 'Weeks', 'Total Hours', 'Avg/Week'];
    const columnWidths = [120, 140, 50, 70, 60];
    const employeeData: string[][] = [];

    Array.from(employeeStats.values())
      .sort((a, b) => b.totalHours - a.totalHours) 
      .forEach(stat => {
        const avgHours = stat.weeks > 0 ? (stat.totalHours / stat.weeks).toFixed(1) : '0';
        employeeData.push([
          stat.name,
          stat.email,
          stat.weeks.toString(),
          stat.totalHours.toFixed(1) + 'h',
          avgHours + 'h'
        ]);
      });

    // Add section title
    this.doc.fontSize(12)
      .fillColor(this.colors.text.primary)
      .font('Helvetica-Bold')
      .text('Employee Performance Breakdown', this.margin, this.currentY);
    
    this.currentY += 25;

    this.components.addProfessionalTable(headers, employeeData, columnWidths, {
      alternateRows: true,
      fontSize: 8,
      rowHeight: 25
    });
  }

  private addSummaryCards(summaryData: { label: string; value: number | string; type: 'success' | 'warning' | 'danger' | 'info' }[]): void {
    this.checkPageBreak(150);
    
    // Create a metrics table format
    const tableWidth = this.pageWidth - (this.margin * 2);
    const rowHeight = 25;
    
    // Table header
    this.doc.rect(this.margin, this.currentY, tableWidth, 30)
      .fill(this.colors.primary);
    
    this.doc.fontSize(11)
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
          align: 'right',
          width: 80
        });
      
      this.currentY += rowHeight;
    });
    
    this.currentY += 15;
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

  private formatHoursForDisplay(hours: number | undefined | null | string): string {
    if (!hours || hours === 0 || hours === '0') return '';
    
    // Convert to number if it's a string
    const numHours = typeof hours === 'string' ? parseFloat(hours) : hours;
    
    // Check if it's a valid number
    if (isNaN(numHours) || numHours === 0) return '';
    
    return numHours.toFixed(2);
  }

  private calculateDetailedStatistics(data: IDetailedTimesheetReport[]) {
    const totalEmployees = new Set(data.map(d => d.employeeId)).size;
    let totalHours = 0;
    let grandTotal = 0;
    
    const allProjects = new Set<string>();
    const allTeams = new Set<string>();
    let totalTasks = 0;
    
    // Calculate accurate total hours from all items
    data.forEach(d => {
      d.categories.forEach(cat => {
        cat.items.forEach(item => {
          if (item.projectName) allProjects.add(item.projectName);
          if (item.teamName) allTeams.add(item.teamName);
          totalTasks++;
          totalHours += item.totalHours || 0;
          
          // Calculate from daily hours 
          const dailyHours = item.dailyHours || [];
          const rowTotal = dailyHours.slice(0, 5).reduce((sum, hours) => {
            return sum + (parseFloat(hours?.toString()) || 0);
          }, 0);
          grandTotal += rowTotal;
        });
      });
    });

    const totalProjects = allProjects.size;
    const totalTeams = allTeams.size;
    const totalWeeks = data.length;
    const avgHoursPerWeek = totalWeeks > 0 ? (totalHours / totalWeeks).toFixed(1) : '0';
    const utilizationRate = totalWeeks > 0 ? Math.round((totalHours / (totalWeeks * 40)) * 100) : 0;

    return {
      totalEmployees,
      totalHours: Math.round(totalHours * 100) / 100,
      grandTotal: Math.round(grandTotal * 100) / 100, 
      totalProjects,
      totalTeams,
      totalTasks,
      avgHoursPerWeek,
      utilizationRate
    };
  }
}