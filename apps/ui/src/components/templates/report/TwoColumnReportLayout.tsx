import React from 'react';
import { Grid } from '@mui/material';
import { TwoColumnReportLayoutProps } from '../../../interfaces/report/layout';


const TwoColumnReportLayout: React.FC<TwoColumnReportLayoutProps> = ({
  left,
  right,
  spacing = 2,
  leftMd = 7,
  rightMd = 5,
  marginBottom = 0,
}) => {
  return (
    <Grid container spacing={spacing} mb={marginBottom}>
      <Grid size={{ xs: 12, md: leftMd }}>
        {left}
      </Grid>
      <Grid size={{ xs: 12, md: rightMd }}>
        {right}
      </Grid>
    </Grid>
  );
};

export default TwoColumnReportLayout;
