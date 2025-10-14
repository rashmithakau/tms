import { z } from 'zod';
import { otherActivity } from '@tms/shared';

export const otherActivitySchema = z.nativeEnum(otherActivity);

export const createOtherSchema = z.object({
  date: z.string().or(z.date()),
  hoursSpent: z.number().min(0).default(0),
  otherActivityType: otherActivitySchema,
});
