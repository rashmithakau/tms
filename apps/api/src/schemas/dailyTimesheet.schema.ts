import { z } from 'zod';
import { TimesheetStatus } from '@tms/shared';

export const createDailyTimesheetSchema = z.object({
  date: z.string().or(z.date()),
  projectId: z.string().optional(),
  projectName: z.string().min(1, 'Project name is required'),
  teamId: z.string().optional(),
  teamName: z.string().optional(),
  taskTitle: z.string().min(1, 'Task title is required'),
  description: z.string().optional(),
  plannedHours: z.number().min(0).max(24).optional(),
  hoursSpent: z.number().min(0.25, 'Hours must be at least 0.25').max(24, 'Hours cannot exceed 24'),
  billableType: z.enum(['Billable', 'Non-Billable']),
});

export const updateDailyTimesheetSchema = z.object({
  date: z.string().or(z.date()).optional(),
  projectId: z.string().optional(),
  projectName: z.string().min(1).optional(),
  teamId: z.string().optional(),
  teamName: z.string().optional(),
  taskTitle: z.string().min(1).optional(),
  description: z.string().optional(),
  plannedHours: z.number().min(0).max(24).optional(),
  hoursSpent: z.number().min(0.25).max(24).optional(),
  billableType: z.enum(['Billable', 'Non-Billable']).optional(),
  status: z.nativeEnum(TimesheetStatus).optional(),
  rejectionReason: z.string().optional(),
});

export const listDailyTimesheetsSchema = z.object({
  startDate: z.string().or(z.date()).optional(),
  endDate: z.string().or(z.date()).optional(),
  status: z.nativeEnum(TimesheetStatus).optional(),
  projectId: z.string().optional(),
});

export const submitDailyTimesheetsSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, 'At least one timesheet ID is required'),
});

export const bulkUpdateStatusSchema = z.object({
  ids: z.array(z.string().min(1)).min(1),
  status: z.nativeEnum(TimesheetStatus),
  rejectionReason: z.string().optional(),
});
