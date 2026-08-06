import { CreateLeadFormPage, UpdateLeadFormPage } from "features/lead/leadForm/LeadFormWraper";
import { OrganizationList } from "features/organizations/OrganizationList";
import OrgProperties, { LEAD_PROPERTIES } from "./features/orgProperties/orgPropertiesList";
import { AutomationList } from "features/fieldAutomation/AutomationList";
import { AutomationPage } from "features/fieldAutomation/AutomationPage";
import { NomenclatorList } from "features/nomenclators/NomenclatorList";
import { LeadFlowEditor } from "src/features/leadFlows/FlowEditorPage";
import { LeadDetailsLayout } from "features/lead/details/LeadDetails";
import { CampaignDetails } from "features/campaigns/CampaignDetails";
import { LeadListPage } from "features/lead/leadList/LeadListPage";
import { SearchResultsList } from "features/search/SearchResults";
import { WorkspaceList } from "features/workspaces/WorkspaceList";
import { LoginFormPage } from "./features/auth/LoginForm";
import { SignupFormPage } from "features/auth/SignupForm";
import MainLayout from "./app/mainLayout";
import { NotFound } from "./pages/NotFound";
import { ProfilePage } from "./pages/ProfilePage";
import { OnboardingPage } from "./pages/OnboardingPage";
import { OrgDashboardPage } from "./features/dashboard/OrgDashboardPage";
import { GlobalDashboardPage } from "./features/dashboard/GlobalDashboardPage";
import { useUserContext } from "src/stores/UserContext";
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { ImportLeadsPage } from "./features/lead/ImportLeadsPage";
import { SystemAuditList } from "./features/audit/SystemAuditLogs";
import { TeamsPage } from "./features/teams/TeamsPage";
import { RequirePermission } from "./app/RequirePermission";

// Muestra GlobalDashboard para Panel Global (is_system), OrgDashboard para el resto
function DashboardRouter() {
    const { activeOrg } = useUserContext()
    if (activeOrg?.is_system) return <GlobalDashboardPage />
    return <OrgDashboardPage />
}

export const router = createBrowserRouter([
    {
        path: "/login",
        Component: LoginFormPage,
    },
    {
        path: "/signup",
        Component: SignupFormPage,
    },
    {
        path: "/onboarding",
        Component: OnboardingPage,
    },
    {
        path: "/",
        Component: MainLayout,
        children: [
            {
                index: true,
                element: <Navigate to="/dashboard" replace />,
            },
            {
                path: "/dashboard",
                Component: DashboardRouter,
            },
            {
                path: "/leads",
                Component: Outlet,
                children: [
                    { path: "/leads/", element: <RequirePermission permission="lead:view"><LeadListPage /></RequirePermission> },
                    { path: "/leads/new", element: <RequirePermission permission="lead:create"><CreateLeadFormPage /></RequirePermission> },
                    { path: "/leads/modify/:id", element: <RequirePermission permission="lead:update"><UpdateLeadFormPage /></RequirePermission> },
                    { path: "/leads/:id", element: <RequirePermission permission="lead:view"><LeadDetailsLayout /></RequirePermission> },
                ]
            },
            { path: "/teams/", element: <RequirePermission permission="team:view"><TeamsPage /></RequirePermission> },
            { path: "/leads/import", element: <RequirePermission permission="lead:create"><ImportLeadsPage /></RequirePermission> },
            { path: "/campaigns/", element: <RequirePermission permission="workspace:view"><WorkspaceList /></RequirePermission> },
            { path: "/nomenclators/", element: <RequirePermission permission="nomenclator:view"><NomenclatorList /></RequirePermission> },
            { path: "/audit-logs/", element: <RequirePermission permission="system_audit_log:view"><SystemAuditList /></RequirePermission> },
            { path: "/organizations/", element: <RequirePermission permission="organization:view"><OrganizationList /></RequirePermission> },
            { path: "/automations/", element: <RequirePermission permission="field_automation:view"><AutomationList /></RequirePermission> },
            { path: "/automations/:id", element: <RequirePermission permission="field_automation:view"><AutomationPage /></RequirePermission> },
            { path: "/campaigns/:id", element: <RequirePermission permission="campaign:view"><CampaignDetails /></RequirePermission> },
            { path: "/search", element: <RequirePermission permission="lead:view"><SearchResultsList /></RequirePermission> },
            { path: "/org-properties/", element: <RequirePermission permission={LEAD_PROPERTIES.map(prop => prop.permission)}><OrgProperties /></RequirePermission> },
            { path: "/lead-flow-editor/:id?", element: <RequirePermission permission="lead_flow:view"><LeadFlowEditor /></RequirePermission> },
            { path: "/profile", element: <ProfilePage /> },
            { path: "*", Component: NotFound },
        ]
    },
])
