import API from '../config/apiClient';
import { absenceActivity} from '@tms/shared';

export type Absence = {
  date: string;
  hoursSpent?: number;
  absenceActivity: absenceActivity;
};

export const createAbsence = async (data: Absence) => {
    return API.post('/api/absences', data);
  };

