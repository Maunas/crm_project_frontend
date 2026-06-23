import { CreateLeadFormPage, UpdateLeadFormPage } from "features/lead/leadForm/LeadFormWraper";
import { OrganizationList } from "features/organizations/OrganizationList";
import LeadProperties from "./features/leadProperties/leadPropertiesList";
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
import { createBrowserRouter, Outlet } from "react-router-dom";
import { ImportLeadsPage } from "./features/lead/ImportLeadsPage";
import { SystemAuditList } from "./features/audit/SystemAuditLogs";

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
        // Layout principal
        path: "/",
        Component: MainLayout,
        children: [
            // Rutas dentro del layout
            {
                path: "/",
                element: <div>Home Test</div>
            },

            {
                path: "/leads",
                Component: Outlet,
                children: [
                    {
                        path: "/leads/",
                        Component: LeadListPage
                    },
                    {
                        path: "/leads/new",
                        Component: CreateLeadFormPage
                    },
                    {
                        path: "/leads/modify/:id",
                        Component: UpdateLeadFormPage
                    },
                    {
                        path: "/leads/:id",
                        Component: LeadDetailsLayout
                    },
                ]
            },

            {
                path: "/leads/import",
                Component: ImportLeadsPage
            },
            {
                path: "/campaigns/",
                Component: WorkspaceList
            },
            {
                path: "/nomenclators/",
                Component: NomenclatorList
            },
            {
                path: "/audit-logs/",
                Component: SystemAuditList
            },
            {
                path: "/organizations/",
                Component: OrganizationList
            },
            {
                path: "/automations/",
                Component: AutomationList
            },
            {
                path: "/automations/:id",
                Component: AutomationPage
            },
            {
                path: "/campaigns/:id",
                Component: CampaignDetails
            },
            {
                path: "/search",
                Component: SearchResultsList,
            },
            {
                path: "/lead-properties/",
                Component: LeadProperties,
            },
            {
                path: "/lead-flow-editor/:id?",
                Component: LeadFlowEditor,
            },
            {
                path: "*", // Si no coincide con nada más.
                Component: NotFound
            },
        ]
    }
]);