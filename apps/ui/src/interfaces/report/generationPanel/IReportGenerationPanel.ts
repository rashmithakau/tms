import { ReportMetadata } from '@tms/shared';

export interface ReportGenerationPanelProps {
  reportMetadata: ReportMetadata | null;
  isFilterValid: boolean;
  isGenerating: boolean;
  onGenerateReport: (format: 'pdf' | 'excel') => void;
  error?: string | null;
}
