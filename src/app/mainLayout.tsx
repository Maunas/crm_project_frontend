import { Outlet } from 'react-router-dom';
import LayoutSidebar from 'shared/layout/sidebar/Sidebar';
import { LeadNavigationProvider } from 'src/features/lead/stores/LeadNavigationContext';

export default function MainLayout() {
  return (
    <LayoutSidebar>
      <LeadNavigationProvider>
        <Outlet />
      </LeadNavigationProvider>
    </LayoutSidebar>
  );
}