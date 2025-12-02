import React from 'react';
import { Box } from '@mui/material';
import ReportFilterForm from './ReportFilterForm';
import { ReportFilterContainerProps } from '../../../interfaces/report/reportpreview';

const ReportFilterContainer: React.FC<ReportFilterContainerProps> = ({
  supervisedEmployees,
  reportMetadata,
  onFilterChange,
  reportType,
  onReportTypeChange,
  disabled,
  resetSignal,
  isGenerating,
  onGenerateReport,
  error,
  onResetFilters
}) => {
  return (
    <Box>
      <ReportFilterForm
        supervisedEmployees={supervisedEmployees}
        reportMetadata={reportMetadata}
        onFilterChange={onFilterChange}
        reportType={reportType as any}
        onReportTypeChange={onReportTypeChange}
        disabled={disabled}
        resetSignal={resetSignal}
        isGenerating={isGenerating}
        onGenerateReport={onGenerateReport}
        error={error}
        onResetFilters={onResetFilters}
      />
    </Box>
  );
};

export default ReportFilterContainer;
