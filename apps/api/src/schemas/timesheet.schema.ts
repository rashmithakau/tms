import { z } from 'zod';
import { TimesheetStatus } from '@tms/shared';

const ItemSchema = z.object({
  work: z.string().optional(), 
  projectId: z.string().optional(),
  teamId: z.string().optional(), 
  hours: z.array(z.string()).length(7), 
  descriptions: z.array(z.string()).length(7).optional().default(['','','','','','','']),
});

const CategorySchema = z.object({
  category: z.enum(['Project', 'Team', 'Absence']),
  items: z.array(ItemSchema).min(1),
});

export const createTimesheetSchema = z.object({
  weekStartDate: z.string().or(z.date()),
  data: z.array(CategorySchema).min(0).default([]),
});

export const updateTimesheetSchema = z.object({
  weekStartDate: z.string().or(z.date()).optional(),
  data: z.array(CategorySchema).optional(),
  status: z.nativeEnum(TimesheetStatus).optional(),
  rejectionReason: z.string().optional(),
});

export const submitTimesheetsSchema = z.object({
  ids: z.array(z.string().min(1)).min(1),
});

export const updateDailyTimesheetStatusSchema = z.object({
  timesheetId: z.string(),
  categoryIndex: z.number(),
  itemIndex: z.number(),
  dayIndices: z.array(z.number()),
  status: z.nativeEnum(TimesheetStatus),
  rejectionReason: z.string().optional(),
});

export const batchUpdateDailyTimesheetStatusSchema = z.object({
  updates: z.array(updateDailyTimesheetStatusSchema),
});
