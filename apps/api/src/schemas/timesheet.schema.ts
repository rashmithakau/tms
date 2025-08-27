import { z } from 'zod';
import { TimesheetStatus } from '@tms/shared';

// --- Item schema ---
const ItemSchema = z.object({
  work: z.string().optional(), // present if Absence
  projectId: z.string().optional(), // present if Project
  hours: z.array(z.string()).length(7), // 7 days (allow empty strings for 00.00)
  descriptions: z.array(z.string()).length(7).optional().default(['','','','','','','']),
});

// --- Category schema ---
const CategorySchema = z.object({
  category: z.enum(['Project', 'Absence']),
  items: z.array(ItemSchema).min(1),
});

// --- Create Timesheet ---
export const createTimesheetSchema = z.object({
  weekStartDate: z.string().or(z.date()),
  categories: z.array(CategorySchema).min(1),
});

// --- Update Timesheet ---
export const updateTimesheetSchema = z.object({
  weekStartDate: z.string().or(z.date()).optional(),
  categories: z.array(CategorySchema).optional(),
  status: z.nativeEnum(TimesheetStatus).optional(),
});

// --- Submit Timesheets ---
export const submitTimesheetsSchema = z.object({
  ids: z.array(z.string().min(1)).min(1),
});
