import { LoginFormPage } from "src/features/auth/LoginForm";
import { SignupFormPage } from "src/features/auth/SignupForm";
import { OnboardingPage } from "src/pages/OnboardingPage";
import { ROUTE_LIST_OUTLET_PROCESSED, type RouteListProps } from "./routeList";

/** Lista de rutas que se muestran sin Navbar */
export const ROUTE_LIST_ROOT: RouteListProps[] = [
    { path: "/login", element: <LoginFormPage />, title: "Iniciar Sesión" },
    { path: "/signup", element: <SignupFormPage />, title: "Crear Cuenta" },
    { path: "/onboarding", element: <OnboardingPage />, title: "Onboarding" },
]

export const ROUTE_LIST_OUTLET: RouteListProps[] = ROUTE_LIST_OUTLET_PROCESSED

export const ROUTE_LIST_FULL = [...ROUTE_LIST_ROOT, ...ROUTE_LIST_OUTLET]

export const GLOBAL_NAVBAR = ROUTE_LIST_OUTLET.filter(i => i.globalNavbar)
export const REGULAR_NAVBAR = ROUTE_LIST_OUTLET.filter(i => i.regularNavbar)