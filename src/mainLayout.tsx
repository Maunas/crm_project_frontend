import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import LayoutSidebar from './components/layout/sidebar/Sidebar';
import { UserProvider } from 'src/features/users/UserProvider';

export default function MainLayout() {
  return (
    <UserProvider>
      <Box sx={{ display: 'flex', width: "100%", height: "100%" }}>
        <LayoutSidebar>
          <Outlet />
        </LayoutSidebar>
      </Box>
    </UserProvider>
  );
}