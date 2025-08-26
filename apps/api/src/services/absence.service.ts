import Absence from '../models/absence.model';
import { absenceActivity,TimesheetStatus } from '@tms/shared';

export type CreateAbsenceParams = {
  userId: string;
  date: Date;
  hoursSpent?: number;
  absenceActivity: absenceActivity;
};


export const createAbsence = async (params: CreateAbsenceParams) => {
  const doc = await Absence.create({
    userId: params.userId,
    date: params.date,
    hoursSpent: params.hoursSpent ?? 0,
    absenceActivity: params.absenceActivity,
    status: TimesheetStatus.Draft,
  });
  return { absence: doc };
};





