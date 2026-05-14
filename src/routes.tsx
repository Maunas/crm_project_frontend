import { NotFound } from "./pages/NotFound";
import { LeadDetailsLayout } from "features/lead/details/LeadDetails";
import { CampaignDetails } from "features/campaigns/CampaignDetails";
import { WorkspaceList } from "features/workspaces/WorkspaceList";
import { CreateLeadFormPage, UpdateLeadFormPage } from "features/lead/leadForm/LeadFormWraper";
import { LeadListPage } from "features/lead/leadList/LeadListPage";
import { OrganizationList } from "features/organizations/OrganizationList";
import { NomenclatorList } from "features/nomenclators/NomenclatorList";
import { NomenclatorItemList } from "features/nomenclators/NomenclatorItemList";
import { LoginFormPage } from "./features/auth/LoginForm";
import { SignupFormPage } from "features/auth/SignupForm";
import { SearchResultsList } from "features/search/SearchResults";
import { GenericContainer } from "shared/layout/container/GenericContainer";
import MainLayout from "./app/mainLayout";
import { createBrowserRouter, Outlet } from "react-router-dom";
import { LeadFlowEditor } from "features/leadFlows/LeadFlowEditor";
import { LeadNavigationProvider } from 'features/lead/stores/LeadNavigationContext';

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
                        element: <GenericContainer sx={{ minWidth: "85%" }}><LeadListPage /></GenericContainer>
                    },
                    {
                        path: "/leads/new",
                        element: <GenericContainer sx={{ minWidth: "85%" }}><CreateLeadFormPage /></GenericContainer>
                    },
                    {
                        path: "/leads/modify/:id",
                        element: <GenericContainer sx={{ minWidth: "85%" }}><UpdateLeadFormPage /></GenericContainer>
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
                path: "/nomenclators/:nomenclatorId",
                Component: NomenclatorItemList
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