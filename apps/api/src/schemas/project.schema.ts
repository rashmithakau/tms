import { z } from 'zod';
import { projectNameSchema } from './main.schema';

// Incoming payload from UI
// - billable comes as 'yes' | 'no'
// - employees is an array of user ids (strings)
export const createProjectFromUiSchema = z.object({
  projectName: projectNameSchema,
  billable: z.enum(['yes', 'no']),
  employees: z.array(z.string()).default([]),
  supervisor: z.string().nullable().optional(),
});

// Internal normalized schema used by service
export const createProjectNormalizedSchema = z.object({
  projectName: projectNameSchema,
  billable: z.boolean(),
  employees: z.array(z.string()).default([]),
  supervisor: z.string().nullable().optional(),
});

export type CreateProjectNormalized = z.infer<typeof createProjectNormalizedSchema>;