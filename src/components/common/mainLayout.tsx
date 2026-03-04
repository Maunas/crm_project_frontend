import { Outlet } from 'react-router-dom';
import LayoutSidebar from './layout/Sidebar';
import { Box } from '@mui/material';

export default function MainLayout() {
  return (
    <Box sx={{ display: 'flex', width:"100%", height:"100%" }}>
      <LayoutSidebar>
        <Outlet />
      </LayoutSidebar>
    </Box>
  );
}