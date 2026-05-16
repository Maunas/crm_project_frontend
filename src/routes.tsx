import { createBrowserRouter } from "react-router-dom";
import { NotFound } from "./pages/NotFound";
import { LeadDetailsLayout } from "./features/lead/details/LeadDetails";
import { CampaignDetails } from "./features/campaigns/CampaignDetails";
import { WorkspaceList } from "./features/workspaces/WorkspaceList";
import { CreateLeadFormPage, UpdateLeadFormPage } from "./features/lead/leadForm/LeadFormWraper";
import { LeadListPage } from "./features/lead/leadList/LeadListPage";
import { OrganizationList } from "./features/organizations/OrganizationList";
import { NomenclatorList } from "./features/nomenclators/NomenclatorList";
import { NomenclatorItemList } from "./features/nomenclators/NomenclatorItemList";
import { LoginFormPage } from "./features/auth/LoginForm";
import { UserProvider } from "src/stores/UserProvider";
import { SignupFormPage } from "./features/auth/SignupForm";
import { SearchResultsList } from "./features/search/SearchResults";
import { GenericContainer } from "./components/layout/container/GenericContainer";
import MainLayout from "./app/mainLayout";
import { ImportLeadsPage } from "./features/lead/ImportLeadsPage";

export const router = createBrowserRouter([
    {
        path: "/login",
        element: <UserProvider>
            <LoginFormPage />
        </UserProvider>
        ,
    },
    {
        path: "/signup",
        element: <UserProvider>
            <SignupFormPage />
        </UserProvider>
        ,
    },
    {
        //Layout principal
        path: "/",
        Component: MainLayout,
        children: [
            //Rutas dentro del layout
            {
                path: "/",
                element: <div>Home Test</div>
            },
            {
                path: "/leads",
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
                path: "*", //Si no coincide con nada más.
                Component: NotFound
            },
        ]
    }
])