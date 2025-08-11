import styled from '@emotion/styled';
import { Grid, Paper, Box, Typography } from '@mui/material';
import { IAuthFormContainer } from '../interfaces/IAuthFormContainer';
import { useTheme } from '@mui/material/styles';

const StylePaper = styled(Paper)(() => ({
  minHeight: 400,
  minWidth: 300,
  maxWidth: 460,
  borderRadius: 16,
  boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
  border: '2px solid',
  borderColor: 'rgba(29, 27, 27, 0.1)',
}));

const AuthFormContainer: React.FC<IAuthFormContainer> = ({
  icon,
  title,
  children,
}) => {
  const theme = useTheme();
  return (
    <StylePaper>
      <Box
        sx={{
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 'inherit', 
          minHeight: 'inherit',
          padding: '20px 16px',
          backgroundColor: theme.palette.background.default,
        }}
      >
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
          {icon &&
            (typeof icon === 'string' ? (
              <img
                src={icon}
                style={{ width: '60px', height: '60px' }}
                alt="icon"
              />
            ) : (
              icon
            ))}
        </Box>
        {/* Title */}
        <Typography variant="h4" sx={{ mb: 2 }} textAlign="center">
          {title}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          {children}
        </Box>
      </Box>
    </StylePaper>
  );
};

export default AuthFormContainer;
