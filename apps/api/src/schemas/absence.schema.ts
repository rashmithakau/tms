import { z } from 'zod';
import { absenceActivity } from '@tms/shared';

export const absenceActivitySchema = z.nativeEnum(absenceActivity);

export const createAbsenceSchema = z.object({
  date: z.string().or(z.date()),
  hoursSpent: z.number().min(0).default(0),
  absenceActivityType: absenceActivitySchema,
});
