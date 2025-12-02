import React from 'react';
import { Box, Grid } from '@mui/material';
import { People, Assignment, Group, AdminPanelSettings } from '@mui/icons-material';
import { StatsGrid } from '../../molecules/dashboard';
import { IAdminStatsOverviewProps } from '../../../interfaces/dashboard';

const AdminStatsOverview: React.FC<IAdminStatsOverviewProps> = ({
  userStats,
  projectStats,
  timesheetStats,
  teamStats
}) => {
  const statsData = [
    {
      title: 'Total Users',
      value: userStats.totalUsers,
      icon: <People fontSize="large" />,
      backgroundColor: 'background.paper',
      textColor: 'primary.main'
    },
    {
      title: 'Total Projects',
      value: projectStats.totalProjects,
      icon: <Assignment fontSize="large" />,
      backgroundColor: 'background.paper',
      textColor: 'primary.main'
    },
    {
      title: 'Total Teams',
      value: teamStats.totalTeams,
      icon: <Group fontSize="large" />,
      backgroundColor: 'background.paper',
      textColor: 'primary.main'
    },
    {
      title: 'Active Users',
      value: userStats.activeUsers,
      icon: <People fontSize="large" />,
      backgroundColor: 'background.paper',
      textColor: 'primary.main'
    },
    {
      title: 'Active Projects',
      value: projectStats.activeProjects,
      icon: <Assignment fontSize="large" />,
      backgroundColor: 'background.paper',
      textColor: 'primary.main'
    },
    {
      title: 'Total Admins',
      value: userStats.totalAdmins,
      icon: <AdminPanelSettings fontSize="large" />,
      backgroundColor: 'background.paper',
      textColor: 'primary.main'
    }
  ];

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <StatsGrid stats={statsData} columns={3} />
    </Box>
  );
};

export default AdminStatsOverview;
