import { useState, useCallback } from 'react';
import { ReportFilter } from '../../api/report';
import { UseReportFiltersOptions, UseReportFiltersReturn } from '../../interfaces/report/hook/IUserReport';


export const useReportFilters = (options: UseReportFiltersOptions = {}): UseReportFiltersReturn => {
  const { initialFilter = {} } = options;

  const [filter, setFilter] = useState<ReportFilter>({
    startDate: undefined,
    endDate: undefined,
    employeeIds: [],
    submissionStatus: [],
    approvalStatus: [],
    projectIds: [],
    teamIds: [],
    ...initialFilter
  });

  const updateFilter = useCallback((updates: Partial<ReportFilter>) => {
    setFilter(prev => ({ ...prev, ...updates }));
  }, []);

  const setStartDate = useCallback((date: string | undefined) => {
    updateFilter({ startDate: date });
  }, [updateFilter]);

  const setEndDate = useCallback((date: string | undefined) => {
    updateFilter({ endDate: date });
  }, [updateFilter]);

  const setEmployeeIds = useCallback((ids: string[]) => {
    updateFilter({ employeeIds: ids });
  }, [updateFilter]);

  const setSubmissionStatus = useCallback((statuses: string[]) => {
    updateFilter({ submissionStatus: statuses });
  }, [updateFilter]);

  const setApprovalStatus = useCallback((statuses: string[]) => {
    updateFilter({ approvalStatus: statuses });
  }, [updateFilter]);

  const setProjectIds = useCallback((ids: string[]) => {
    updateFilter({ projectIds: ids });
  }, [updateFilter]);

  const setTeamIds = useCallback((ids: string[]) => {
    updateFilter({ teamIds: ids });
  }, [updateFilter]);

  const resetFilter = useCallback(() => {
    setFilter({
      startDate: undefined,
      endDate: undefined,
      employeeIds: [],
      submissionStatus: [],
      approvalStatus: [],
      projectIds: [],
      teamIds: []
    });
  }, []);

  const getFilterErrors = useCallback((): string[] => {
    const errors: string[] = [];

    // Validate date range
    if (filter.startDate && filter.endDate) {
      const startDate = new Date(filter.startDate);
      const endDate = new Date(filter.endDate);
      
      if (startDate > endDate) {
        errors.push('Start date must be before or equal to end date');
      }

      // Check if date range is too large (more than 1 year)
      const oneYearInMs = 365 * 24 * 60 * 60 * 1000;
      if (endDate.getTime() - startDate.getTime() > oneYearInMs) {
        errors.push('Date range cannot exceed one year');
      }
    }

    // Validate that at least some filter criteria is provided for large reports
    if (!filter.startDate && !filter.endDate && 
        (!filter.employeeIds || filter.employeeIds.length === 0)) {
      errors.push('Please specify at least a date range or select specific employees to generate a report');
    }

    return errors;
  }, [filter]);

  const isFilterValid = getFilterErrors().length === 0;

  return {
    filter,
    isFilterValid,
    updateFilter,
    setStartDate,
    setEndDate,
    setEmployeeIds,
    setSubmissionStatus,
    setApprovalStatus,
    setProjectIds,
    setTeamIds,
    resetFilter,
    getFilterErrors
  };
};