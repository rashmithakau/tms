import { Box, Drawer, Typography} from '@mui/material';
import { styled } from '@mui/material/styles';
import DrawerList from './../molecules/DrawerList';
import logo from '../../assets/images/WebSiteLogo.svg'
import InboxIcon from '@mui/icons-material/Inbox';
import MailIcon from '@mui/icons-material/Mail';

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

const StyledDrawer = styled(Drawer)(({ theme, open }) => ({
  width: open ? 240 : 60,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: open
      ? theme.transitions.duration.enteringScreen
      : theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  '& .MuiDrawer-paper': {
    width: open ? 350 : 60,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: open
        ? theme.transitions.duration.enteringScreen
        : theme.transitions.duration.leavingScreen,
    }),
    border: 'none',
    boxShadow: 'none',
  },
}));



export default function NavDrawer({ open, handleDrawer }: any) {
  const items = [
    [
      { text: 'Inbox', icon: <InboxIcon /> },
      { text: 'Drafts', icon: <MailIcon /> },
    ],
    [
      { text: 'Trash', icon: <InboxIcon /> },
      { text: 'Spam', icon: <MailIcon /> },
    ],
  ];
  return (
    <StyledDrawer
      variant="permanent"
      open={open}
      onMouseEnter={() => handleDrawer(true)}
      onMouseLeave={() => handleDrawer(false)}
    >
      <DrawerHeader>
        <Box
          sx={{
            display: 'flex',
            justifyContent: open ? 'center' : 'flex-start', // Changed "left" to "flex-start" for consistency
            alignItems: 'center',
            height: '100%',
            width: '100%',
            gap: 2,
            paddingTop: 2,
            paddingBottom: 2
          }}
        >
          <img
            src={logo}
            alt="Logo"
            style={{
              width: 47,
              height: 47,
            }}
        
          />
          {open && ( 
            <Typography fontSize={30}>TimeSync</Typography>
          )}
        </Box>
      </DrawerHeader>
      <DrawerList items={items} />
    </StyledDrawer>
  );
}
