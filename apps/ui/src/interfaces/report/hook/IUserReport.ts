import { ReportFilter } from '../../../api/report';

export interface UseReportFiltersOptions {
  initialFilter?: Partial<ReportFilter>;
}

export interface UseReportFiltersReturn {
  filter: ReportFilter;
  isFilterValid: boolean;
  updateFilter: (updates: Partial<ReportFilter>) => void;
  setStartDate: (date: string | undefined) => void;
  setEndDate: (date: string | undefined) => void;
  setEmployeeIds: (ids: string[]) => void;
  setSubmissionStatus: (statuses: string[]) => void;
  setApprovalStatus: (statuses: string[]) => void;
  setProjectIds: (ids: string[]) => void;
  setTeamIds: (ids: string[]) => void;
  resetFilter: () => void;
  getFilterErrors: () => string[];
}
