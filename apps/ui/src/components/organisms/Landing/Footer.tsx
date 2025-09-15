import React from 'react';
import Box from '@mui/material/Box';
import SectionContainer from '../../atoms/Landing/SectionContainer';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import WebSiteLogo from '../../../assets/images/WebSiteLogo.png';
import BrandLogo from '../../atoms/Landing/BrandLogo';
const Footer: React.FC = () => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        py: 4,
        bgcolor: theme.palette.background.default,
        borderTop: `1px solid ${theme.palette.divider}`,
      }}
    >
      <SectionContainer>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <BrandLogo src={WebSiteLogo} alt="TimeSync Logo" title="TimeSync" />
          <Typography variant="body2" color="text.secondary">
            © 2025 TimeSync. All rights reserved.
          </Typography>
        </Box>
      </SectionContainer>
    </Box>
  );
};

export default Footer;
