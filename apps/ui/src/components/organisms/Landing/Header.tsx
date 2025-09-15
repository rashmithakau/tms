import React from 'react';
import SectionContainer from '../../atoms/Landing/SectionContainer';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import { useNavigate, useLocation } from 'react-router-dom';
import WebSiteLogo from '../../../assets/images/WebSiteLogo.png';
import BrandLogo from '../../atoms/Landing/BrandLogo';
import NavLinks from '../../molecules/Landing/NavLinks';
import BaseButton from '../../atoms/buttons/BaseBtn';

const Header: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: 'Home', target: 'home' },
    { label: 'Features', target: 'features' },
    { label: 'Roles', target: 'roles' },
  ];

  const handleScrollTo = (targetId: string) => {
    const performScroll = () => {
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };

    if (location.pathname !== '/') {
      navigate('/', { replace: false });
      // Wait a tick for route change, then scroll
      setTimeout(performScroll, 50);
    } else {
      performScroll();
    }
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        bgcolor: theme.palette.background.default,
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}
    >
      <SectionContainer>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            py: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <BrandLogo src={WebSiteLogo} alt="TimeSync Logo" title="TimeSync" />
          </Box>
          <NavLinks items={navItems} onNavigate={handleScrollTo} />
          <BaseButton
            variant="contained"
            onClick={() => navigate('/login')}
            sx={{
              bgcolor: theme.palette.primary.main,
              '&:hover': { bgcolor: theme.palette.primary.dark },
            }}
          >
            Sign In
          </BaseButton>
        </Box>
      </SectionContainer>
    </Box>
  );
};

export default Header;
