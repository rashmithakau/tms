import cron from 'node-cron';
import { getAllActiveUsers } from './user.service';
import { hasSubmittedTimesheetForWeek, createTimesheetReminderNotification } from './timesheet.service';
import { sendEmail } from '../utils/sendEmail';
import { getTimesheetReminderTemplate } from '../utils/emailTemplates';
import { APP_ORIGIN } from '../constants/env';
import UserModel from '../models/user.model';
import TeamModel from '../models/team.model';
import ProjectModel from '../models/project.model';

export class CronJobService {
  public startScheduledJobs(): void {
    // Schedule job to run every Friday at 5:00 PM
    // Cron format: '0 17 * * 5' (minute hour day month dayOfWeek)
    // 5 = Friday (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    cron.schedule('0 17 * * 5', async () => {
      console.log('Running weekly timesheet reminder job...');
      await this.checkMissingTimesheets();
    }, {
      timezone: "Asia/Colombo" // Adjust timezone as needed
    });

    // For testing - uncomment the line below to run every minute
    // cron.schedule('* * * * *', async () => {
    //   console.log('Running test timesheet reminder job...');
    //   await this.checkMissingTimesheets();
    // });

    console.log('Cron jobs scheduled successfully');
  }

  private async checkMissingTimesheets(): Promise<void> {
    try {
      const currentWeek = this.getCurrentWeekRange();
      console.log(`Checking timesheet submissions for week: ${currentWeek.startDate.toDateString()} - ${currentWeek.endDate.toDateString()}`);
      
      // Get all active employees
      const { users: allUsers } = await getAllActiveUsers();
      
      // Filter out admins and get full user objects with _id
      const employees = allUsers.filter(emp => emp.role !== 'admin');
      console.log(`Checking ${employees.length} employees for project/team assignment and timesheet submissions`);
      
      const missingTimesheetEmployees = [];

      for (const employee of employees) {
        // We need to get the _id from the original user document
        // Since omitPassword() removes _id, let's get users directly from model
        const userDoc = await UserModel.findOne({ email: employee.email });
        if (!userDoc) continue;

        // Check if employee is assigned to any project or team
        const isAssigned = await this.isEmployeeAssignedToProjectOrTeam(userDoc._id.toString());
        if (!isAssigned) {
          console.log(`Skipping ${employee.firstName} ${employee.lastName} - not assigned to any project or team`);
          continue;
        }

        // Check if employee has submitted timesheet for current week
        const hasSubmitted = await hasSubmittedTimesheetForWeek(
          userDoc._id.toString(),
          currentWeek.startDate,
          currentWeek.endDate
        );

        if (!hasSubmitted) {
          missingTimesheetEmployees.push({
            ...employee,
            _id: userDoc._id
          });
        }
      }

      if (missingTimesheetEmployees.length > 0) {
        await this.sendReminders(missingTimesheetEmployees, currentWeek);
        console.log(`Sent timesheet reminders to ${missingTimesheetEmployees.length} employees who are assigned to projects/teams`);
      } else {
        console.log('All assigned employees have submitted their timesheets for this week');
      }

    } catch (error) {
      console.error('Error in checkMissingTimesheets:', error);
    }
  }

  private getCurrentWeekRange(): { startDate: Date, endDate: Date } {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    
    // Calculate start of week (Monday)
    const startDate = new Date(now);
    const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    startDate.setDate(now.getDate() + daysToMonday);
    startDate.setUTCHours(0, 0, 0, 0);

    // Calculate end of week (Friday)
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 4); // Friday
    endDate.setUTCHours(23, 59, 59, 999);

    return { startDate, endDate };
  }

  private async isEmployeeAssignedToProjectOrTeam(userId: string): Promise<boolean> {
    try {
      // Check if user is assigned to any active project
      const assignedToProject = await ProjectModel.findOne({
        employees: userId,
        status: true // Only active projects
      });

      if (assignedToProject) {
        return true;
      }

      // Check if user is a member of any active team
      const assignedToTeam = await TeamModel.findOne({
        members: userId,
        status: true // Only active teams
      });

      if (assignedToTeam) {
        return true;
      }

      // Check if user is a supervisor of any active team
      const supervisorOfTeam = await TeamModel.findOne({
        supervisor: userId,
        status: true // Only active teams
      });

      if (supervisorOfTeam) {
        return true;
      }

      // Check if user is a supervisor of any active project
      const supervisorOfProject = await ProjectModel.findOne({
        supervisor: userId,
        status: true // Only active projects
      });

      if (supervisorOfProject) {
        return true;
      }

      return false;
    } catch (error) {
      console.error(`Error checking project/team assignment for user ${userId}:`, error);
      return false; // In case of error, don't send reminder to be safe
    }
  }

  private async sendReminders(
    employees: any[], 
    weekRange: { startDate: Date, endDate: Date }
  ): Promise<void> {
    const promises = employees.map(async (employee) => {
      try {
        // Send in-app notification
        await createTimesheetReminderNotification(
          employee._id.toString(),
          weekRange.startDate,
          weekRange.endDate
        );

        // Send email using your existing email system
        await sendEmail({
          to: employee.email,
          ...getTimesheetReminderTemplate(
            employee.firstName,
            weekRange.startDate,
            weekRange.endDate,
            APP_ORIGIN
          ),
        });

        console.log(`Timesheet reminder sent to ${employee.firstName} ${employee.lastName} (${employee.email})`);
      } catch (error) {
        console.error(`Failed to send reminder to ${employee.email}:`, error);
      }
    });

    await Promise.all(promises);
  }
}
