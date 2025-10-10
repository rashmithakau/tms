import { Timesheet } from '../../api';
import { ITimeSheetRow } from '../../entity/ITimeSheetRow';

export interface SupervisedTimesheetsReturn {
  rows: ITimeSheetRow[];
  timesheets: Timesheet[];
  supervisedProjectIds: string[];
  supervisedTeamIds: string[];
  supervisedUserIds: string[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}