import React from 'react';
import { Box, Typography } from '@mui/material';
import { ReportTitle } from '../../../atoms/report';
import {ReportEmployeeHeaderProps} from '../../../../interfaces/report/reportpreview';

const ReportEmployeeHeader: React.FC<ReportEmployeeHeaderProps> = ({ 
  employeeName,
  employeeEmail
}) => {
  return (
    <Box sx={{ mb: 2 }}>
      <ReportTitle variant="h6" color="primary">
        {employeeName} - {employeeEmail}
      </ReportTitle>
    </Box>
  );
};

export default ReportEmployeeHeader;
