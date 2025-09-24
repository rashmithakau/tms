import React from 'react';
import { Grid } from '@mui/material';
import { StatCard } from '../../atoms/dashboard';
import { IStatsGridProps } from '../../../interfaces/dashboard';

const StatsGrid: React.FC<IStatsGridProps> = ({ stats, columns = 4 }) => {
  return (
    <Grid container spacing={3}>
      {stats.map((stat, index) => (
        <Grid size={{ xs: 12, sm: 6, md: 12 / columns }} key={index}>
          <StatCard {...stat} />
        </Grid>
      ))}
    </Grid>
  );
};

export default StatsGrid;
