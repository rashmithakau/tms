import Box from '@mui/material/Box';
import CustomAppBar from '../../organisms/dashboard/AppBar';
import { useTheme } from '@mui/material/styles';
import { ISecondaryLayoutProps } from '../../../interfaces/layout';

export default function SecondaryLayout({ children }: ISecondaryLayoutProps) {
  const theme = useTheme();

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <CustomAppBar hasDrawer={false} />
      <Box
        sx={{
          flexGrow: 1,
          marginTop: '60px',
          backgroundColor: theme.palette.background.paper,
          overflow: 'auto',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
