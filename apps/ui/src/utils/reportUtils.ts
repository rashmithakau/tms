import { ReportFilter, DetailedTimesheetPreviewRow } from '../interfaces/api';


export const buildQueryParams = (filter: ReportFilter): URLSearchParams => {
  const params = new URLSearchParams();
  params.append('format', 'json');
  if (filter.startDate) params.append('startDate', filter.startDate);
  if (filter.endDate) params.append('endDate', filter.endDate);
  if (filter.employeeIds?.length) filter.employeeIds.forEach((id) => params.append('employeeIds', id));
  if (filter.submissionStatus?.length) filter.submissionStatus.forEach((s) => params.append('submissionStatus', s));
  if (filter.approvalStatus?.length) filter.approvalStatus.forEach((s) => params.append('approvalStatus', s));
  if (filter.projectIds?.length) filter.projectIds.forEach((id) => params.append('projectIds', id));
  if (filter.teamIds?.length) filter.teamIds.forEach((id) => params.append('teamIds', id));
  return params;
};


export const transformDetailedTimesheetData = (data: any[]): DetailedTimesheetPreviewRow[] => {
  const rows: DetailedTimesheetPreviewRow[] = [];
  
  (data || []).forEach((t: any) => {
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
          status: t.status,
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
  reportType: 'submission-status' | 'approval-status' | 'detailed-timesheet',
  format: 'pdf' | 'excel'
): string => {
  const date = new Date().toISOString().split('T')[0];
  const extension = format === 'pdf' ? 'pdf' : 'xlsx';
  return `${reportType}-report-${date}.${extension}`;
};