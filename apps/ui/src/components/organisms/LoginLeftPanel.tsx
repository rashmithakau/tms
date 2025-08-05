import { Box, Typography } from '@mui/material';
import { ILoginLeftPanelProps } from '../../interfaces/ILoginLeftPanelProps';
import theme from '../../styles/theme';

const LoginLeftPanel: React.FC<ILoginLeftPanelProps> = ({
  icon,
  title,
  description,
  imageSrc,
}) => {
  return (
    <Box
      sx={{
        height: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between', // Distributes space between top content and bottom image
        alignItems: 'center',
        padding: 4,
      }}
    >
      {/* Top Content Section */}
      <Box sx={{ textAlign: 'center', marginTop: '10%', flex: 1 }}>
        {/* Logo */}
        {icon && (
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
            <img src={icon} alt="Logo" style={{ width: 70, height: 70 }} />
          </Box>
        )}

        {/* Title */}
        {title && (
          <Typography
            variant="h3"
            sx={{
              mb: 2,

              color: theme.palette.text.primary,

              fontFamily: theme.typography.fontFamily,
            }}
          >
            {title}
          </Typography>
        )}

        {/* Description */}
        {description && (
          <Typography
            variant="body1"
            component="p"
            sx={{
              color: theme.palette.text.secondary,
              fontSize: { xs: '0.9rem', md: '1rem' },
              lineHeight: 1.5,
              fontFamily: theme.typography.fontFamily,
            }}
          >
            {description}
          </Typography>
        )}
      </Box>

      {/* Bottom Image Section */}
      <Box
        sx={{
          width: '100%',
          maxWidth: 400, // Control image container width
          height: 250, // Set specific height for image container
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 2,
        }}
      >
        <img
          src={imageSrc}
          alt="Login Background"
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain', // Maintains aspect ratio
            borderRadius: '8px', // Optional: adds rounded corners
          }}
        />
      </Box>
    </Box>
  );
};

export default LoginLeftPanel;
