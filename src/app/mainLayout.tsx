import { Outlet } from 'react-router-dom';
import LayoutSidebar from 'shared/layout/sidebar/Sidebar';

export default function MainLayout() {
  return (
    <LayoutSidebar>
      <Outlet />
    </LayoutSidebar>
  );
}