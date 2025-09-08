import { useMemo, useState } from 'react';
import { Dayjs } from 'dayjs';
import { TimesheetStatus } from '@tms/shared';
import { TimeSheetRow } from '../types/timesheet';

export const useTimesheetFiltering = (rows: TimeSheetRow[]) => {
  const [statusFilter, setStatusFilter] = useState<TimesheetStatus | 'All'>('All');
  const [dateRangeFilter, setDateRangeFilter] = useState<'All' | 'Today' | 'This Week' | 'This Month'>('All');
  const [specificDay, setSpecificDay] = useState<Dayjs | null>(null);
  const [specificMonth, setSpecificMonth] = useState<Dayjs | null>(null);
  const [specificYear, setSpecificYear] = useState<Dayjs | null>(null);

  const handleFilterByDate = (range: 'All' | 'Today' | 'This Week' | 'This Month') => {
    setDateRangeFilter(range);
  };

  const handleFilterByStatus = (status: TimesheetStatus | 'All') => {
    setStatusFilter(status);
  };

  const clearFilters = () => {
    setDateRangeFilter('All');
    setStatusFilter('All');
    setSpecificDay(null);
    setSpecificMonth(null);
    setSpecificYear(null);
  };

  const filteredRows = useMemo(() => {
    let filtered = rows.filter(r => r.status !== TimesheetStatus.Draft);

    // Filter by status
    if (statusFilter !== 'All') {
      filtered = filtered.filter((row) => row.status === statusFilter);
    }

    // Filter by date range
    if (dateRangeFilter !== 'All') {
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

      switch (dateRangeFilter) {
        case 'Today':
          filtered = filtered.filter((row) => {
            const rowDate = new Date(row.date);
            return rowDate >= todayStart && rowDate < todayEnd;
          });
          break;
        case 'This Week':
          const weekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
          const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter((row) => {
            const rowDate = new Date(row.date);
            return rowDate >= weekStart && rowDate < weekEnd;
          });
          break;
        case 'This Month':
          const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
          const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 1);
          filtered = filtered.filter((row) => {
            const rowDate = new Date(row.date);
            return rowDate >= monthStart && rowDate < monthEnd;
          });
          break;
      }
    }

    return filtered;
  }, [rows, statusFilter, dateRangeFilter, specificDay, specificMonth, specificYear]);

  // Group timesheets by employee for the employee table
  const employeeGroups = useMemo(() => {
    const map = new Map<string, { employee: NonNullable<TimeSheetRow['employee']>, timesheets: TimeSheetRow[] }>();
    for (const r of filteredRows) {
      if (!r.employee) continue;
      const id = r.employee._id;
      if (!map.has(id)) {
        map.set(id, { employee: r.employee, timesheets: [] });
      }
      map.get(id)!.timesheets.push(r);
    }
    const groups = Array.from(map.values());
    return groups;
  }, [filteredRows]);

  const pendingIdsInFiltered = filteredRows
    .filter((row) => row.status === TimesheetStatus.Pending)
    .map((row) => row._id);

  return {
    statusFilter,
    dateRangeFilter,
    specificDay,
    specificMonth,
    specificYear,
    filteredRows,
    employeeGroups,
    pendingIdsInFiltered,
    handleFilterByDate,
    handleFilterByStatus,
    clearFilters,
    setSpecificDay,
    setSpecificMonth,
    setSpecificYear,
  };
};