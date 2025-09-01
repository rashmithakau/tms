import React from 'react';
import { Box, Typography, Divider, Button, Paper } from '@mui/material';
import PopupLayout from '../templates/PopUpLayout';
import { ProjectRow } from '../templates/TableWindowLayout';
import { useTheme } from '@mui/material/styles';

interface ViewProjectTeamProps {
  open: boolean;
  onClose: () => void;
  project: ProjectRow | null;
}

const ViewProjectTeam: React.FC<ViewProjectTeamProps> = ({
  open,
  onClose,
  project,
}) => {
  const theme = useTheme();
  if (!project) return null;

  // Filter out supervisor from team members
  const teamMembers =
    project.employees?.filter((emp) => emp.id !== project.supervisor?.id) || [];

  return (
    <PopupLayout
      open={open}
      title="Project Team"
      subtitle={`Project Name - ${project.projectName}`}
      onClose={onClose}
    >
      <Box sx={{ p: 2 }}>
        {/* Supervisor Section */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h6"
            sx={{ color: theme.palette.text.primary }}
            gutterBottom
          >
            Supervisor
          </Typography>

          {project.supervisor ? (
            <Paper
              elevation={0}
              sx={{
                p: 2,
                position: 'relative',
                backgroundColor: theme.palette.background.default,
                border: `2px solid ${theme.palette.secondary.main}`,
                borderRadius: 3,
                '&:hover': {
                  borderColor: theme.palette.text.secondary,
                  backgroundColor: theme.palette.background.paper,
                },
              }}
            >
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">
                  {project.supervisor.name}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: theme.palette.text.secondary }}
                >
                  {project.supervisor.designation || 'No designation'}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: theme.palette.text.secondary }}
                >
                  {project.supervisor.email || 'No email'}
                </Typography>
              </Box>
            </Paper>
          ) : (
            <Typography
              variant="body2"
              sx={{
                color: theme.palette.text.secondary,
                fontStyle: 'italic',
              }}
            >
              No supervisor assigned
            </Typography>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Team Members Section */}
        <Box>
          <Typography
            variant="h6"
            sx={{ color: theme.palette.text.primary }}
            gutterBottom
          >
            Team Members ({teamMembers.length})
          </Typography>
          {teamMembers.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {teamMembers.map((employee, index) => (
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    position: 'relative',
                    backgroundColor: theme.palette.background.default,
                    border: `2px solid ${theme.palette.secondary.main}`,
                    borderRadius: 3,
                    '&:hover': {
                      borderColor: theme.palette.text.secondary,
                      backgroundColor: theme.palette.background.paper,
                    },
                  }}
                >
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {employee.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: theme.palette.text.secondary }}
                    >
                      {employee.designation || 'No designation'}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: theme.palette.text.secondary }}
                    >
                      {employee.email || 'No email'}
                    </Typography>
                  </Box>
                </Paper>
              ))}
            </Box>
          ) : (
            <Typography
              variant="body2"
              sx={{ color: theme.palette.text.secondary, fontStyle: 'italic' }}
            >
              No team members assigned
            </Typography>
          )}
        </Box>
      </Box>
      <Box>
        <Divider  />
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          gap: 2,
          justifyContent: 'flex-end',
          mt: 2,
        }}
      >
        <Button variant="outlined" onClick={onClose}>
          Cancel
        </Button>
      </Box>
    </PopupLayout>
  );
};

export default ViewProjectTeam;
