import { ReportFilter, ReportMetadata } from '../../../api/report';

export interface ReportGenerationPanelProps {
  reportMetadata: ReportMetadata | null;
  filter: ReportFilter;
  isFilterValid: boolean;
  isGenerating: boolean;
  onGenerateReport: (format: 'pdf' | 'excel') => void;
  error?: string | null;
  onResetFilters?: () => void;
}
