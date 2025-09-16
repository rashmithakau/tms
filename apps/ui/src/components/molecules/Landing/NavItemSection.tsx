import React from 'react';
import Box from '@mui/material/Box';
import BaseButton from '../../atoms/buttons/BaseBtn';

interface NavItemSectionProps {
  items: { label: string; target: string }[];
  onNavigate: (id: string) => void;
  display?: any;
  direction?: 'row' | 'column';
  alignItems?: string;
}

const NavItemSection: React.FC<NavItemSectionProps> = ({
  items,
  onNavigate,
  display = { xs: 'none', sm: 'block' },
  direction = 'row',
  alignItems = 'center',
}) => {
  return (
    <Box
      sx={{
        display,
        flexDirection: direction,
        alignItems,
      }}
    >
      {items.map((item) => (
        <BaseButton
          variant="text"
          key={item.target}
          onClick={() => onNavigate(item.target)}
          sx={{
            mx: direction === 'row' ? 0.5 : 0,
            my: direction === 'column' ? 0.5 : 0,
            width: direction === 'column' ? '100%' : 'auto',
            justifyContent: 'flex-start',
          }}
        >
          {item.label}
        </BaseButton>
      ))}
    </Box>
  );
};

export default NavItemSection;