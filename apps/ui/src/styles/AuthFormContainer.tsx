import styled from '@emotion/styled';
import { Grid, Paper, Box, Typography } from '@mui/material';
import { IAuthFormContainer } from '../interfaces/IAuthFormContainer';
import theme from '../styles/theme';

const StylePaper = styled(Paper)(() => ({
  width: '100%',
  height: '100%',
  minHeight: 400,
  minWidth: 300,
  maxWidth: 460,
  borderRadius: 16,
  boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
  border: '2px solid',
  borderColor: theme.palette.divider,
  fontFamily: theme.typography.fontFamily,

}));

const AuthFormContainer: React.FC<IAuthFormContainer> = ({
  icon,
  title,
  children,
}) => {
  return (
    <div>
      <StylePaper>
        <Grid
          sx={{
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            padding: '20px 16px',
            mt: 2,
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
          <Typography
            variant="h4"
            sx={{ mb: 2 }}
            fontFamily={theme.typography.fontFamily}
            textAlign="center"
          >
            {title}
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            {children}
          </Box>
        </Grid>
      </StylePaper>
    </div>
  );
};

export default AuthFormContainer;
