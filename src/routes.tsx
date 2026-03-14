import { createBrowserRouter } from "react-router-dom";
import MainLayout from "./components/common/mainLayout";
import { NotFound } from "./pages/NotFound";
import { LeadDetails } from "./components/lead/LeadDetails";
import { CampaignDetails } from "./components/campaigns/CampaignDetails";
import { WorkspaceList } from "./components/workspaces/WorkspaceList";
import { GenericContainer } from "./components/common/layout/GenericContainer";
import { CreateLeadFormPage, UpdateLeadFormPage } from "./components/lead/LeadFormWraper";
import { LeadList } from "./components/lead/LeadList";
import { OrganizationList } from "./components/organizations/OrganizationList";
import { NomenclatorList } from "./components/nomenclators/NomenclatorList";
import { NomenclatorItemList } from "./components/nomenclators/NomenclatorItemList";
import { SearchResultsList } from "./components/common/SearchResults";
import { LoginForm } from "./components/users/LoginForm";
import { SignupForm } from "./components/users/SignupForm";
import { UserProvider } from "./components/users/UserProvider";

export const router = createBrowserRouter([
    {
        path: "/login",
        element: <UserProvider>
            <LoginForm />
        </UserProvider>
        ,
    },
    {
        path: "/signup",
        element: <UserProvider>
            <SignupForm />
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
                element: <GenericContainer containerSx={{ minWidth: "85%" }}><LeadList /></GenericContainer>
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
                Component: LeadDetails
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