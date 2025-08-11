import { Box, Grid } from '@mui/material';
import { ICenterContainer } from '../../interfaces/ICenterContainer';
import { useTheme } from '@mui/material/styles';

const CenterContainerLayout: React.FC<ICenterContainer> = ({
  children,
}) => {
  const theme = useTheme();
  return (
    <Grid container sx={{ height: '100vh', overflow: 'hidden', bgcolor: theme.palette.background.paper }}>
      <Box sx={{ justifyContent: 'center', alignItems: 'center', display: 'flex', width: '100%' }}>
        {children}
      </Box>
    </Grid>
  );
};

export default CenterContainerLayout;
