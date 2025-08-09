import { z } from 'zod';
import { billableSchema, isScrumProjectSchema, projectNameSchema, timeSheetsSchema } from './main.schema';


export const saveSchema = z.object({
    projectName: projectNameSchema,
    billable: billableSchema,
    timeSheets: timeSheetsSchema,
    isScrumProject: isScrumProjectSchema,
})