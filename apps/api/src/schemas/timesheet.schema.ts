import { z } from 'zod';
import { TimesheetStatus } from '@tms/shared';

export const billableTypeSchema = z.enum(['Billable', 'Non Billable']);
export const timesheetStatusSchema = z.nativeEnum(TimesheetStatus);

export const createTimesheetSchema = z.object({
  date: z.string().or(z.date()),
  projectId: z.string().min(1),
  taskTitle: z.string().min(1),
  description: z.string().optional().default(''),
  plannedHours: z.number().min(0).default(0),
  hoursSpent: z.number().min(0).default(0),
  billableType: billableTypeSchema,
});

export const updateTimesheetSchema = z.object({
  date: z.string().or(z.date()).optional(),
  projectId: z.string().min(1).optional(),
  taskTitle: z.string().min(1).optional(),
  description: z.string().optional(),
  plannedHours: z.number().min(0).optional(),
  hoursSpent: z.number().min(0).optional(),
  billableType: billableTypeSchema.optional(),
  status: timesheetStatusSchema.optional(),
});

export const submitTimesheetsSchema = z.object({
  ids: z.array(z.string().min(1)).min(1),
});



