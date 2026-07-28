import MainLayout from "../app/mainLayout";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { NotFound } from "src/pages/NotFound";
import { ROUTE_LIST_ROOT_PROCESSED, ROUTE_LIST_OUTLET } from "./routeListExports";

export const router = createBrowserRouter([
    ...ROUTE_LIST_ROOT_PROCESSED,
    {
        path: "/",
        Component: MainLayout,
        children: [
            { index: true, element: <Navigate to="/dashboard" replace />, },
            ...ROUTE_LIST_OUTLET,
            { path: "*", Component: NotFound }
        ]
    },
])
