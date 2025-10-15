import { ReportFilter } from '../../../api';

export interface UseReportFiltersOptions {
  initialFilter?: ReportFilter;
}

export interface UseReportFiltersReturn {
  currentFilter: ReportFilter;
  isFilterValid: boolean;
  resetCounter: number;
  setCurrentFilter: (filter: ReportFilter) => void;
  handleFilterChange: (filter: ReportFilter) => void;
  resetFilters: () => void;
}
