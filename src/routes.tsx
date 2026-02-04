import { createBrowserRouter } from "react-router-dom";
import MainLayout from "./components/common/mainLayout";
import { NotFound } from "./pages/NotFound";
import { LeadDetails } from "./components/lead/LeadDetails";
import { CampaignForm, OrganizationForm, WorkspaceForm } from "./components/campaigns/CreateCampaign";
import { CampaignDetails } from "./components/campaigns/CampaignDetails";
import { CreateLeadFields } from "./components/leadFields/CreateLeadFields";
import { OrganizationList } from "./components/campaigns/CampaignList";
import { GenericContainer } from "./components/common/layout/GenericContainer";
import { CreateLead } from "./components/lead/LeadForm";

export const router = createBrowserRouter([
    {
        path: "/login",
        element: <div className="">Login</div>,
    },
    {
        path: "/signup",
        element: <div className="">Signup</div>,
    },
    {
        path: "/signup",
        element: <div className="">Signup</div>,
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
                path: "/leads/new",
                element: <GenericContainer containerSx={{minWidth:"85%"}}><CreateLead/></GenericContainer>
            },
            {
                path: "/leads/:id",
                Component: LeadDetails
            },
            {
                path: "/campaigns/",
                Component: OrganizationList
            },
            {
                path: "/campaigns/:id",
                Component: CampaignDetails
            },
            {
                path: "/campaigns/:id/new",
                Component: CreateLeadFields
            },
            {
                path: "/campaigns/new",
                element: <GenericContainer><CampaignForm/></GenericContainer>
            },
            {
                path: "/workspaces/new",
                element: <GenericContainer><WorkspaceForm/></GenericContainer>
            },
            {
                path: "/organizations/new",
                element: <GenericContainer><OrganizationForm/></GenericContainer>
            },
            {
                path: "*", //Si no coincide con nada más.
                Component: NotFound
            },
        ]
    }
])