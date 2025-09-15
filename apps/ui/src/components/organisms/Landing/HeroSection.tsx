import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import useMediaQuery from '@mui/material/useMediaQuery';
import LandingPageLogo from '../../../assets/images/Landing Page.png';
import HeroSectionTemplate from '../../templates/HeroSectionLayout';
import LandingActionButtons from '../../molecules/Landing/LandingActionButtons';

const HeroSection: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const handleScrollTo = (selector: string) => {
    const element = document.querySelector(selector);
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  return (
    <HeroSectionTemplate
      id="home"
      mobileImageFirst
      background={`linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.primary.main}05 100%)`}
      title={
        <Typography
          variant={isMobile ? 'h3' : 'h2'}
          component="span"
          sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}
        >
          Designed for Better Time Management
        </Typography>
      }
      description={
        <>
          Log your hours, monitor your tasks, and manage your day — all in one
          place. TimeSync provides comprehensive time tracking and project
          management solutions for teams of all sizes.
        </>
      }
      actions={
        <LandingActionButtons
          onGetStarted={() => navigate('/login')}
          onExplore={() => handleScrollTo('#features')}
        />
      }
      image={
        <Box
          component="img"
          src={LandingPageLogo}
          alt="TimeSync dashboard illustration"
          sx={{ maxWidth: '100%', height: 'auto', maxHeight: 350 }}
        />
      }
    />
  );
};

export default HeroSection;
