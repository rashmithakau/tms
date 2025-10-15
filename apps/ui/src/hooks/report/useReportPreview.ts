import { useState, useEffect } from 'react';
import {
  previewSubmissionStatus,
  previewApprovalStatus,
  previewDetailedTimesheet,
  previewDetailedTimesheetRaw,
} from '../../api/report';
import { UseReportPreviewOptions, UseReportPreviewReturn } from '../../interfaces/report/reportpreview';

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
      if (reportType !== 'detailed-timesheet' && reportType !== 'timesheet-entries') {
        setGroupedPreviewData({});
      }
      
      if (reportType === 'submission-status') {
        const rows = await previewSubmissionStatus(filter);
        setPreviewColumns([
          { key: 'employeeName', header: 'Employee' },
          { key: 'employeeEmail', header: 'Email' },
          { key: 'weekStartDate', header: 'Week Start' },
          { key: 'submissionStatus', header: 'Submission' },
        ]);
        setPreviewRows(rows);
      } else if (reportType === 'approval-status') {
        const rows = await previewApprovalStatus(filter);
        setPreviewColumns([
          { key: 'employeeName', header: 'Employee' },
          { key: 'employeeEmail', header: 'Email' },
          { key: 'weekStartDate', header: 'Week Start' },
          { key: 'approvalStatus', header: 'Approval' },
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
      } else if (reportType === 'timesheet-entries') {
        const rawWeekly = await previewDetailedTimesheetRaw(filter);
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

        // Resolve date bounds once for efficient per-day filtering
        const startBound = filter.startDate ? new Date(filter.startDate) : null;
        const endBound = filter.endDate ? new Date(filter.endDate) : null;

        const ensureEmployee = (key: string, name: string, email: string) => {
          if (!groupedEntries[key]) {
            groupedEntries[key] = { employeeName: name, employeeEmail: email, tables: [] };
          }
          return groupedEntries[key];
        };

        const ensureTable = (emp: any, title: string) => {
          let tbl = emp.tables.find((t: any) => t.title === title);
          if (!tbl) {
            tbl = {
              title,
              columns: [
                { key: 'date', header: 'Date', width: '25%' },
                { key: 'description', header: 'Description', width: '25%' },
                { key: 'status', header: 'Status', width: '25%' },
                { key: 'quantity', header: 'Quantity', width: '25%' },
              ],
              rows: [],
            };
            emp.tables.push(tbl);
          }
          return tbl;
        };

        // rawWeekly structure: array of weekly timesheets with categories and items 
        (rawWeekly || []).forEach((t: any) => {
          const employeeName = t.employeeName;
          const employeeEmail = t.employeeEmail;
          const employeeKey = `${employeeName}|${employeeEmail}`;
          const emp = ensureEmployee(employeeKey, employeeName, employeeEmail);
          const weekStartDate = typeof t.weekStartDate === 'string' ? new Date(t.weekStartDate) : new Date(t.weekStartDate);

          (t.categories || []).forEach((c: any) => {
            (c.items || []).forEach((it: any) => {
              const isProject = c.category === 'Project';
              const isTeam = c.category === 'Team';
              const isOther = c.category === 'Other';
              const title = isProject ? `Project: ${it.work || it.projectName || 'Project'}` : isTeam ? `Team: ${it.work || it.teamName || 'Team'}` : isOther ? 'Leave' : c.category;
              const tbl = ensureTable(emp, title);

              const hours: any[] = it.dailyHours || it.hours || [];
              const descriptions: any[] = it.descriptions || it.dailyDescriptions || [];
              for (let idx = 0; idx < 7; idx++) {
                const qtyStr = String(hours[idx] ?? '');
                const qty = parseFloat(qtyStr);
                if (qty && !isNaN(qty) && qty > 0) {
                  const date = new Date(weekStartDate);
                  date.setDate(weekStartDate.getDate() + idx);
                  const dateStr = date.toISOString().slice(0,10);
                  // Apply per-day date filtering against selected range
                  if (startBound && date < startBound) {
                    continue;
                  }
                  if (endBound && date > endBound) {
                    continue;
                  }
                  const rawDesc = descriptions[idx] || it.description || it.task || it.tasks || '';
                  const desc = (typeof rawDesc === 'string' ? rawDesc.trim() : String(rawDesc || '')).length > 0 ? rawDesc : '-';
                  const rawDayStatus = (it.dailyStatus && it.dailyStatus[idx]) || t.status || 'Pending';
                  const status = rawDayStatus;
                  tbl.rows.push({
                    date: dateStr,
                    description: desc,
                    status,
                    quantity: qtyStr,
                  });
                }
              }
            });
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
      setPreviewError('Failed to load preview data');
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
