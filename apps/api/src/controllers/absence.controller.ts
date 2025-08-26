import { Request, Response } from 'express';
import catchErrors from '../utils/catchErrors';
import {  CREATED } from '../constants/http';
import { createAbsenceSchema } from '../schemas/absence.schema';
import { createAbsence } from '../services/absence.service';


export const createAbsenceHandler = catchErrors(async (req: Request, res: Response) => {
  const parsed = createAbsenceSchema.parse(req.body);
  const userId = req.userId as string;

  const result = await createAbsence({
    userId,
    date: new Date(parsed.date as any),
    absenceActivity: parsed.absenceActivityType,
  });

  return res.status(CREATED).json(result);
});


