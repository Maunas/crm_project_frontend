import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import MuiAppBar, { type AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import { styled } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import { HeaderSearchBar } from './HeaderSearchBar';
import { drawerWidth } from './Sidebar';
import { UserInfo } from './UserInfo';

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const HeaderBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  variants: [
    {
      props: ({ open }) => open,
      style: {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
      },
    },
  ],
}));

interface HeaderProps extends MuiAppBarProps {
  handleDrawerOpen: () => void,
  open: boolean;
}

export default function Header({ handleDrawerOpen, open }: HeaderProps) {

  return (
    <HeaderBar position="fixed" open={open} >
      <Toolbar>
        <IconButton size="large" edge="start" aria-label="open drawer"
          sx={[
            {
              marginRight: 5,
            },
            open && { display: 'none' },
          ]}
          onClick={handleDrawerOpen}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h3" noWrap component="div" color='primary'
          sx={{ display: { xs: 'none', sm: 'block' } }} >MUI</Typography>
        <Box sx={{ flexGrow: 1 }} />
        <HeaderSearchBar />
        <Box sx={{ flexGrow: 1 }} />
        <UserInfo />
      </Toolbar>
    </HeaderBar>
  );
}