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

const ProfilePopup: React.FC<ProfilePopupProps> = ({ open, onClose, user: overrideUser }) => {
  const { authState } = useAuth();
  const user = (overrideUser as any) ?? (authState.user as any);
  
  const supervisorDisplay = useSupervisorDisplay({ user, open });

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