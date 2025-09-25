

import { Employee } from '../../api/report';
import { ReportMetadata } from '@tms/shared';

export interface IReportFilterForm {
  supervisedEmployees: Employee[];
  reportMetadata: ReportMetadata | null;
  onFilterChange: (filter: any) => void;
  reportType: 'submission-status' | 'approval-status' | 'detailed-timesheet';
  onReportTypeChange?: (type: 'submission-status' | 'approval-status' | 'detailed-timesheet') => void;
  disabled?: boolean;
  // Optional external reset trigger; when changed, form should reset
  resetSignal?: number;
  // Generation panel props
  isGenerating?: boolean;
  onGenerateReport?: (format: 'pdf' | 'excel') => void;
  error?: string | null;
  onResetFilters?: () => void;
}