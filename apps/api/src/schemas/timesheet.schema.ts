import { z } from 'zod';

export const billableTypeSchema = z.enum(['Billable', 'Non Billable']);
export const timesheetStatusSchema = z.enum(['Pending', 'Approved', 'Rejected']);

export const createTimesheetSchema = z.object({
  date: z.string().or(z.date()),
  projectName: z.string().min(1),
  taskTitle: z.string().min(1),
  description: z.string().optional().default(''),
  plannedHours: z.number().min(0).default(0),
  hoursSpent: z.number().min(0).default(0),
  billableType: billableTypeSchema,
});

export const updateTimesheetSchema = z.object({
  date: z.string().or(z.date()).optional(),
  projectName: z.string().min(1).optional(),
  taskTitle: z.string().min(1).optional(),
  description: z.string().optional(),
  plannedHours: z.number().min(0).optional(),
  hoursSpent: z.number().min(0).optional(),
  billableType: billableTypeSchema.optional(),
  status: timesheetStatusSchema.optional(),
});



