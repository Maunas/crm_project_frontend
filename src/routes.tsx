import { createBrowserRouter } from "react-router-dom";
import MainLayout from "./components/common/mainLayout";
import { NotFound } from "./pages/NotFound";
import { LeadDetails } from "./components/lead/LeadDetails";
import { CampaignForm, OrganizationForm, WorkspaceForm } from "./components/campaigns/CampaignForms";
import { CampaignDetails } from "./components/campaigns/CampaignDetails";
import { WorkspaceList } from "./components/campaigns/CampaignList";
import { GenericContainer } from "./components/common/layout/GenericContainer";
import { CreateLead } from "./components/lead/LeadForm";
import { UpdateLead } from "./components/lead/UpdateLead";
import { LeadList } from "./components/lead/LeadList";
import { CreateLeadField, ModifyLeadField } from "./components/leadFields/ModifyLeadFields";
import { OrganizationList } from "./components/organizations/OrganizationList";

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
                path: "/leads",
                element: <GenericContainer containerSx={{ minWidth: "85%" }}><LeadList /></GenericContainer>
            },
            {
                path: "/leads/new",
                element: <GenericContainer containerSx={{ minWidth: "85%" }}><CreateLead /></GenericContainer>
            },
            {
                path: "/leads/modify/:id",
                element: <GenericContainer containerSx={{ minWidth: "85%" }}><UpdateLead /></GenericContainer>
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
                path: "/organizations/",
                Component: OrganizationList
            },
            {
                path: "/leadfield/new/:campaignId",
                Component: CreateLeadField
            },
            {
                path: "/leadfield/modify/:leadFieldId",
                Component: ModifyLeadField
            },
            {
                path: "/campaigns/:id",
                Component: CampaignDetails
            },
            {
                path: "/campaigns/new",
                element: <GenericContainer><CampaignForm /></GenericContainer>
            },
            {
                path: "/workspaces/new",
                element: <GenericContainer><WorkspaceForm /></GenericContainer>
            },
            {
                path: "/organizations/new",
                element: <GenericContainer><OrganizationForm /></GenericContainer>
            },
            {
                path: "*", //Si no coincide con nada más.
                Component: NotFound
            },
        ]
    }
])