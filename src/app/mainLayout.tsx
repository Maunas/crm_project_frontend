import { Outlet } from 'react-router-dom';
import { UserProvider } from 'src/stores/UserProvider';
import LayoutSidebar from 'shared/layout/sidebar/Sidebar';

export default function MainLayout() {
  return (
    <UserProvider>
      <LayoutSidebar>
        <Outlet />
      </LayoutSidebar>
    </UserProvider>
  );
}