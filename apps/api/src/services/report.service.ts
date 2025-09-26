import { TimesheetStatus } from '@tms/shared';
import { appAssert } from '../utils/validation';
import { UNAUTHORIZED, BAD_REQUEST } from '../constants/http';
import { Timesheet } from '../models/timesheet.model';
import ProjectModel from '../models/project.model';
import TeamModel from '../models/team.model';
import UserModel from '../models/user.model';
import { 
  IReportFilter, 
  ITimesheetReportData, 
  ISubmissionStatusReport, 
  IApprovalStatusReport,
  ReportType,
  ReportFormat
} from '../interfaces/report';
import { ExcelReportGenerator } from '../utils/report/excel';
import { PDFReportGenerator } from '../utils/report/pdf';
import { getSupervisedUserIds } from '../utils/data';

export class ReportService {
  
  static async generateSubmissionStatusReport(
    supervisorId: string,
    filter: IReportFilter,
    format: ReportFormat
  ): Promise<Buffer> {
    // Verify supervisor has access to employees
    const supervisedUserIds = await getSupervisedUserIds(supervisorId);
    appAssert(
      supervisedUserIds.length > 0,
      UNAUTHORIZED,
      'You have no supervised employees to generate reports for'
    );

    // Build query filters
    const query: any = {
      userId: { $in: supervisedUserIds }
    };

    if (filter.startDate || filter.endDate) {
      query.weekStartDate = {};
      if (filter.startDate) {
        query.weekStartDate.$gte = new Date(filter.startDate);
      }
      if (filter.endDate) {
        query.weekStartDate.$lte = new Date(filter.endDate);
      }
    }

    if (filter.employeeIds && filter.employeeIds.length > 0) {
      query.userId = { $in: filter.employeeIds.filter(id => supervisedUserIds.includes(id)) };
    }

    // Get all supervised users for the date range
    const users = await UserModel.find({
      _id: { $in: supervisedUserIds },
      status: true
    }).select('firstName lastName email');

    // Get timesheets
    const timesheets = await Timesheet.find(query)
      .populate('userId', 'firstName lastName email')
      .sort({ weekStartDate: -1 });

    // Process data for submission status report
    const reportData: ISubmissionStatusReport[] = [];
    const weeklySubmissions = new Map<string, Map<string, any>>();

    // Group timesheets by user and week
    timesheets.forEach(timesheet => {
      const userId = timesheet.userId._id.toString();
      const weekKey = timesheet.weekStartDate.toISOString().split('T')[0];
      
      if (!weeklySubmissions.has(userId)) {
        weeklySubmissions.set(userId, new Map());
      }
      
      weeklySubmissions.get(userId)!.set(weekKey, {
        timesheet,
        submitted: timesheet.status !== TimesheetStatus.Draft,
        submissionDate: timesheet.updatedAt || timesheet.createdAt
      });
    });

    // Generate report for each user and applicable weeks
    users.forEach(user => {
      const userId = user._id.toString();
      const userSubmissions = weeklySubmissions.get(userId) || new Map();
      
      // If filtering by date range, check each week in range
      if (filter.startDate && filter.endDate) {
        const startDate = new Date(filter.startDate);
        const endDate = new Date(filter.endDate);
        const currentWeek = new Date(startDate);
        
        while (currentWeek <= endDate) {
          const weekKey = currentWeek.toISOString().split('T')[0];
          const submission = userSubmissions.get(weekKey);
          
          const totalHours = submission?.timesheet 
            ? this.calculateTotalHours(submission.timesheet) 
            : 0;
          
          let submissionStatus: 'Submitted' | 'Missing' | 'Late' = 'Missing';
          let submissionDate: Date | undefined;
          let daysLate = 0;
          
          if (submission?.submitted) {
            submissionDate = submission.submissionDate;
            const expectedSubmissionDate = new Date(currentWeek);
            expectedSubmissionDate.setDate(expectedSubmissionDate.getDate() + 7); // Due at end of week
            
            if (submissionDate <= expectedSubmissionDate) {
              submissionStatus = 'Submitted';
            } else {
              submissionStatus = 'Late';
              daysLate = Math.ceil((submissionDate.getTime() - expectedSubmissionDate.getTime()) / (1000 * 60 * 60 * 24));
            }
          }
          
          reportData.push({
            employeeId: userId,
            employeeName: `${user.firstName} ${user.lastName}`,
            employeeEmail: user.email,
            weekStartDate: new Date(currentWeek),
            submissionStatus,
            submissionDate,
            daysLate: daysLate > 0 ? daysLate : undefined,
            totalHours
          });
          
          currentWeek.setDate(currentWeek.getDate() + 7);
        }
      } else {
        // No date filter - show all available timesheets
        userSubmissions.forEach((submission, weekKey) => {
          const totalHours = this.calculateTotalHours(submission.timesheet);
          
          reportData.push({
            employeeId: userId,
            employeeName: `${user.firstName} ${user.lastName}`,
            employeeEmail: user.email,
            weekStartDate: submission.timesheet.weekStartDate,
            submissionStatus: submission.submitted ? 'Submitted' : 'Missing',
            submissionDate: submission.submitted ? submission.submissionDate : undefined,
            totalHours
          });
        });
      }
    });

    // Filter by submission status if specified
    let filteredData = reportData;
    if (filter.submissionStatus && filter.submissionStatus.length > 0) {
      const allowedStatuses = filter.submissionStatus.map(status => {
        switch (status) {
          case TimesheetStatus.Pending:
          case TimesheetStatus.Approved:
            return 'Submitted';
          case TimesheetStatus.Draft:
            return 'Missing';
          default:
            return status;
        }
      });
      filteredData = reportData.filter(item => 
        allowedStatuses.includes(item.submissionStatus as any)
      );
    }

    // Generate report based on format
    if (format === ReportFormat.EXCEL) {
      const generator = new ExcelReportGenerator();
      generator.generateSubmissionStatusReport(filteredData, {
        startDate: filter.startDate?.toString(),
        endDate: filter.endDate?.toString()
      });
      return await generator.generateBuffer();
    } else {
      const generator = new PDFReportGenerator();
      generator.generateSubmissionStatusReport(filteredData, {
        startDate: filter.startDate?.toString(),
        endDate: filter.endDate?.toString()
      });
      return await generator.generateBuffer();
    }
  }

  
  static async generateApprovalStatusReport(
    supervisorId: string,
    filter: IReportFilter,
    format: ReportFormat
  ): Promise<Buffer> {
    // Verify supervisor has access
    const supervisedUserIds = await getSupervisedUserIds(supervisorId);
    appAssert(
      supervisedUserIds.length > 0,
      UNAUTHORIZED,
      'You have no supervised employees to generate reports for'
    );

    // Build query
    const query: any = {
      userId: { $in: supervisedUserIds },
      status: { $ne: TimesheetStatus.Draft } // Only submitted timesheets
    };

    if (filter.startDate || filter.endDate) {
      query.weekStartDate = {};
      if (filter.startDate) {
        query.weekStartDate.$gte = new Date(filter.startDate);
      }
      if (filter.endDate) {
        query.weekStartDate.$lte = new Date(filter.endDate);
      }
    }

    if (filter.employeeIds && filter.employeeIds.length > 0) {
      query.userId = { $in: filter.employeeIds.filter(id => supervisedUserIds.includes(id)) };
    }

    if (filter.approvalStatus && filter.approvalStatus.length > 0) {
      query.status = { $in: filter.approvalStatus };
    }

    // Get timesheets with user details
    const timesheets = await Timesheet.find(query)
      .populate('userId', 'firstName lastName email')
      .sort({ weekStartDate: -1 });

    // Process data for approval status report
    const reportData: IApprovalStatusReport[] = timesheets.map(timesheet => {
      const user = timesheet.userId as any;
      return {
        employeeId: user._id.toString(),
        employeeName: `${user.firstName} ${user.lastName}`,
        employeeEmail: user.email,
        weekStartDate: timesheet.weekStartDate,
        timesheetId: timesheet._id.toString(),
        submissionDate: timesheet.updatedAt || timesheet.createdAt,
        approvalStatus: timesheet.status,
        approvalDate: timesheet.status !== TimesheetStatus.Pending ? (timesheet.updatedAt || timesheet.createdAt) : undefined,
        rejectionReason: timesheet.rejectionReason,
        totalHours: this.calculateTotalHours(timesheet)
      };
    });

    // Generate report based on format
    if (format === ReportFormat.EXCEL) {
      const generator = new ExcelReportGenerator();
      generator.generateApprovalStatusReport(reportData, {
        startDate: filter.startDate?.toString(),
        endDate: filter.endDate?.toString()
      });
      return await generator.generateBuffer();
    } else {
      const generator = new PDFReportGenerator();
      generator.generateApprovalStatusReport(reportData, {
        startDate: filter.startDate?.toString(),
        endDate: filter.endDate?.toString()
      });
      return await generator.generateBuffer();
    }
  }

  
    //Generate detailed timesheet report
  static async generateDetailedTimesheetReport(
    supervisorId: string,
    filter: IReportFilter,
    format: ReportFormat
  ): Promise<Buffer> {
    // Verify supervisor has access
    const supervisedUserIds = await getSupervisedUserIds(supervisorId);
    appAssert(
      supervisedUserIds.length > 0,
      UNAUTHORIZED,
      'You have no supervised employees to generate reports for'
    );

    // Build query
    const query: any = {
      userId: { $in: supervisedUserIds }
    };

    if (filter.startDate || filter.endDate) {
      query.weekStartDate = {};
      if (filter.startDate) {
        query.weekStartDate.$gte = new Date(filter.startDate);
      }
      if (filter.endDate) {
        query.weekStartDate.$lte = new Date(filter.endDate);
      }
    }

    if (filter.employeeIds && filter.employeeIds.length > 0) {
      query.userId = { $in: filter.employeeIds.filter(id => supervisedUserIds.includes(id)) };
    }

    if (filter.approvalStatus && filter.approvalStatus.length > 0) {
      query.status = { $in: filter.approvalStatus };
    }

    // Get timesheets with user details
    const timesheets = await Timesheet.find(query)
      .populate('userId', 'firstName lastName email')
      .sort({ weekStartDate: -1 });

    // Get project and team names for the timesheets
    const projectIds = new Set<string>();
    const teamIds = new Set<string>();

    timesheets.forEach(timesheet => {
      timesheet.data?.forEach(category => {
        category.items?.forEach(item => {
          if (item.projectId) projectIds.add(item.projectId);
          if (item.teamId) teamIds.add(item.teamId);
        });
      });
    });

    const projects = await ProjectModel.find({ _id: { $in: Array.from(projectIds) } });
    const teams = await TeamModel.find({ _id: { $in: Array.from(teamIds) } });

    const projectMap = new Map(projects.map(p => [p._id.toString(), p.projectName]));
    const teamMap = new Map(teams.map(t => [t._id.toString(), t.teamName]));

    // Process data for detailed report
    const reportData: ITimesheetReportData[] = timesheets.map(timesheet => {
      const user = timesheet.userId as any;
      
      const categories = timesheet.data?.map(category => ({
        category: category.category,
        items: category.items?.map(item => ({
          work: item.work,
          projectId: item.projectId,
          projectName: item.projectId ? projectMap.get(item.projectId) : undefined,
          teamId: item.teamId,
          teamName: item.teamId ? teamMap.get(item.teamId) : undefined,
          dailyHours: item.hours || Array(7).fill('0'),
          dailyDescriptions: item.descriptions || Array(7).fill(''),
          dailyStatus: item.dailyStatus || Array(7).fill(TimesheetStatus.Draft),
          totalHours: this.calculateItemTotalHours(item.hours || [])
        })) || []
      })) || [];

      return {
        employeeId: user._id.toString(),
        employeeName: `${user.firstName} ${user.lastName}`,
        employeeEmail: user.email,
        weekStartDate: timesheet.weekStartDate,
        timesheetId: timesheet._id.toString(),
        status: timesheet.status,
        submissionDate: timesheet.status !== TimesheetStatus.Draft ? (timesheet.updatedAt || timesheet.createdAt) : undefined,
        approvalDate: timesheet.status === TimesheetStatus.Approved ? (timesheet.updatedAt || timesheet.createdAt) : undefined,
        rejectionReason: timesheet.rejectionReason,
        categories,
        totalHours: this.calculateTotalHours(timesheet)
      };
    });

    // Generate report based on format
    if (format === ReportFormat.EXCEL) {
      const generator = new ExcelReportGenerator();
      generator.generateDetailedTimesheetReport(reportData, {
        startDate: filter.startDate?.toString(),
        endDate: filter.endDate?.toString()
      });
      return await generator.generateBuffer();
    } else {
      const generator = new PDFReportGenerator();
      generator.generateDetailedTimesheetReport(reportData, {
        startDate: filter.startDate?.toString(),
        endDate: filter.endDate?.toString()
      });
      return await generator.generateBuffer();
    }
  }

  
   // Get available employees for a supervisor
   
  static async getSupervisedEmployees(supervisorId: string) {
    const supervisedUserIds = await getSupervisedUserIds(supervisorId);
    
    return await UserModel.find({
      _id: { $in: supervisedUserIds },
      status: true
    }).select('firstName lastName email').sort({ firstName: 1, lastName: 1 });
  }

  
    //Calculate total hours for a timesheet
   
  private static calculateTotalHours(timesheet: any): number {
    let total = 0;
    timesheet.data?.forEach((category: any) => {
      category.items?.forEach((item: any) => {
        if (item.hours) {
          total += this.calculateItemTotalHours(item.hours);
        }
      });
    });
    return total;
  }

  
   //Calculate total hours for a timesheet item
   
  private static calculateItemTotalHours(hours: string[]): number {
    return hours.reduce((total, hour) => {
      const parsed = parseFloat(hour) || 0;
      return total + parsed;
    }, 0);
  }
}
