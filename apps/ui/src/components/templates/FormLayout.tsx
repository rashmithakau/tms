import { IFormLayoutProps } from '../../interfaces/IFormLayoutProps';
import { Box, Typography } from '@mui/material';
import theme from '../../styles/theme';

const FormLayout: React.FC<IFormLayoutProps> = ({ title, formContent }) => {
  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
    }}>
      {/* Title */}
      <Box>
        <Typography
          variant="h3"
          sx={{
            fontFamily: theme.typography.fontFamily,
            color: theme.palette.text.secondary,
            textAlign: 'center',
            mt: 7,
          }}
        >
          {title}
        </Typography>
      </Box>
      {/* Form Content */}
      <Box
        sx={{ alignItems: 'center', display: 'flex', justifyContent: 'center'  }}
      >
        {formContent}
      </Box>
    </Box>
  );
};

export default FormLayout;
