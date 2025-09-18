import { IFormLayoutProps } from '../../../interfaces/layout/IFormLayoutProps';
import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const FormLayout: React.FC<IFormLayoutProps> = ({ title, formContent }) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: theme.palette.background.default,
      }}
    >
      {/* Title */}
      <Box>
        <Typography
          variant="h4"
          sx={{
            color: theme.palette.text.primary,
            textAlign: 'center',
            mt: 3,
          }}
        >
          {title}
        </Typography>
      </Box>
      {/* Form Content */}
      <Box
        sx={{
          alignItems: 'center',

          justifyContent: 'center',
          padding: 1,
          maxWidth: 600,
          width: '100%',
          overflow: 'hidden',
          flex: 1,
        }}
      >
        {formContent}
      </Box>
    </Box>
  );
};

export default FormLayout;
