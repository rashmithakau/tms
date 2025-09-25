import React from 'react';
import { Box, Button, ButtonGroup, Typography } from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';
import { useReportFilters } from '../../../hooks/report/useReportFilters';
import { IReportFilterForm } from '../../../interfaces/report/filter';
import EmployeeSelect from '../../molecules/report/filter/EmployeeSelect';
import ReportLayout from '../../templates/report/ReportLayout';
import ReportGenerationPanel from '../../molecules/report/generationpanel/ReportGenerationPanel';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import { useTheme } from '@mui/material/styles';
import ReportTypeSelect from '../../molecules/report/filter/ReportTypeSelect';
import DateRangePicker from '../../molecules/report/filter/DateRangePicker';

const ReportFilterForm: React.FC<IReportFilterForm> = ({
  supervisedEmployees,
  onFilterChange,
  reportType = '',
  onReportTypeChange,
  disabled = false,
  resetSignal,
  isGenerating,
  reportMetadata,
  onGenerateReport,
  error,
  onResetFilters,
}) => {
  const {
    filter,
    isFilterValid,
    setStartDate,
    setEndDate,
    setEmployeeIds,
    resetFilter,
    getFilterErrors,
  } = useReportFilters();

  React.useEffect(() => {
    onFilterChange(filter);
  }, [filter, onFilterChange]);

  const handleStartDateChange = (date: Dayjs | null) => {
    setStartDate(date ? date.format('YYYY-MM-DD') : undefined);
  };
  const handleEndDateChange = (date: Dayjs | null) => {
    setEndDate(date ? date.format('YYYY-MM-DD') : undefined);
  };
  const handleEmployeeChange = (ids: string[]) => {
    setEmployeeIds(ids);
  };

  const filterErrors = getFilterErrors();

  React.useEffect(() => {
    if (resetSignal !== undefined) {
      resetFilter();
    }
  }, [resetSignal]);
  const theme = useTheme();
  const updateDateRange = (start: Dayjs, end: Dayjs) => {
    setStartDate(start.format('YYYY-MM-DD'));
    setEndDate(end.format('YYYY-MM-DD'));
  };

  return (
    <ReportLayout
      title="Report Filters"
      disabled={disabled}
      noBorder
      action={
        <Box display="flex" alignItems="center" gap={2}>
          <Button
            startIcon={<RestartAltRoundedIcon />}
            variant="contained"
            size="small"
            onClick={resetFilter}
            disabled={disabled}
          >
            Reset
          </Button>
          <ButtonGroup size="small" variant="outlined" disabled={disabled}>
            <Button
              onClick={() => {
                const today = dayjs();
                updateDateRange(today, today);
              }}
            >
              Today
            </Button>
            <Button
              onClick={() => {
                const start = dayjs().startOf('week');
                const end = dayjs().endOf('week');
                updateDateRange(start, end);
              }}
            >
              This Week
            </Button>
            <Button
              onClick={() => {
                const end = dayjs();
                const start = end.subtract(6, 'day');
                updateDateRange(start, end);
              }}
            >
              Last 7 Days
            </Button>
            <Button
              onClick={() => {
                const start = dayjs().startOf('month');
                const end = dayjs().endOf('month');
                updateDateRange(start, end);
              }}
            >
              This Month
            </Button>
          </ButtonGroup>
        </Box>
      }
    >
      <Box display="flex" flexDirection="column" gap={2}>
        <Box>
          <DateRangePicker
            startDate={filter.startDate}
            endDate={filter.endDate}
            onStartDateChange={handleStartDateChange}
            onEndDateChange={handleEndDateChange}
            disabled={disabled}
          />
        </Box>
        <Box display="flex" flexDirection="row" gap={2}>
          <Box sx={{ flex: 1 }}>
            <EmployeeSelect
              employees={supervisedEmployees}
              selectedIds={filter.employeeIds || []}
              onChange={handleEmployeeChange}
              disabled={disabled}
            />
            {(!filter.employeeIds || filter.employeeIds.length === 0) && (
              <Typography
                variant="caption"
                sx={{ color: theme.palette.text.secondary }}
              >
                Optional: select one or more employees
              </Typography>
            )}
          </Box>
          <ReportTypeSelect
            reportType={reportType}
            onReportTypeChange={onReportTypeChange}
            disabled={disabled}
          />
        </Box>
        <Box display="flex" flexDirection="column" gap={2}>
          {reportMetadata ? (
            <ReportGenerationPanel
              reportMetadata={reportMetadata}
              isFilterValid={isFilterValid}
              isGenerating={Boolean(isGenerating)}
              onGenerateReport={(fmt) => onGenerateReport && onGenerateReport(fmt)}
              error={error}
            />
          ) : null}
        </Box>
      </Box>
    </ReportLayout>
  );
};

export default ReportFilterForm;
