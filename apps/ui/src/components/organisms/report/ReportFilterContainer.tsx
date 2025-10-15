import React from 'react';
import { Box } from '@mui/material';
import { TwoColumnReportLayout } from '../../templates/report';
import ReportFilterForm from './ReportFilterForm';
import { ReportInformationPanel } from '../../molecules/report';
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
    <TwoColumnReportLayout
      left={
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
      }
      right={
        <ReportInformationPanel />
      }
    />
  );
};

export default ReportFilterContainer;
