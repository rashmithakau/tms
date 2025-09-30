import React, { useEffect, useMemo, useState } from 'react';
import { Box, Avatar, Typography, Chip } from '@mui/material';
import PopupLayout from '../../templates/popup/PopUpLayout';
import { useAuth } from '../../../contexts/AuthContext';
import { listTeams } from '../../../api/team';
import { listProjects } from '../../../api/project';
import BaseButton from '../../atoms/common/button/BaseBtn';
import { ProfilePopupProps } from '../../../interfaces/organisms/popup';

const FieldRow = ({ label, value }: { label: string; value?: string }) => (
  <Box>
    <Typography variant="overline" color="text.secondary">
      {label}
    </Typography>
    <Typography>{value || '-'}</Typography>
  </Box>
);

const ProfilePopup: React.FC<ProfilePopupProps> = ({ open, onClose }) => {
  const { authState } = useAuth();
  const user = authState.user as any;

  const [supervisors, setSupervisors] = useState<string[]>([]);
  const [supervisorEmails, setSupervisorEmails] = useState<string[]>([]);

  useEffect(() => {
    let isMounted = true;
    const fetchSupervisors = async () => {
      try {
        const [teamRes, projectRes] = await Promise.allSettled([
          listTeams(),
          listProjects(),
        ]);

        const teams =
          teamRes.status === 'fulfilled'
            ? teamRes.value.data?.teams || teamRes.value.data || []
            : [];
        const projects =
          projectRes.status === 'fulfilled'
            ? projectRes.value.data?.projects || projectRes.value.data || []
            : [];

        const myTeamSupervisors = teams
          .filter((t: any) => t.members?.some((m: any) => m._id === user?._id))
          .map((t: any) => t.supervisor)
          .filter(Boolean);

        const myProjectSupervisors = projects
          .filter((p: any) =>
            p.employees?.some((e: any) => e._id === user?._id)
          )
          .map((p: any) => p.supervisor)
          .filter(Boolean);

        const allSupervisors = [...myTeamSupervisors, ...myProjectSupervisors];

        const uniqueNames = Array.from(
          new Set(
            allSupervisors.map((s: any) =>
              `${s.firstName} ${s.lastName}`.trim()
            )
          )
        );
        const uniqueEmails = Array.from(
          new Set(
            allSupervisors
              .map((s: any) => s.email)
              .filter((e: any) => typeof e === 'string' && e.length > 0)
          )
        );

        if (isMounted) {
          setSupervisors(uniqueNames);
          setSupervisorEmails(uniqueEmails);
        }
      } catch {
        if (isMounted) {
          setSupervisors([]);
          setSupervisorEmails([]);
        }
      }
    };

    if (open && user?._id) fetchSupervisors();
    return () => {
      isMounted = false;
    };
  }, [open, user?._id]);

  const supervisorDisplay = useMemo(() => {
    if (!supervisors.length || !supervisorEmails.length) return undefined;

    
    const combined = supervisors.map((name, index) => {
      const email = supervisorEmails[index] || '';
      return `${name} - ${email}`;
    });

    return combined.join(' ');
  }, [supervisors, supervisorEmails]);
  return (
    <PopupLayout
      open={open}
      title="Profile"
      subtitle="Your account details"
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
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Avatar sx={{ width: 64, height: 64 }}></Avatar>
        <Box>
          <Typography variant="h6">
            {user?.firstName} {user?.lastName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.email}
          </Typography>
          {user?.designation && (
            <Chip
              label={user.designation}
              size="small"
              sx={{ mt: 1, width: 'fit-content' }}
            />
          )}
        </Box>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: 2,
        }}
      >
        <FieldRow
          label="First name"
          value={`${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim()}
        />

        <FieldRow label="Email" value={user?.email} />
        <FieldRow label="Designation" value={user?.designation} />
        <FieldRow label="Contact Number" value={user?.contactNumber} />
      </Box>
      <Box sx={{alignContent: 'center', marginTop: 2}}>
        <FieldRow label="Supervisor" value={supervisorDisplay} />
      </Box>
    </PopupLayout>
  );
};

export default ProfilePopup;
