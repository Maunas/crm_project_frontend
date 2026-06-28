import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import LayoutSidebar from 'shared/layout/sidebar/Sidebar';
import { LeadNavigationProvider } from 'src/features/lead/stores/LeadNavigationContext';
import { useUserContext } from 'src/stores/UserContext';
import LoadingScreenWrapper from 'src/components/feedback/LoadingScreen';

export default function MainLayout() {
    const { user, isRestoring, userOrganizations, loadingOrgs } = useUserContext()
    const nav = useNavigate()

    useEffect(() => {
        if (!isRestoring && !user) nav('/login', { replace: true })
    }, [user, isRestoring, nav])

    // Si el usuario no tiene ninguna org (y ya terminaron de cargar) -> onboarding
    useEffect(() => {
        if (!isRestoring && !loadingOrgs && user && userOrganizations.length === 0) {
            nav('/onboarding', { replace: true })
        }
    }, [user, isRestoring, loadingOrgs, userOrganizations, nav])

    if (isRestoring) return (
        <LoadingScreenWrapper loading sx={{ height: "100vh" }} />
    )

    if (!user) return null

    return (
        <LayoutSidebar>
            <LeadNavigationProvider>
                <Outlet />
            </LeadNavigationProvider>
        </LayoutSidebar>
    )
}
