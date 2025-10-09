import React from 'react';
import { Box, Divider } from '@mui/material';
import PopupLayout from '../../templates/popup/PopUpLayout';
import BaseButton from '../../atoms/common/button/BaseBtn';
import { 
  ProfileHeader, 
  ProfileContactSection, 
  ProfileWorkSection 
} from '../../molecules/profile';
import { ProfileSectionLabel } from '../../atoms/profile';
import { useSupervisorDisplay } from '../../../hooks/profile';
import { ProfilePopupProps } from '../../../interfaces/organisms/popup';
import { useAuth } from '../../../contexts/AuthContext';

const ProfilePopup: React.FC<ProfilePopupProps> = ({ open, onClose }) => {
  const { authState } = useAuth();
  const user = authState.user as any;
  
  const supervisorDisplay = useSupervisorDisplay({ user, open });

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

          console.log('myTeamSupervisors', myTeamSupervisors);
          console.log('myProjectSupervisors', myProjectSupervisors);
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
      {/* Profile Header Section */}
      <ProfileHeader
        firstName={user?.firstName}
        lastName={user?.lastName}
        role={user?.role}
        designation={user?.designation}
      />

      {/* Contact Information Section */}
      <ProfileContactSection
        email={user?.email}
        contactNumber={user?.contactNumber}
      />

      <Divider sx={{ my: 3 }} />

      {/* Work Information Section */}
      <ProfileSectionLabel label="Work Information" />
      <ProfileWorkSection supervisorDisplay={supervisorDisplay} />
    </PopupLayout>
  );
};

export default ProfilePopup;