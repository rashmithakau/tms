import React from 'react';
import { Box } from '@mui/material';
import { ReportLayout } from '../../templates/report';
import { ReportEmployeeSection } from '../../molecules/report';
import { ReportGroupedPreviewProps } from '../../../interfaces/report/reportpreview';

const ReportGroupedPreview: React.FC<ReportGroupedPreviewProps> = ({ 
  groupedPreviewData 
}) => {
  return (
    <ReportLayout title="Preview Table" noBorder>
      {Object.entries(groupedPreviewData).map(([employeeKey, employeeData]) => (
        <ReportEmployeeSection
          key={employeeKey}
          employeeKey={employeeKey}
          employeeData={employeeData}
        />
      ))}
    </ReportLayout>
  );
};

export default ReportGroupedPreview;
