import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

export interface NavItem {
  label: string;
  target: string;
}

interface NavLinksProps {
  items: NavItem[];
  onNavigate: (targetId: string) => void;
}

const NavLinks: React.FC<NavLinksProps> = ({ items, onNavigate }) => {
  return (
    <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
      {items.map((item) => (
        <Button key={item.target} onClick={() => onNavigate(item.target)} sx={{ mx: 0.5 }}>
          {item.label}
        </Button>
      ))}
    </Box>
  );
};

export default NavLinks;


