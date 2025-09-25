import React, { useState } from 'react';
import { Box, Typography, Paper, Alert, Skeleton, Divider } from '@mui/material';
import { Assessment as ReportIcon } from '@mui/icons-material';
import { useReportGenerator } from '../../../hooks/report/useReportGenerator';
import ReportFilterForm from './ReportFilterForm';
import ReportPreviewTable from '../../molecules/report/table/ReportPreviewTable';
import {
  previewSubmissionStatus,
  previewApprovalStatus,
  previewDetailedTimesheet,
} from '../../../api/report';
import { ReportFilter } from '../../../interfaces/api';
import { TableWindowLayout } from '../../templates';
import { TwoColumnReportLayout } from '../../templates/report';
import { useTheme } from '@mui/material/styles';
import { ReportInformationPanel } from '../../molecules/report';

const ReportDashboard: React.FC = () => {
  const [currentFilter, setCurrentFilter] = useState<ReportFilter>({});
  const [resetCounter, setResetCounter] = useState(0);
  const [isFilterValid, setIsFilterValid] = useState(false);
  const [reportType, setReportType] = useState<
    'submission-status' | 'approval-status' | 'detailed-timesheet'
  >('submission-status');

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
    clearError,
  } = useReportGenerator({
    onSuccess: (filename) => {
     
    },
    onError: (error) => {
      
    },
  });

  const handleFilterChange = (filter: ReportFilter) => {
    setCurrentFilter(filter);
    const hasDateRange = !!(filter.startDate && filter.endDate);
    const hasEmployees = !!(
      filter.employeeIds && filter.employeeIds.length > 0
    );
    setIsFilterValid(hasDateRange || hasEmployees);
  };

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
        default:
          throw new Error('Invalid report type');
      }
    } catch (err) {
     
    }
  };

  const isLoading = isLoadingEmployees || isLoadingMetadata;

  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [previewColumns, setPreviewColumns] = useState<
    { key: string; header: string }[]
  >([]);

  const loadPreview = async (
    type: 'submission-status' | 'approval-status' | 'detailed-timesheet',
    filter: ReportFilter
  ) => {
    try {
      if (type === 'submission-status') {
        const rows = await previewSubmissionStatus(filter);
        setPreviewColumns([
          { key: 'employeeName', header: 'Employee' },
          { key: 'employeeEmail', header: 'Email' },
          { key: 'weekStartDate', header: 'Week Start' },
          { key: 'submissionStatus', header: 'Submission' },
        ]);
        setPreviewRows(rows);
      } else if (type === 'approval-status') {
        const rows = await previewApprovalStatus(filter);
        setPreviewColumns([
          { key: 'employeeName', header: 'Employee' },
          { key: 'weekStartDate', header: 'Week Start' },
          { key: 'approvalStatus', header: 'Approval' },
        ]);
        setPreviewRows(rows);
      } else {
        const rows = await previewDetailedTimesheet(filter);
        setPreviewColumns([
          { key: 'employeeName', header: 'Employee' },
          { key: 'employeeEmail', header: 'Email' },
          { key: 'weekStartDate', header: 'Week Start' },
          { key: 'status', header: 'Status' },
          { key: 'category', header: 'Category' },
          { key: 'work', header: 'Work' },
          { key: 'mon', header: 'Mon' },
          { key: 'tue', header: 'Tue' },
          { key: 'wed', header: 'Wed' },
          { key: 'thu', header: 'Thu' },
          { key: 'fri', header: 'Fri' },
          { key: 'sat', header: 'Sat' },
          { key: 'sun', header: 'Sun' },
          { key: 'total', header: 'Total' },
        ]);
        setPreviewRows(rows);
      }
    } catch (e) {
      
    }
  };

  React.useEffect(() => {
    loadPreview(reportType, currentFilter);
  }, [
    reportType,
    currentFilter.startDate,
    currentFilter.endDate,
    (currentFilter.employeeIds || []).join(','),
    (currentFilter.submissionStatus || []).join(','),
    (currentFilter.approvalStatus || []).join(','),
  ]);

  const isLoadingPreview = false;
  const theme = useTheme();
  return (
    <Box sx={{ padding: 2, height: '100%' }}>
      <TableWindowLayout
          title="Timesheet Reports"
          buttons={[]}
          table={
            <>
              {/* Error Alert */}
              {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={clearError}>
                  {error}
                </Alert>
              )}

              {/* Loading State */}
              {isLoading && (
                <Box>
                  <Paper sx={{ p: 3, mb: 3 }}>
                    <Skeleton variant="text" width="30%" height={32} />
                    <Skeleton
                      variant="rectangular"
                      height={200}
                      sx={{ mt: 2 }}
                    />
                  </Paper>
                  <Paper sx={{ p: 3 }}>
                    <Skeleton variant="text" width="30%" height={32} />
                    <Skeleton
                      variant="rectangular"
                      height={200}
                      sx={{ mt: 2 }}
                    />
                  </Paper>
                </Box>
              )}

              {/* Main Content */}
              {!isLoading && (
                <Box>
                  <TwoColumnReportLayout
                    left={
                      <ReportFilterForm
                        supervisedEmployees={supervisedEmployees}
                        reportMetadata={reportMetadata}
                        onFilterChange={handleFilterChange}
                        reportType={reportType}
                        onReportTypeChange={(t) => setReportType(t)}
                        disabled={isGenerating}
                        resetSignal={resetCounter}
                        isGenerating={isGenerating}
                        onGenerateReport={(f) => handleGenerateReport(reportType, f)}
                        error={error}
                        onResetFilters={() => setResetCounter((c) => c + 1)}
                      />
                    }
                    right={
                      <ReportInformationPanel />
                    }
                  />

                  <Divider sx={{ my: 2 }} />

                  {/* Preview Table */}
                  <Box mb={3}>
                    <ReportPreviewTable
                      columns={previewColumns}
                      rows={previewRows}
                      title="Preview"
                    />
                  </Box>
                 
                </Box>
              )}

              {/* No Data State */}
              {!isLoading && supervisedEmployees.length === 0 && (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                  <ReportIcon
                    sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }}
                  />
                  <Typography variant="h6" gutterBottom>
                    No Supervised Employees
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    You don't have any supervised employees to generate reports
                    for. Contact your administrator if you believe this is
                    incorrect.
                  </Typography>
                </Paper>
              )}
            </>
          }
        />
    </Box>
  );
};

export default ReportDashboard;
