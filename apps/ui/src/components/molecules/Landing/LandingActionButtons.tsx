import React from 'react';
import Stack from '@mui/material/Stack';
import BaseButton from '../../atoms/buttons/BaseBtn';
import { useTheme } from '@mui/material/styles';
import { ArrowForward } from '@mui/icons-material';

interface LandingActionButtonsProps {
  onGetStarted: () => void;
  onExplore: () => void;
}

const LandingActionButtons: React.FC<LandingActionButtonsProps> = ({ onGetStarted, onExplore }) => {
  const theme = useTheme();
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
      <BaseButton
        variant="contained"
        size="large"
        onClick={onGetStarted}
        endIcon={<ArrowForward />}
        sx={{
          bgcolor: theme.palette.primary.main,
          px: 4,
          py: 1.5,
          '&:hover': { bgcolor: theme.palette.primary.dark },
        }}
      >
        Get Started
      </BaseButton>
      <BaseButton
        variant="outlined"
        size="large"
        sx={{
          borderColor: theme.palette.primary.main,
          color: theme.palette.primary.main,
          px: 4,
          py: 1.5,
          '&:hover': {
            borderColor: theme.palette.primary.dark,
            bgcolor: theme.palette.primary.main + '10',
          },
        }}
        onClick={onExplore}
      >
        Explore More
      </BaseButton>
    </Stack>
  );
};

export default LandingActionButtons;


