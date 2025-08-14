import React from 'react';
import { useSelector } from 'react-redux';
import { Box, Typography, Divider } from '@mui/material';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import BaseBtn from '../atoms/buttons/BaseBtn'; // Adjust the import path as needed

interface UserPopoverBoxProps {
  onProfileClick: () => void;
  onLogoutClick: () => void;
}

const UserPopoverBox: React.FC<UserPopoverBoxProps> = ({ onProfileClick, onLogoutClick }) => {
  // Correctly retrieve the user object from Redux state
  const user = useSelector((state: any) => state.user?.user);

  return (
    <Box sx={{ p: 2, width: 250 }}>
      <Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
          {user?.firstName || 'Guest'} {user?.lastName || ''}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {user?.designation || 'No designation available'}
        </Typography>
        <Divider sx={{ mb: 2 }} />
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <BaseBtn
          fullWidth
          variant="outlined"
          onClick={onProfileClick}
          startIcon={<AccountCircleOutlinedIcon />}
          aria-label="View Profile"
        >
          Profile
        </BaseBtn>
        <BaseBtn
          fullWidth
          variant="contained"
          color="primary"
          onClick={onLogoutClick}
          startIcon={<LogoutOutlinedIcon />}
          aria-label="Logout"
        >
          Logout
        </BaseBtn>
      </Box>
    </Box>
  );
};

export default UserPopoverBox;