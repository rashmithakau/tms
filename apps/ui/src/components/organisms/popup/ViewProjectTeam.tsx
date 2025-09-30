import React from 'react';
import { Box, Typography, Divider, Button, Paper } from '@mui/material';
import PopupLayout from '../../templates/popup/PopUpLayout';
import { useTheme } from '@mui/material/styles';
import SupervisorMemberCard from '../../molecules/employee/supervisor/SupervisorMemberCard';
import TeamMemberCard from '../../molecules/team/TeamMemberCard';
import BaseButton from '../../atoms/common/button/BaseBtn';
import { ViewProjectTeamProps } from '../../../interfaces/organisms/popup';

const ViewProjectTeam: React.FC<ViewProjectTeamProps> = ({
  open,
  onClose,
  project,
}) => {
  const theme = useTheme();
  if (!project) return null;

  const teamMembers =
    project.employees?.filter((emp) => emp.id !== project.supervisor?.id) || [];

  return (
    <PopupLayout
      open={open}
      title="Project Team"
      subtitle={`Project Name - ${project.projectName}`}
      onClose={onClose}
      actions={
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            gap: 2,
            justifyContent: 'flex-end',
            width: '100%',
          }}
        >
          <BaseButton variant="outlined" onClick={onClose}>
            Cancel
          </BaseButton>
        </Box>
      }
    >
      <Box>
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h6"
            sx={{ color: theme.palette.text.primary }}
            gutterBottom
          >
            Supervisor
          </Typography>
          <SupervisorMemberCard supervisor={project.supervisor ?? null} />
        </Box>
        <Divider sx={{ my: 2 }} />

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
              {teamMembers.map((employee) => (
                <TeamMemberCard key={employee.id} member={employee} />
              ))}
            </Box>
          ) : (
            <Typography
              variant="body2"
              sx={{ color: theme.palette.text.secondary }}
            >
              No team members assigned
            </Typography>
          )}
        </Box>
      </Box>
    </PopupLayout>
  );
};

export default ViewProjectTeam;
