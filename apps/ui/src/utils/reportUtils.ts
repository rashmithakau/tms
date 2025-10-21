import { ReportFilter, DetailedTimesheetPreviewRow } from '../interfaces/api';


export const buildQueryParams = (filter: ReportFilter): URLSearchParams => {
  const params = new URLSearchParams();
  if (filter.startDate) params.append('startDate', filter.startDate);
  if (filter.endDate) params.append('endDate', filter.endDate);
  if (filter.employeeIds?.length) filter.employeeIds.forEach((id) => params.append('employeeIds', id));
  if (filter.submissionStatus?.length) filter.submissionStatus.forEach((s) => params.append('submissionStatus', s));
  if (filter.approvalStatus?.length) filter.approvalStatus.forEach((s) => params.append('approvalStatus', s));
  if (filter.projectId) params.append('projectIds', filter.projectId);
  if (filter.teamId) params.append('teamIds', filter.teamId);
  // Only send workType if no specific project/team is selected
  // When filtering by specific project/team, we want ALL timesheet entries for those users
  if (filter.workType && !filter.projectId && !filter.teamId) params.append('workType', filter.workType);
  return params;
};


export const transformDetailedTimesheetData = (data: any[]): DetailedTimesheetPreviewRow[] => {
  const rows: DetailedTimesheetPreviewRow[] = [];
  
  (data || []).forEach((t: any) => {
    
    const weekdayIndices = [0, 1, 2, 3, 4];
    const aggregatedDayStatus: string[] = Array(7).fill('Draft');
    const dayStatusPrecedence: Record<string, number> = {
      'Rejected': 4,
      'Pending': 3,
      'Approved': 2,
      'Draft': 1,
    };

    
    (t.categories || []).forEach((c: any) => {
      (c.items || []).forEach((it: any) => {
        const hoursArr: number[] = Array.isArray(it.dailyHours) 
          ? it.dailyHours.map((h: any) => Number(h) || 0) 
          : [];
        const dailyStatusArr: string[] = Array.isArray(it.dailyStatus) ? it.dailyStatus : [];
        
        for (let d = 0; d < 7; d++) {
          const hasHours = (hoursArr[d] || 0) > 0;
          if (!hasHours) continue;
          
          const statusForItem = dailyStatusArr[d] || 'Draft';
          const currentAgg = aggregatedDayStatus[d];
          if ((dayStatusPrecedence[statusForItem] || 0) > (dayStatusPrecedence[currentAgg] || 0)) {
            aggregatedDayStatus[d] = statusForItem;
          }
        }
      });
    });

   
    const isWeekFullyApproved = weekdayIndices.every((idx) => aggregatedDayStatus[idx] === 'Approved');
    const isWeekFullyRejected = weekdayIndices.every((idx) => aggregatedDayStatus[idx] === 'Rejected');
    
    const weekLevelStatus = isWeekFullyApproved
      ? 'Approved'
      : isWeekFullyRejected
        ? 'Rejected'
        : 'Pending';

    (t.categories || []).forEach((c: any) => {
      (c.items || []).forEach((it: any) => {
        // Calculate total hours from daily hours
        const dailyHours = it.dailyHours || [];
        const totalHours = dailyHours.reduce((sum: number, hours: number) => {
          const numHours = typeof hours === 'number' ? hours : parseFloat(hours) || 0;
          return sum + numHours;
        }, 0);
        
        rows.push({
          employeeName: t.employeeName,
          employeeEmail: t.employeeEmail,
          weekStartDate: typeof t.weekStartDate === 'string' ? t.weekStartDate : new Date(t.weekStartDate).toISOString().slice(0, 10),
          status: weekLevelStatus, // Use week-level status instead of item-level
          category: c.category,
          work: it.work,
          mon: String(it.dailyHours?.[0] ?? ''),
          tue: String(it.dailyHours?.[1] ?? ''),
          wed: String(it.dailyHours?.[2] ?? ''),
          thu: String(it.dailyHours?.[3] ?? ''),
          fri: String(it.dailyHours?.[4] ?? ''),
          sat: String(it.dailyHours?.[5] ?? ''),
          sun: String(it.dailyHours?.[6] ?? ''),
          total: String(totalHours.toFixed(2)),
        });
      });
    });
  });
  
  return rows;
};


export const downloadBlobAsFile = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const generateReportFilename = (
  reportType: 'submission-status' | 'approval-status' | 'detailed-timesheet' | 'rejected-timesheets' | 'timesheet-entries',
  format: 'pdf' | 'excel'
): string => {
  const date = new Date().toISOString().split('T')[0];
  const extension = format === 'pdf' ? 'pdf' : 'xlsx';
  return `${reportType}-report-${date}.${extension}`;
};