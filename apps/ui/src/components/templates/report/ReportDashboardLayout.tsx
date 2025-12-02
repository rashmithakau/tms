import React from 'react';
import { Box } from '@mui/material';
import { TableWindowLayout } from '../layout';
import { ReportDashboardLayoutProps } from '../../../interfaces/report/reportpreview';

const ReportDashboardLayout: React.FC<ReportDashboardLayoutProps> = ({
  title,
  buttons = [],
  children
}) => {
  return (
    <TableWindowLayout
      title={title}
      buttons={buttons}
      table={
        <Box>
          {children}
        </Box>
      }
    />
  );
};

export default ReportDashboardLayout;
