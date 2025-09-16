import cron from 'node-cron';
import { getAllActiveUsers } from './user.service';
import {
  hasSubmittedTimesheetForWeek,
} from './timesheet.service';
import { sendEmail } from '../utils/sendEmail';
import { getTimesheetReminderTemplate } from '../utils/emailTemplates';
import { APP_ORIGIN } from '../constants/env';
import UserModel from '../models/user.model';
import { getCurrentWeekRange } from '../utils/dateRange';
import { isEmployeeAssignedToProjectOrTeam } from '../utils/assignmentUtils';
import { createTimesheetReminderNotification } from '../utils/notificationUtils';

export class CronJobService {
  public startScheduledJobs(): void {
    // '0 17 * * 5' (minute hour day month dayOfWeek)
    cron.schedule(
      '0 17 * * 5',
      async () => {
        console.log('Running weekly timesheet reminder job...');
        await this.checkMissingTimesheets();
      },
      {
        timezone: 'Asia/Colombo',
      }
    );

    console.log('Cron jobs scheduled successfully');
  }

  private async checkMissingTimesheets(): Promise<void> {
    try {
      const currentWeek = getCurrentWeekRange();
      console.log(
        `Checking timesheet submissions for week: ${currentWeek.startDate.toDateString()} - ${currentWeek.endDate.toDateString()}`
      );

      // Get all active employees
      const { users: allUsers } = await getAllActiveUsers();

      const employees = allUsers.filter((emp) => emp.role !== 'admin');
      console.log(
        `Checking ${employees.length} employees for project/team assignment and timesheet submissions`
      );

      const missingTimesheetEmployees = [];

      for (const employee of employees) {
        const userDoc = await UserModel.findOne({ email: employee.email });
        if (!userDoc) continue;

        // Check if employee is assigned to any project or team
        const isAssigned = await isEmployeeAssignedToProjectOrTeam(userDoc._id.toString());
        if (!isAssigned) {
          console.log(
            `Skipping ${employee.firstName} ${employee.lastName} - not assigned to any project or team`
          );
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
            _id: userDoc._id,
          });
        }
      }

      if (missingTimesheetEmployees.length > 0) {
        await this.sendReminders(missingTimesheetEmployees, currentWeek);
        console.log(
          `Sent timesheet reminders to ${missingTimesheetEmployees.length} employees who are assigned to projects/teams`
        );
      } else {
        console.log(
          'All assigned employees have submitted their timesheets for this week'
        );
      }
    } catch (error) {
      console.error('Error in checkMissingTimesheets:', error);
    }
  }

  private async sendReminders(
    employees: any[],
    weekRange: { startDate: Date; endDate: Date }
  ): Promise<void> {
    const promises = employees.map(async (employee) => {
      try {
        // Send in-app notification
        await createTimesheetReminderNotification(
          employee._id.toString(),
          weekRange.startDate,
          weekRange.endDate
        );

        // Send email
        await sendEmail({
          to: employee.email,
          ...getTimesheetReminderTemplate(
            employee.firstName,
            weekRange.startDate,
            weekRange.endDate,
            APP_ORIGIN
          ),
        });

        console.log(
          `Timesheet reminder sent to ${employee.firstName} ${employee.lastName} (${employee.email})`
        );
      } catch (error) {
        console.error(`Failed to send reminder to ${employee.email}:`, error);
      }
    });

    await Promise.all(promises);
  }
}
