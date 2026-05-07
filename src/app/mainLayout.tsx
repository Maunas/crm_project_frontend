import { Outlet } from 'react-router-dom';
import { UserProvider } from 'src/features/users/UserProvider';
import LayoutSidebar from 'src/components/layout/sidebar/Sidebar';

export default function MainLayout() {
  return (
    <UserProvider>
      <LayoutSidebar>
        <Outlet />
      </LayoutSidebar>
    </UserProvider>
  );
}