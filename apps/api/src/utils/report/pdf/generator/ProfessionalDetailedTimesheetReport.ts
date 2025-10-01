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
    // Add custom header without date and period info (matching approval status report)
    this.addCustomHeader();

    // Add main preview table (most important section)
    this.addMainPreviewTable(data);

    // Add summary statistics
    this.addSummaryStatistics(data);

    return this.doc;
  }

  private addCustomHeader(): void {
    // Header background
    this.doc.rect(0, 0, this.pageWidth, 120)
      .fill(this.colors.primary);

    // Report title (center)
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

  private addMainPreviewTable(data: IDetailedTimesheetReport[]): void {
    this.components.addSectionDivider('Detailed Timesheet Data');

    if (data.length === 0) {
      this.doc.fontSize(12)
        .fillColor(this.colors.text.secondary)
        .font('Helvetica')
        .text('No data available for the selected period.', this.margin, this.currentY);
      
      this.currentY += 40;
      return;
    }

    // Create the comprehensive table as shown in the UI preview
    const headers = ['Employee', 'Email', 'Week Start', 'Status', 'Category', 'Work', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Total'];
    const columnWidths = [60, 80, 55, 40, 50, 60, 25, 25, 25, 25, 25, 35];

    const previewData: string[][] = [];
    
    // Calculate totals for each day and overall total
    const dailyTotals = [0, 0, 0, 0, 0];
    let grandTotal = 0;
    
    data.forEach(timesheetWeek => {
      timesheetWeek.categories.forEach(category => {
        category.items.forEach(item => {
          const dailyHours = item.dailyHours || [];
          
          // Add to daily totals
          dailyHours.forEach((hours, index) => {
            if (index < 5 && hours) {
              dailyTotals[index] += parseFloat(hours.toString()) || 0;
            }
          });
          
          // Calculate row total from daily hours (Mon-Fri only)
          const rowTotal = dailyHours.slice(0, 5).reduce((sum, hours) => {
            return sum + (parseFloat(hours?.toString()) || 0);
          }, 0);
          
          // Add to grand total
          grandTotal += rowTotal;
          
          previewData.push([
            timesheetWeek.employeeName,
            timesheetWeek.employeeEmail,
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

    this.components.addProfessionalTable(headers, previewData, columnWidths, {
      alternateRows: true,
      fontSize: 7
    });
  }

  private addSummaryStatistics(data: IDetailedTimesheetReport[]): void {
    this.components.addSectionDivider('Key Metrics');

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
        label: 'Grand Total', 
        value: `${stats.grandTotal}h`,
        type: 'success' as const
      }
    ];

    // Add summary cards with proper spacing
    this.addSummaryCards(summaryData);
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
      
      // Status indicator (small colored circle)
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

  private addTableSummary(dailyTotals: number[], grandTotal: number, totalRecords: number): void {
    this.currentY += 20;
    
    // Summary box
    const summaryWidth = 400;
    const summaryHeight = 120;
    const summaryX = this.pageWidth - summaryWidth - this.margin;
    
    this.doc.rect(summaryX, this.currentY, summaryWidth, summaryHeight)
      .fill('#F8FAFC')
      .stroke(this.colors.border);
    
    // Summary title
    this.doc.fontSize(12)
      .fillColor(this.colors.text.primary)
      .font('Helvetica-Bold')
      .text('Summary Totals', summaryX + 15, this.currentY + 15);
    
    // Daily totals
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    let summaryY = this.currentY + 35;
    
    this.doc.fontSize(9)
      .fillColor(this.colors.text.primary)
      .font('Helvetica');
    
    // Display daily totals in one row
    days.forEach((day, index) => {
      const x = summaryX + 15 + index * 70;
      const y = summaryY;
      
      this.doc.text(`${day}: ${dailyTotals[index].toFixed(1)}h`, x, y);
    });
    
    // Grand total
    this.doc.fontSize(11)
      .fillColor(this.colors.accent)
      .font('Helvetica-Bold')
      .text(`Grand Total: ${grandTotal.toFixed(1)} hours`, summaryX + 15, summaryY + 45);
    
    // Record count
    this.doc.fontSize(9)
      .fillColor(this.colors.text.secondary)
      .font('Helvetica')
      .text(`Total Records: ${totalRecords}`, summaryX + 15, summaryY + 65);
    
    this.currentY += summaryHeight + 30;
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
          
          // Calculate from daily hours (Mon-Fri only)
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
      totalHours: Math.round(totalHours * 100) / 100, // Round to 2 decimal places
      grandTotal: Math.round(grandTotal * 100) / 100, // Round to 2 decimal places
      totalProjects,
      totalTeams,
      totalTasks,
      avgHoursPerWeek,
      utilizationRate
    };
  }
}