import React from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';
import WindowLayout from '../../templates/layout/WindowLayout';
import { AdminStatsOverview, AdminTable, TimesheetRejectionReasons } from './index';
import { QuickActions, TimesheetStatusChart } from '../../molecules/dashboard';
import { Calendar } from '../../atoms/dashboard';
import { IAdminDashboardWindowProps } from '../../../interfaces/dashboard';

const AdminDashboardWindow: React.FC<IAdminDashboardWindowProps> = ({
  statsData,
  statsLoading = false,
  statsError = null,
  rejectionReasons = [],
  rejectionReasonsLoading = false,
  rejectionReasonsError = null,
  timesheetStats,
  usersData,
  projectsData,
  onAddUser,
  onAddProject,
  onEditUser,
  onDeleteUser,
  onEditProject,
  onDeleteProject,
  onViewReports,
  onViewTimesheet
}) => {

  const septemberTimesheetData = timesheetStats || {
    submittedCount: 0,
    pendingCount: 0,
    lateCount: 0,
    approvedCount: 0,
    rejectedCount: 0
  };

  return (
    <WindowLayout
      titleBar={
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" color="primary.main">Dashboard</Typography>
        </Box>
      }
    >


        <Grid container spacing={3} mb={4} sx={{ alignItems: 'stretch' }}>

          <Grid size={{ xs: 12, lg: 9 }}>
            <Box sx={{ height: '100%' }}>
              <AdminStatsOverview {...statsData} />
            </Box>
          </Grid>
          
  
          <Grid size={{ xs: 12, lg: 3 }}>
            <Calendar 
              highlightToday={true}
              onDateSelect={(date) => console.log('Selected date:', date)}
            />
          </Grid>
        </Grid>

        <Grid container spacing={3}>

          {(usersData || projectsData) && (
            <Grid size={{ xs: 12, lg: 8 }}>
              <Box display="flex" flexDirection="column" gap={3}>

                {usersData && (
                  <AdminTable
                    title="User Management"
                    rows={usersData.rows}
                    columns={usersData.columns}
                    onAdd={onAddUser}
                    onEdit={onEditUser}
                    onDelete={onDeleteUser}
                    showActions={true}
                  />
                )}

                {projectsData && (
                  <AdminTable
                    title="Project Management"
                    rows={projectsData.rows}
                    columns={projectsData.columns}
                    onAdd={onAddProject}
                    onEdit={onEditProject}
                    onDelete={onDeleteProject}
                    showActions={true}
                  />
                )}
              </Box>
            </Grid>
          )}

          <Grid size={{ xs: 12, lg: (usersData || projectsData) ? 4 : 12 }}>
            <Box 
              display="flex" 
              flexDirection={(usersData || projectsData) ? "column" : "row"}
              gap={3}
              justifyContent={(usersData || projectsData) ? "flex-start" : "center"}
              flexWrap="wrap"
            >

              <Box sx={{ 
                flex: '1 1 0', 
                minWidth: '300px', 
                maxWidth: '500px',
                height: '400px'
              }}>
                <QuickActions
                  onAddUser={onAddUser}
                  onAddProject={onAddProject}
                  onViewReports={onViewReports}
                />
              </Box>

              <Box sx={{ 
                flex: '1 1 0', 
                minWidth: '300px', 
                maxWidth: '500px',
                height: '400px'
              }}>
                <TimesheetStatusChart
                  submittedCount={septemberTimesheetData.submittedCount}
                  pendingCount={septemberTimesheetData.pendingCount}
                  lateCount={septemberTimesheetData.lateCount}
                  approvedCount={septemberTimesheetData.approvedCount}
                  rejectedCount={septemberTimesheetData.rejectedCount}
                  month="September"
                  year={2025}
                  loading={statsLoading}
                  error={statsError}
                />
              </Box>

              {/* Timesheet Rejection Reasons */}
              <Box sx={{ 
                flex: '1 1 0', 
                minWidth: '300px', 
                maxWidth: '500px',
                height: '400px'
              }}>
                <TimesheetRejectionReasons
                  rejectionReasons={rejectionReasons}
                  maxItems={5}
                  loading={rejectionReasonsLoading}
                  error={rejectionReasonsError}
                />
              </Box>
            </Box>
          </Grid>
        </Grid>
    </WindowLayout>
  );
};

export default AdminDashboardWindow;
