import React from 'react';
import { Box } from '@mui/material';
import { ReportEmployeeHeader } from '../../../molecules/report';
import ReportPreviewTable from '../table/ReportPreviewTable';
import { ReportEmployeeSectionProps } from '../../../../interfaces/report/reportpreview';

const ReportEmployeeSection: React.FC<ReportEmployeeSectionProps> = ({ 
  employeeKey,
  employeeData
}) => {
  return (
    <Box sx={{ mb: 4 }}>
      <ReportEmployeeHeader 
        employeeName={employeeData.employeeName}
        employeeEmail={employeeData.employeeEmail}
      />
      
      {employeeData.tables.map((table, tableIndex) => (
        <Box key={tableIndex} sx={{ mb: 3 }}>
          <ReportPreviewTable
            columns={table.columns}
            rows={table.rows}
            title={table.title}
          />
        </Box>
      ))}
    </Box>
  );
};

export default ReportEmployeeSection;
