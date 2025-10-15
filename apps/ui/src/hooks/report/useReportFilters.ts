import { useState } from 'react';
import { ReportFilter } from '../../interfaces/api';
import { 
  UseReportFiltersOptionsFromFilters as UseReportFiltersOptions, 
  UseReportFiltersReturnFromFilters as UseReportFiltersReturn 
} from '../../interfaces/report';

export const useReportFilters = ({ 
  initialFilter = {} 
}: UseReportFiltersOptions = {}): UseReportFiltersReturn => {
  const [currentFilter, setCurrentFilter] = useState<ReportFilter>(initialFilter);
  const [isFilterValid, setIsFilterValid] = useState(false);
  const [resetCounter, setResetCounter] = useState(0);

  const handleFilterChange = (filter: ReportFilter) => {
    setCurrentFilter(filter);
    const hasDateRange = !!(filter.startDate && filter.endDate);
    const hasEmployees = !!(filter.employeeIds && filter.employeeIds.length > 0);
    setIsFilterValid(hasDateRange || hasEmployees);
  };

  const resetFilters = () => {
    setCurrentFilter({});
    setIsFilterValid(false);
    setResetCounter((c) => c + 1);
  };

  return {
    currentFilter,
    isFilterValid,
    resetCounter,
    setCurrentFilter,
    handleFilterChange,
    resetFilters
  };
};