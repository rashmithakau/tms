import { Box, CircularProgress } from '@mui/material';

interface LoadingSpinnerProps {
  size?: number;
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 40, 
  message 
}) => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
      <CircularProgress size={size} />
      {message && (
        <Box sx={{ ml: 2, display: 'flex', alignItems: 'center' }}>
          {message}
        </Box>
      )}
    </Box>
  );
};

export default LoadingSpinner;


