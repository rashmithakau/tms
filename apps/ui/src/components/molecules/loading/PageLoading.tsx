import { Box, CircularProgress, Typography, Fade } from '@mui/material';
import { IPageLoadingProps } from '../../../interfaces/component/IPageLoadingProps';

const PageLoading: React.FC<IPageLoadingProps> = ({
  message = 'Loading...',
  size = 'medium',
  variant = 'fullscreen',
  showMessage = true,
}) => {
  const getSizeValue = () => {
    switch (size) {
      case 'small': return 24;
      case 'large': return 64;
      default: return 40;
    }
  };

  const getContainerStyles = () => {
    switch (variant) {
      case 'inline':
        return {
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 2,
          minHeight: '100px',
          position: 'static',
          top: 'auto',
          left: 'auto',
          right: 'auto',
          bottom: 'auto',
          backgroundColor: 'transparent',
          zIndex: 'auto',
          height: 'auto',
        };
      case 'overlay':
        return {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          zIndex: 1000,
          padding: 0,
          minHeight: 'auto',
          height: 'auto',
        };
      default: 
        return {
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          backgroundColor: '#f5f5f5',
          position: 'static',
          top: 'auto',
          left: 'auto',
          right: 'auto',
          bottom: 'auto',
          zIndex: 'auto',
          padding: 0,
          minHeight: 'auto',
        };
    }
  };

  return (
    <Fade in={true} timeout={300}>
      <Box sx={getContainerStyles()}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <CircularProgress size={getSizeValue()} />
          {showMessage && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: 'center' }}
            >
              {message}
            </Typography>
          )}
        </Box>
      </Box>
    </Fade>
  );
};

export default PageLoading;

