import { RequirePermission } from "src/components/auth/RequirePermission";
import { SystemAuditList } from "src/features/audit/SystemAuditLogs";
import { CampaignDetails } from "src/features/campaigns/CampaignDetails";
import { GlobalDashboardPage } from "src/features/dashboard/GlobalDashboardPage";
import { OrgDashboardPage } from "src/features/dashboard/OrgDashboardPage";
import { AutomationList } from "src/features/fieldAutomation/AutomationList";
import { AutomationPage } from "src/features/fieldAutomation/AutomationPage";
import { LeadDetailsLayout } from "src/features/lead/details/LeadDetails";
import { ImportLeadsPage } from "src/features/lead/ImportLeadsPage";
import { CreateLeadFormPage, UpdateLeadFormPage } from "src/features/lead/leadForm/LeadFormWraper";
import { LeadListPage } from "src/features/lead/leadList/LeadListPage";
import { LeadFlowEditor } from "src/features/leadFlows/FlowEditorPage";
import { NomenclatorList } from "src/features/nomenclators/NomenclatorList";
import OrganizationList from "src/features/organizations/OrganizationList";
import OrgProperties, { LEAD_PROPERTIES } from "src/features/orgProperties/orgPropertiesList";
import { SearchResultsList } from "src/features/search/SearchResults";
import { TeamsPage } from "src/features/teams/TeamsPage";
import { WorkspaceList } from "src/features/workspaces/WorkspaceList";
import { ProfilePage } from "src/pages/ProfilePage";
import { useUserContext } from "src/stores/UserContext";
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import PersonIcon from '@mui/icons-material/Person';
import StoreIcon from '@mui/icons-material/Store';
import LabelIcon from '@mui/icons-material/Label';
import WorkIcon from '@mui/icons-material/Work';
import TuneIcon from '@mui/icons-material/Tune';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import DashboardIcon from '@mui/icons-material/Dashboard';
import GroupIcon from '@mui/icons-material/Group';
import type { ReactNode } from "react";

/** Lista de rutas a usar en el sistema. 
 * Automáticamente completa el navbar y acomoda los permisos para su acceso. */

export interface RouteListProps {
    path: string,
    title: string,
    element: ReactNode,
    regularNavbar?: boolean,
    globalNavbar?: boolean,
    icon?: ReactNode,
    permission?: string | string[]
}

// Muestra GlobalDashboard para Panel Global (id=1), OrgDashboard para el resto
function DashboardRouter() {
    const { activeOrg } = useUserContext()
    if (activeOrg?.id === 1) return <GlobalDashboardPage />
    return <OrgDashboardPage />
}

const LEAD_ROUTES: RouteListProps[] = [
    { path: "/leads/", title: "Leads", element: <LeadListPage />, regularNavbar: true, icon: <PersonIcon />, permission: "lead:view" },
    { path: "/leads/new", title: "Nuevo Lead", element: <CreateLeadFormPage />, permission: "lead:create" },
    { path: "/leads/modify/:id", title: "Modificar Lead", element: <UpdateLeadFormPage />, permission: "lead:update" },
    { path: "/leads/:id", title: "Detalle de Lead", element: <LeadDetailsLayout />, permission: "lead:view" },
    { path: "/leads/import", title: "Importar Leads", element: <ImportLeadsPage />, permission: "lead:create" },
]

/** Lista de rutas que se muestran con Navbar */
const ROUTE_LIST_OUTLET: RouteListProps[] = [
    { path: "/dashboard", title: "Dashboard", element: <DashboardRouter />, regularNavbar: true, globalNavbar: true, icon: <DashboardIcon /> },
    ...LEAD_ROUTES,
    { path: "/campaigns/", title: "Campañas", element: <WorkspaceList />, regularNavbar: true, icon: <WorkIcon />, permission: "workspace:view" },
    { path: "/campaigns/:id", title: "Detalle de Campaña", element: <CampaignDetails />, permission: "campaign:view" },
    { path: "/nomenclators/", title: "Nomencladores", element: <NomenclatorList />, regularNavbar: true, icon: <LabelIcon />, permission: "nomenclator:view" },
    { path: "/automations/", title: "Automatizaciones", element: <AutomationList />, regularNavbar: true, icon: <AutoFixHighIcon />, permission: "field_automation:view" },
    { path: "/automations/:id", title: "Detalle de Automatización", element: <AutomationPage />, permission: "field_automation:view" },
    { path: "/organizations/", title: "Organizaciones", element: <OrganizationList />, regularNavbar: true, globalNavbar: true, icon: <StoreIcon />, permission: "organization:view" },
    { path: "/org-properties/", title: "Propiedades de Organización", element: <OrgProperties />, regularNavbar: true, icon: <TuneIcon />, permission: LEAD_PROPERTIES.map(prop => prop.permission) },
    { path: "/lead-flow-editor/:id?", title: "Editor de Flujo", element: <LeadFlowEditor />, permission: "lead_flow:view" },
    { path: "/teams/", title: "Equipos y Enrutamiento", element: <TeamsPage />, regularNavbar: true, icon: <GroupIcon />, permission: "team:view" },
    { path: "/audit-logs/", title: "Auditoría de Sistema", element: <SystemAuditList />, regularNavbar: true, globalNavbar: true, icon: <VerifiedUserIcon />, permission: "system_audit_log:view" },
    { path: "/search", title: "Búsqueda", element: <SearchResultsList />, permission: "lead:view" },
    { path: "/profile", title: "Mi Perfil", element: <ProfilePage /> },
]

/**Agrega automáticamente el RequirePermision, usando los props element y permission. */
export const ROUTE_LIST_OUTLET_PROCESSED = ROUTE_LIST_OUTLET
    .map(i => ({
        ...i,
        element: <RequirePermission permission={i.permission}>{i.element}</RequirePermission>
    }))