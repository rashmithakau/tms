import React from 'react';
import { Box, Typography, Divider } from '@mui/material';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import BaseBtn from '../atoms/buttons/BaseBtn'; 
import { useAuth } from '../contexts/AuthContext';

interface UserPopoverBoxProps {
  onProfileClick: () => void;
  onLogoutClick: () => void;
}

const UserPopoverBox: React.FC<UserPopoverBoxProps> = ({
  onProfileClick,
  onLogoutClick,
}) => {

  const { authState} = useAuth();
  const { user } = authState;

  return (
    <Box sx={{ p: 2, minWidth: 150 }}>
      <Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
          {user?.firstName}&nbsp;{user?.lastName}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {user?.designation}
        </Typography>
        <Divider sx={{ mb: 2 }} />
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <BaseBtn
          fullWidth
          variant="text"
          onClick={onProfileClick}
          startIcon={<AccountCircleOutlinedIcon />}
          sx={{ justifyContent: 'flex-start',textTransform: 'none' }} 
        >
          Profile
        </BaseBtn>

        <BaseBtn
          fullWidth
          variant="text"
          color="primary"
          onClick={onLogoutClick}
          startIcon={<LogoutOutlinedIcon />}
          sx={{ justifyContent: 'flex-start',textTransform: 'none' }}
        >
          Logout
        </BaseBtn>
      </Box>
    </Box>
  );
};

export default UserPopoverBox;
