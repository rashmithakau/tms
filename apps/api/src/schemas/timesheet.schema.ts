import { z } from 'zod';
import { TimesheetStatus } from '@tms/shared';

// --- Item schema ---
const ItemSchema = z.object({
  work: z.string().optional(), // present if Absence
  projectId: z.string().optional(), // present if Project
  teamId: z.string().optional(), // present if Team
  hours: z.array(z.string()).length(7), // 7 days (allow empty strings for 00.00)
  descriptions: z.array(z.string()).length(7).optional().default(['','','','','','','']),
});

// --- Category schema ---
const CategorySchema = z.object({
  category: z.enum(['Project', 'Team', 'Absence']),
  items: z.array(ItemSchema).min(1),
});

// --- Create Timesheet ---
export const createTimesheetSchema = z.object({
  weekStartDate: z.string().or(z.date()),
  data: z.array(CategorySchema).min(0).default([]),
});

// --- Update Timesheet ---
export const updateTimesheetSchema = z.object({
  weekStartDate: z.string().or(z.date()).optional(),
  data: z.array(CategorySchema).optional(),
  status: z.nativeEnum(TimesheetStatus).optional(),
  rejectionReason: z.string().optional(),
});

// --- Submit Timesheets ---
export const submitTimesheetsSchema = z.object({
  ids: z.array(z.string().min(1)).min(1),
});

// --- Daily Status Update Schema ---
export const updateDailyTimesheetStatusSchema = z.object({
  timesheetId: z.string(),
  categoryIndex: z.number(),
  itemIndex: z.number(),
  dayIndices: z.array(z.number()),
  status: z.nativeEnum(TimesheetStatus),
  rejectionReason: z.string().optional(),
});

// --- Batch Daily Status Update Schema ---
export const batchUpdateDailyTimesheetStatusSchema = z.object({
  updates: z.array(updateDailyTimesheetStatusSchema),
});
