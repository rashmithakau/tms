import React from 'react';
import { Box, Typography, Divider } from '@mui/material';
import BaseBtn from '../atoms/buttons/BaseBtn';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';

interface UserPopoverBoxProps {
  onProfileClick: () => void;
  onLogoutClick: () => void;
}

const UserPopoverBox: React.FC<UserPopoverBoxProps> = ({ onProfileClick, onLogoutClick }) => {
    return (
        <Box sx={{ p: 2, width: 250 }}>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              Rashmitha Kaushalya
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Software Engineer
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
