import React from 'react';
import { ListItemButton as MuiListItemButton } from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface ListItemButtonProps {
  children: React.ReactNode; // Accepts child components (e.g., icons, text)
  onClick?: () => void; // Optional click handler
  sx?: object; // Optional custom styles
}

const ListItemButton: React.FC<ListItemButtonProps> = ({ children, onClick, sx }) => {
  const theme = useTheme();

  return (
    <MuiListItemButton
      onClick={onClick}
      sx={{
        color: theme.palette.text.primary,
        '&:hover': {
          backgroundColor: theme.palette.background.default,
          color: theme.palette.primary.main,
        },
        borderRadius: '10px',
        padding: '10px 15px',
        marginX: '5px',
        ...sx, // Merge custom styles
      }}
    >
      {children}
    </MuiListItemButton>
  );
};

export default ListItemButton;