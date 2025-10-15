import React from 'react';
import { Box } from '@mui/material';
import { ReportDivider } from '../../atoms/report';
import { ReportContentLayoutProps } from '../../../interfaces/report/reportpreview';
const ReportContentLayout: React.FC<ReportContentLayoutProps> = ({
  filterSection,
  previewSection
}) => {
  return (
    <Box>
      {filterSection}
      <ReportDivider spacing="medium" />
      {previewSection}
    </Box>
  );
};

export default ReportContentLayout;
