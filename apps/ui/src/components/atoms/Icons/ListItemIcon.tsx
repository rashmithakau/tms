import React from 'react';
import { ListItemIcon as MuiListItemIcon } from '@mui/material';

interface ListItemIconProps {
  children: React.ReactNode;
  open?: boolean;
}

const ListItemIcon: React.FC<ListItemIconProps> = ({ children }) => {
  return (
    <MuiListItemIcon
      sx={[
        {
          color: 'inherit',
          minWidth: 0,
          justifyContent: 'center',
        },
        {
          mr: 3,
        },
      ]}
    >
      {children}
    </MuiListItemIcon>
  );
};

export default ListItemIcon;
