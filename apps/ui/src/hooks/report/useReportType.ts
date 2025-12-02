import { useState } from 'react';
import {UseReportTypeOptions, UseReportTypeReturn} from '../../interfaces/report/hook/IUseReportType';

export const useReportType = ({ 
  initialType = '' 
}: UseReportTypeOptions = {}): UseReportTypeReturn => {
  const [reportType, setReportType] = useState<'submission-status' | 'approval-status' | 'detailed-timesheet' | 'timesheet-entries' | ''>(initialType);

  return {
    reportType,
    setReportType
  };
};
