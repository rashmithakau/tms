import { useState, useEffect } from 'react';
import { useToast } from '../../contexts/ToastContext';
import {
  generateSubmissionStatusReport,
  generateApprovalStatusReport,
  generateDetailedTimesheetReport,
  getSupervisedEmployees,
  getReportMetadata,
  downloadBlobAsFile,
  generateReportFilename,
  ReportFilter,
  Employee,
  ReportMetadata
} from '../../api/report';
import { UseReportGeneratorOptions, UseReportGeneratorReturn } from '../../interfaces/report/hook/IUseReportGenerator';


export const useReportGenerator = (options: UseReportGeneratorOptions = {}): UseReportGeneratorReturn => {
  const { onSuccess, onError } = options;
  const { success: showSuccess, error: showError } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [supervisedEmployees, setSupervisedEmployees] = useState<Employee[]>([]);
  const [reportMetadata, setReportMetadata] = useState<ReportMetadata | null>(null);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    await Promise.all([
      loadSupervisedEmployees(),
      loadReportMetadata()
    ]);
  };

  const loadSupervisedEmployees = async () => {
    setIsLoadingEmployees(true);
    setError(null);
    
    try {
      const response = await getSupervisedEmployees();
      setSupervisedEmployees(response.data.employees);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to load supervised employees';
      setError(errorMessage);
      onError?.(errorMessage);
      showError(errorMessage);
    } finally {
      setIsLoadingEmployees(false);
    }
  };

  const loadReportMetadata = async () => {
    setIsLoadingMetadata(true);
    setError(null);
    
    try {
      const response = await getReportMetadata();
      setReportMetadata(response.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to load report metadata';
      setError(errorMessage);
      onError?.(errorMessage);
      showError(errorMessage);
    } finally {
      setIsLoadingMetadata(false);
    }
  };

  const generateReport = async (
    reportGenerator: (filter: ReportFilter, format: 'pdf' | 'excel') => Promise<Blob>,
    reportType: 'submission-status' | 'approval-status' | 'detailed-timesheet',
    filter: ReportFilter,
    format: 'pdf' | 'excel'
  ) => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const blob = await reportGenerator(filter, format);
      const filename = generateReportFilename(reportType, format);
      
      downloadBlobAsFile(blob, filename);
      
      onSuccess?.(filename);
      showSuccess(`Report "${filename}" generated successfully`);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || `Failed to generate ${reportType} report`;
      setError(errorMessage);
      onError?.(errorMessage);
      showError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateSubmissionReport = async (filter: ReportFilter, format: 'pdf' | 'excel') => {
    await generateReport(
      generateSubmissionStatusReport,
      'submission-status',
      filter,
      format
    );
  };

  const generateApprovalReport = async (filter: ReportFilter, format: 'pdf' | 'excel') => {
    await generateReport(
      generateApprovalStatusReport,
      'approval-status',
      filter,
      format
    );
  };

  const generateDetailedReport = async (filter: ReportFilter, format: 'pdf' | 'excel') => {
    await generateReport(
      generateDetailedTimesheetReport,
      'detailed-timesheet',
      filter,
      format
    );
  };

  const refreshEmployees = async () => {
    await loadSupervisedEmployees();
  };

  const refreshMetadata = async () => {
    await loadReportMetadata();
  };

  const clearError = () => {
    setError(null);
  };

  return {
    isGenerating,
    supervisedEmployees,
    reportMetadata,
    isLoadingEmployees,
    isLoadingMetadata,
    error,
    generateSubmissionReport,
    generateApprovalReport,
    generateDetailedReport,
    refreshEmployees,
    refreshMetadata,
    clearError
  };
};