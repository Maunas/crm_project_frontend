import { createBrowserRouter } from "react-router-dom";
import MainLayout from "./components/common/mainLayout";
import { NotFound } from "./pages/NotFound";
import { LeadDetailsLayout } from "./components/lead/details/LeadDetails";
import { CampaignDetails } from "./components/campaigns/CampaignDetails";
import { WorkspaceList } from "./components/workspaces/WorkspaceList";
import { GenericContainer } from "./components/common/layout/GenericContainer";
import { CreateLeadFormPage, UpdateLeadFormPage } from "./components/lead/leadForm/LeadFormWraper";
import { LeadListPage } from "./components/lead/leadTable/LeadListPage";
import { OrganizationList } from "./components/organizations/OrganizationList";
import { NomenclatorList } from "./components/nomenclators/NomenclatorList";
import { NomenclatorItemList } from "./components/nomenclators/NomenclatorItemList";
import { SearchResultsList } from "./components/common/SearchResults";
import { LoginFormPage } from "./components/users/LoginForm";
import { UserProvider } from "./components/users/UserProvider";
import { SignupFormPage } from "./components/users/SignupForm";
import { AutomationList } from "./components/fieldAutomation/AutomationList";
import { AutomationPage } from "./components/fieldAutomation/AutomationPage";

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
                element: <GenericContainer containerSx={{ minWidth: "85%" }}><LeadListPage /></GenericContainer>
            },
            {
                path: "/leads/new",
                element: <GenericContainer containerSx={{ minWidth: "85%" }}><CreateLeadFormPage /></GenericContainer>
            },
            {
                path: "/leads/modify/:id",
                element: <GenericContainer containerSx={{ minWidth: "85%" }}><UpdateLeadFormPage /></GenericContainer>
            },
            {
                path: "/leads/:id",
                Component: LeadDetailsLayout
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
                path: "*", //Si no coincide con nada más.
                Component: NotFound
            },
        ]
    }
])