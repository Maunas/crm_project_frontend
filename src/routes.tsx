import { NotFound } from "./pages/NotFound";
import { LeadDetailsLayout } from "features/lead/details/LeadDetails";
import { CampaignDetails } from "features/campaigns/CampaignDetails";
import { WorkspaceList } from "features/workspaces/WorkspaceList";
import { CreateLeadFormPage, UpdateLeadFormPage } from "features/lead/leadForm/LeadFormWraper";
import { LeadListPage } from "features/lead/leadList/LeadListPage";
import { OrganizationList } from "features/organizations/OrganizationList";
import { NomenclatorList } from "features/nomenclators/NomenclatorList";
import { LoginFormPage } from "./features/auth/LoginForm";
import { SignupFormPage } from "features/auth/SignupForm";
import { SearchResultsList } from "features/search/SearchResults";
import MainLayout from "./app/mainLayout";
import { createBrowserRouter, Outlet } from "react-router-dom";
import { LeadFlowEditor } from "src/features/leadFlows/FlowEditorPage";
import { LeadNavigationProvider } from 'features/lead/stores/LeadNavigationContext';
import LeadProperties from "./features/leadProperties/leadPropertiesList";

export const router = createBrowserRouter([
    {
        path: "/login",
        element: (
            <LoginFormPage />
        ),
    },
    {
        path: "/signup",
        element: (
            <SignupFormPage />
        ),
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
                element: (
                    <LeadNavigationProvider>
                        <Outlet />
                    </LeadNavigationProvider>
                ),
                children: [
                    {
                        path: "/leads/",
                        element: <LeadListPage />
                    },
                    {
                        path: "/leads/new",
                        element: <CreateLeadFormPage />
                    },
                    {
                        path: "/leads/modify/:id",
                        element: <UpdateLeadFormPage />
                    },
                    {
                        path: "/leads/:id",
                        Component: LeadDetailsLayout
                    },
                ]
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
                path: "/organizations/",
                Component: OrganizationList
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