import React from 'react';
import { useReportGenerator, useReportFilters, useReportType, useReportPreview } from '../../../hooks/report';
import { ReportDashboardLayout, ReportContentLayout } from '../../templates/report';
import { ReportFilterContainer, ReportPreviewContainer } from '../report';

const ReportDashboard: React.FC = () => {
  // Custom hooks for state management
  const { reportType, setReportType } = useReportType();
  const { 
    currentFilter, 
    isFilterValid, 
    resetCounter, 
    handleFilterChange, 
    resetFilters 
  } = useReportFilters();

  const {
    isGenerating,
    supervisedEmployees,
    reportMetadata,
    isLoadingEmployees,
    isLoadingMetadata,
    error,
    generateSubmissionReport,
    generateApprovalReport,
    generateDetailedReport,
    generateTimesheetEntries,
    clearError,
  } = useReportGenerator({
    onSuccess: (filename) => {
      // Report generated successfully - filename available for use
    },
    onError: (error) => {
      // Error handled by generator hook
    },
  });

  const {
    previewRows,
    previewColumns,
    groupedPreviewData,
    isLoadingPreview,
    previewError,
  } = useReportPreview({
    reportType: reportType as any,
    filter: currentFilter,
  });

  const handleGenerateReport = async (
    type: string,
    format: 'pdf' | 'excel'
  ) => {
    clearError();

    try {
      switch (type) {
        case 'submission-status':
          await generateSubmissionReport(currentFilter, format);
          break;
        case 'approval-status':
          await generateApprovalReport(currentFilter, format);
          break;
        case 'detailed-timesheet':
          await generateDetailedReport(currentFilter, format);
          break;
        case 'timesheet-entries':
          await generateTimesheetEntries(currentFilter, format);
          break;
        default:
          throw new Error('Invalid report type');
      }
    } catch (err) {
      // Error handling is done in the hook
    }
  };

  const isLoading = isLoadingEmployees || isLoadingMetadata;

  return (
    <ReportDashboardLayout
      title="Timesheet Reports"
      buttons={[]}
    >
      <ReportContentLayout
        filterSection={
          <ReportFilterContainer
            supervisedEmployees={supervisedEmployees}
            reportMetadata={reportMetadata}
            onFilterChange={handleFilterChange}
            reportType={reportType}
            onReportTypeChange={setReportType}
            disabled={isGenerating}
            resetSignal={resetCounter}
            isGenerating={isGenerating}
            onGenerateReport={(format) => reportType && handleGenerateReport(reportType, format)}
            error={error}
            onResetFilters={resetFilters}
          />
        }
        previewSection={
          <ReportPreviewContainer
            isLoading={isLoading}
            error={error}
            supervisedEmployeesCount={supervisedEmployees.length}
            reportType={reportType}
            previewColumns={previewColumns}
            previewRows={previewRows}
            groupedPreviewData={groupedPreviewData}
            onClearError={clearError}
          />
        }
      />
    </ReportDashboardLayout>
  );
};

export default ReportDashboard;