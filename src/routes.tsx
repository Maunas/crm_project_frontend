import { createBrowserRouter } from "react-router-dom";
import MainLayout from "./components/common/mainLayout";
import { NotFound } from "./pages/NotFound";
import { LeadDetails } from "./components/lead/LeadDetails";
import { CreateCampaign } from "./components/campaigns/CreateCampaign";

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
                path: "/leads/:id",
                Component: LeadDetails
            },
            {
                path: "/campaigns/new",
                Component: CreateCampaign
            },
            {
                path: "*", //Si no coincide con nada más.
                Component: NotFound
            },
        ]
    }
])