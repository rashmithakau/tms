import { useState, useEffect } from 'react';
import {
  previewSubmissionStatus,
  previewApprovalStatus,
  previewDetailedTimesheet,
  previewDetailedTimesheetRaw,
} from '../../api/report';
import { UseReportPreviewOptions, UseReportPreviewReturn } from '../../interfaces/report/hook/IUseReportPreview';

export const useReportPreview = ({ 
  reportType, 
  filter 
}: UseReportPreviewOptions): UseReportPreviewReturn => {
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [previewColumns, setPreviewColumns] = useState<{ key: string; header: string }[]>([]);
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
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const loadPreview = async () => {
    if (!reportType) return;
    
    setIsLoadingPreview(true);
    setPreviewError(null);

    try {
      if (reportType !== 'detailed-timesheet' && reportType !== 'timesheet-entries' && reportType !== 'submission-status' && reportType !== 'approval-status') {
        setGroupedPreviewData({});
      }
      
      if (reportType === 'submission-status') {
        const rows = await previewSubmissionStatus(filter);
        
        // Group data by employee
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

        // Process raw data to group by employee
        (rows || []).forEach((row: any) => {
          if (!row || !row.employeeName || !row.employeeEmail) return;
          
          const employeeKey = `${row.employeeName}|${row.employeeEmail}`;
          
          if (!groupedData[employeeKey]) {
            groupedData[employeeKey] = {
              employeeName: row.employeeName,
              employeeEmail: row.employeeEmail,
              tables: [{
                title: '',
                columns: [
                  { key: 'weekStartDate', header: 'Week Start' },
                  { key: 'submissionStatus', header: 'Status' },
                ],
                rows: []
              }]
            };
          }

          // Add row to the employee's table
          groupedData[employeeKey].tables[0].rows.push(row);
        });

        setGroupedPreviewData(groupedData);
        
        // For backward compatibility, also set the original format
        setPreviewColumns([
          { key: 'employeeName', header: 'Employee' },
          { key: 'employeeEmail', header: 'Email' },
          { key: 'weekStartDate', header: 'Week Start' },
          { key: 'submissionStatus', header: 'Submission' },
        ]);
        setPreviewRows(rows);
      } else if (reportType === 'approval-status') {
        const rows = await previewApprovalStatus(filter);
        
        // Group data by employee
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

        // Process raw data to group by employee
        (rows || []).forEach((row: any) => {
          if (!row || !row.employeeName || !row.employeeEmail) return;
          
          const employeeKey = `${row.employeeName}|${row.employeeEmail}`;
          
          if (!groupedData[employeeKey]) {
            groupedData[employeeKey] = {
              employeeName: row.employeeName,
              employeeEmail: row.employeeEmail,
              tables: [{
                title: '',
                columns: [
                  { key: 'weekStartDate', header: 'Week Start' },
                  { key: 'approvalStatus', header: 'Status' },
                ],
                rows: []
              }]
            };
          }

          // Add row to the employee's table
          groupedData[employeeKey].tables[0].rows.push(row);
        });

        setGroupedPreviewData(groupedData);
        
        // For backward compatibility, also set the original format
        setPreviewColumns([
          { key: 'employeeName', header: 'Employee' },
          { key: 'employeeEmail', header: 'Email' },
          { key: 'weekStartDate', header: 'Week Start' },
          { key: 'approvalStatus', header: 'Approval Status' }, 
        ]);
        setPreviewRows(rows);
      } else if (reportType === 'detailed-timesheet') {
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
        (rawData || [])
          .filter((row: any) => {
            if (!row || !row.employeeName || !row.employeeEmail) return false;
            
            // Check if this row belongs to a project, team, or other
            const isProject = row.category === 'Project' || row.work?.includes('Project');
            const isTeam = row.category === 'Team' || row.work?.includes('Team');
            
            // When filtering by specific project/team, show ALL timesheet entries for those users
            // Only apply workType filtering when no specific project/team is selected
            if (filter.workType === 'project' && !filter.projectId && !isProject) return false;
            if (filter.workType === 'team' && !filter.teamId && !isTeam) return false;
            
            // When we have a specific project/team filter, the API already filters the users
            // so we should show ALL their timesheet entries, not just project/team specific ones
            // (Remove the restrictive filtering below)
            
            return true;
          })
          .forEach((row: any) => {
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
      } else if (reportType === 'timesheet-entries') {
        const rawEntries = await previewDetailedTimesheetRaw(filter);
        const groupedEntries: {
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

        // Process the timesheet entries data structure
        (rawEntries || []).forEach((employee: any) => {
          if (!employee || !employee.employeeName || !employee.employeeEmail) return;
          
          const employeeKey = `${employee.employeeName}|${employee.employeeEmail}`;
          
          if (!groupedEntries[employeeKey]) {
            groupedEntries[employeeKey] = {
              employeeName: employee.employeeName,
              employeeEmail: employee.employeeEmail,
              tables: []
            };
          }
          
          // Process each table for this employee
          (employee.tables || []).forEach((table: any) => {
            // When filtering by project or team, show ALL timesheet entries for those users
            // Only apply workType filtering when no specific project/team is selected
            if (filter.workType === 'project' && !filter.projectId && !table.title.includes('Project:')) return;
            if (filter.workType === 'team' && !filter.teamId && !table.title.includes('Team:')) return;
            
            // Add the table with proper columns
            const processedTable = {
              title: table.title,
              columns: [
                { key: 'date', header: 'Date', width: '25%' },
                { key: 'description', header: 'Description', width: '25%' },
                { key: 'status', header: 'Status', width: '25%' },
                { key: 'quantity', header: 'Quantity', width: '25%' },
              ],
              rows: table.rows || []
            };
            
            groupedEntries[employeeKey].tables.push(processedTable);
          });
        });

        // Sort rows by date ascending within each table
        Object.values(groupedEntries).forEach((emp: any) => {
          emp.tables.forEach((t: any) => {
            t.rows.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
          });
        });
        setGroupedPreviewData(groupedEntries);

        setPreviewColumns([
          { key: 'date', header: 'Date' },
          { key: 'description', header: 'Description' },
          { key: 'status', header: 'Status' },
          { key: 'quantity', header: 'Quantity' },
        ]);
        const flatRows: any[] = [];
        Object.values(groupedEntries).forEach((emp: any) => {
          emp.tables.forEach((t: any) => {
            t.rows.forEach((r: any) => flatRows.push(r));
          });
        });
        flatRows.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setPreviewRows(flatRows);
      }
    } catch (e) {
      console.error('Preview data loading error:', e);
      setPreviewError(e instanceof Error ? e.message : 'Failed to load preview data');
    } finally {
      setIsLoadingPreview(false);
    }
  };

  useEffect(() => {
    loadPreview();
  }, [
    reportType,
    filter.startDate,
    filter.endDate,
    (filter.employeeIds || []).join(','),
    (filter.submissionStatus || []).join(','),
    (filter.approvalStatus || []).join(','),
    filter.projectId,
    filter.teamId,
    filter.workType,
  ]);

  return {
    previewRows,
    previewColumns,
    groupedPreviewData,
    isLoadingPreview,
    previewError,
    loadPreview
  };
};
