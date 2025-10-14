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
import ReportLayout from '../../templates/report/ReportLayout';
import { useTheme } from '@mui/material/styles';
import { ReportInformationPanel } from '../../molecules/report';

const ReportDashboard: React.FC = () => {
  const [currentFilter, setCurrentFilter] = useState<ReportFilter>({});
  const [resetCounter, setResetCounter] = useState(0);
  const [isFilterValid, setIsFilterValid] = useState(false);
  const [reportType, setReportType] = useState<
    'submission-status' | 'approval-status' | 'detailed-timesheet' | ''
  >('');

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
  const [groupedPreviewData, setGroupedPreviewData] = useState<{
    [employeeKey: string]: {
      employeeName: string;
      employeeEmail: string;
      tables: Array<{
        title: string;
        columns: { key: string; header: string }[];
        rows: any[];
      }>;
    };
  }>({});

  const loadPreview = async (
    type: 'submission-status' | 'approval-status' | 'detailed-timesheet',
    filter: ReportFilter
  ) => {
    try {
      // Clear grouped data for non-detailed timesheet reports
      if (type !== 'detailed-timesheet') {
        setGroupedPreviewData({});
      }
      
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
          { key: 'employeeEmail', header: 'Email' },
          { key: 'weekStartDate', header: 'Week Start' },
          { key: 'approvalStatus', header: 'Approval' },
        ]);
        setPreviewRows(rows);
      } else if (type === 'detailed-timesheet') {
        const rawData = await previewDetailedTimesheet(filter);
        
        // Group data by employee and project/team
        const groupedData: {
          [employeeKey: string]: {
            employeeName: string;
            employeeEmail: string;
            tables: Array<{
              title: string;
              columns: { key: string; header: string }[];
              rows: any[];
            }>;
          };
        } = {};

        // Process raw data to group by employee and project/team
        rawData.forEach((row: any) => {
          const employeeKey = `${row.employeeName}|${row.employeeEmail}`;
          
          if (!groupedData[employeeKey]) {
            groupedData[employeeKey] = {
              employeeName: row.employeeName,
              employeeEmail: row.employeeEmail,
              tables: []
            };
          }

          // Check if this row belongs to a project, team, or other
          const isProject = row.category === 'Project' || row.work?.includes('Project');
          const isTeam = row.category === 'Team' || row.work?.includes('Team');
          const isOther = row.category === 'Other';
          
          let tableTitle = 'General';
          if (isProject) {
            tableTitle = `Project: ${row.work}`;
          } else if (isTeam) {
            tableTitle = `Team: ${row.work}`;
          } else if (isOther) {
            tableTitle = 'Leave';
          }

          // Find existing table for this project/team or create new one
          let existingTable = groupedData[employeeKey].tables.find(t => t.title === tableTitle);
          if (!existingTable) {
            // Define columns based on table type
            const baseColumns = [
              { key: 'weekStartDate', header: 'Week Start' },
              { key: 'status', header: 'Status' },
              { key: 'mon', header: 'Mon' },
              { key: 'tue', header: 'Tue' },
              { key: 'wed', header: 'Wed' },
              { key: 'thu', header: 'Thu' },
              { key: 'fri', header: 'Fri' },
              { key: 'total', header: 'Total' },
            ];
            
            // Add Work column for other tables
            const columns = isOther 
              ? [
                  { key: 'weekStartDate', header: 'Week Start' },
                  { key: 'status', header: 'Status' },
                  { key: 'work', header: 'Work' },
                  { key: 'mon', header: 'Mon' },
                  { key: 'tue', header: 'Tue' },
                  { key: 'wed', header: 'Wed' },
                  { key: 'thu', header: 'Thu' },
                  { key: 'fri', header: 'Fri' },
                  { key: 'total', header: 'Total' },
                ]
              : baseColumns;
            
            existingTable = {
              title: tableTitle,
              columns: columns,
              rows: []
            };
            groupedData[employeeKey].tables.push(existingTable);
          }

          // Add row to the appropriate table
          existingTable.rows.push(row);
        });

        setGroupedPreviewData(groupedData);
        
        // For backward compatibility, also set the original format
        setPreviewColumns([
          { key: 'employeeName', header: 'Employee' },
          { key: 'employeeEmail', header: 'Email' },
          { key: 'weekStartDate', header: 'Week Start' },
          { key: 'status', header: 'Status' },

          { key: 'mon', header: 'Mon' },
          { key: 'tue', header: 'Tue' },
          { key: 'wed', header: 'Wed' },
          { key: 'thu', header: 'Thu' },
          { key: 'fri', header: 'Fri' },
          { key: 'total', header: 'Total' },
        ]);
        setPreviewRows(rawData);
      }
    } catch (e) {
      
    }
  };

  React.useEffect(() => {
    if (!reportType) return;
    loadPreview(reportType as 'submission-status' | 'approval-status' | 'detailed-timesheet', currentFilter);
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
                      reportType={reportType as any}
                      onReportTypeChange={(t) => setReportType(t)}
                      disabled={isGenerating}
                      resetSignal={resetCounter}
                      isGenerating={isGenerating}
                      onGenerateReport={(f) => reportType && handleGenerateReport(reportType, f)}
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
                {reportType && (
                <Box mb={3}>
                  {reportType === 'detailed-timesheet' && Object.keys(groupedPreviewData).length > 0 ? (
                    // Display grouped tables for detailed timesheet
                    <ReportLayout title="Preview Table" noBorder>
                      {Object.entries(groupedPreviewData).map(([employeeKey, employeeData]) => (
                        <Box key={employeeKey} mb={4}>
                          {/* Employee header - shown once per employee */}
                          <Typography variant="h6" sx={{ mb: 2, color: theme.palette.primary.main }}>
                            {employeeData.employeeName} - {employeeData.employeeEmail}
                          </Typography>
                          
                          {/* Tables for this employee */}
                          {employeeData.tables.map((table, tableIndex) => (
                            <Box key={tableIndex} mb={3}>
                              <ReportPreviewTable
                                columns={table.columns}
                                rows={table.rows}
                                title={table.title}
                              />
                            </Box>
                          ))}
                        </Box>
                      ))}
                    </ReportLayout>
                  ) : (
                    // Display single table for other report types
                    <ReportPreviewTable
                      columns={previewColumns}
                      rows={previewRows}
                      
                    />
                  )}
                </Box>
                )}
               
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
  );
};

export default ReportDashboard;
